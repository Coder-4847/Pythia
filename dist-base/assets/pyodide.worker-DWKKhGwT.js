async function e(e,t,n){let r=e=>{let t=new TextDecoder;return{isatty:!0,write:n=>(e(t.decode(n,{stream:!0})),n.length)}};e.setStdout(r(t.stdout)),e.setStderr(r(t.stderr)),e.FS.writeFile(`/pythia_runtime.py`,`"""Pythia's in-Pyodide runtime: runs learner code and reports what happened.

Loaded by the worker engine (see engine.ts). Everything crossing the JS boundary
is a string or a plain callable so the module can be unit-tested in Node.
"""
import base64
import builtins
import importlib
import io
import json
import linecache
import math
import os
import sys
import time
import traceback
import warnings

USER_DIR = "/home/pyodide"

# Matplotlib must never try to open a window. Figures are captured after each run.
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore", message="FigureCanvasAgg is non-interactive")

_read_line = None  # JS: (prompt) -> str | None   (blocks until the learner answers)
_was_cancelled = None  # JS: () -> bool            (True if Stop was pressed while waiting)
_emit_image = None  # JS: (base64_png) -> None
_scripted_input = None  # list of lines while a lesson test runs, else None


def configure(read_line, was_cancelled, emit_image):
    """Wire the JS host callbacks and replace input()/sys.stdin."""
    global _read_line, _was_cancelled, _emit_image
    _read_line, _was_cancelled, _emit_image = read_line, was_cancelled, emit_image
    builtins.input = _input
    sys.stdin = _Stdin()


def _input(prompt=""):
    sys.stdout.write(str(prompt))
    sys.stdout.flush()
    if _scripted_input is not None:
        if not _scripted_input:
            raise EOFError("EOF when reading a line: the program asked for more input than this test provides")
        line = _scripted_input.pop(0)
        sys.stdout.write(line + "\\n")  # echo the answer and Enter, as the console shows them
        return line
    line = _read_line(str(prompt))
    if not isinstance(line, str):  # JS null arrives as pyodide's jsnull, not None
        if _was_cancelled():
            raise KeyboardInterrupt()
        raise EOFError("EOF when reading a line")
    return line


class _Stdin(io.TextIOBase):
    """Just enough of sys.stdin for readline() and iteration."""

    def readable(self):
        return True

    def readline(self, size=-1):
        try:
            return _input("") + "\\n"
        except EOFError:
            return ""

    def __iter__(self):
        return self

    def __next__(self):
        line = self.readline()
        if not line:
            raise StopIteration
        return line


def _is_user_file(filename, names):
    return filename in names or filename.startswith(USER_DIR + "/")


def _display_name(filename):
    prefix = USER_DIR + "/"
    return filename[len(prefix):] if filename.startswith(prefix) else filename


def _describe(exc, names):
    """Turn an exception into a JSON-friendly dict with a learner-sized traceback."""
    frames = [f for f in traceback.extract_tb(exc.__traceback__) if _is_user_file(f.filename, names)]
    shown = [
        traceback.FrameSummary(_display_name(f.filename), f.lineno, f.name, lookup_line=True) for f in frames
    ]
    lines = []
    if shown:
        lines.append("Traceback (most recent call last):\\n")
        lines.extend(traceback.StackSummary.from_list(shown).format())
    lines.extend(traceback.format_exception_only(type(exc), exc))

    line, file = None, None
    if isinstance(exc, SyntaxError):
        line, file = exc.lineno, exc.filename
    elif frames:
        line, file = frames[-1].lineno, _display_name(frames[-1].filename)
    return {
        "type": type(exc).__name__,
        "message": str(exc),
        "traceback": "".join(lines).rstrip("\\n"),
        "line": line,
        "file": file and _display_name(file),
    }


def _reset_workspace(files):
    os.makedirs(USER_DIR, exist_ok=True)
    os.chdir(USER_DIR)
    if USER_DIR not in sys.path:
        sys.path.insert(0, USER_DIR)
    # Remove last run's modules and files so deleted/renamed tabs can't linger.
    for name, module in list(sys.modules.items()):
        path = getattr(module, "__file__", None)
        if path and path.startswith(USER_DIR + "/"):
            del sys.modules[name]
    for entry in os.listdir(USER_DIR):
        full = os.path.join(USER_DIR, entry)
        if os.path.isfile(full) and entry.endswith(".py"):
            os.remove(full)
    for name, source in files.items():
        target = os.path.join(USER_DIR, name)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as handle:
            handle.write(source)
        linecache.cache[name] = (len(source), None, source.splitlines(True), name)
    importlib.invalidate_caches()


def _flush_figures():
    """Send every open matplotlib figure to the console as a PNG, then close them."""
    pyplot = sys.modules.get("matplotlib.pyplot")
    if pyplot is None:
        return
    try:
        for number in pyplot.get_fignums():
            buffer = io.BytesIO()
            pyplot.figure(number).savefig(buffer, format="png", dpi=110, bbox_inches="tight")
            _emit_image(base64.b64encode(buffer.getvalue()).decode("ascii"))
        pyplot.close("all")
    except Exception:  # a broken plot must never hide the program's real result
        pass


def run(files_json, main):
    """Run \`main\` from the given {name: source} files. Returns a JSON string."""
    files = json.loads(files_json)
    names = set(files)
    _reset_workspace(files)
    namespace = {"__name__": "__main__", "__file__": main, "__builtins__": builtins}
    sys.argv = [main]
    started = time.perf_counter()
    result = {"ok": True}
    try:
        exec(compile(files[main], main, "exec"), namespace)
    except SystemExit:
        pass
    except BaseException as exc:  # includes KeyboardInterrupt from Stop
        result = {"ok": False, "error": _describe(exc, names)}
    finally:
        try:
            sys.stdout.flush()
            sys.stderr.flush()
        except Exception:
            pass
        _flush_figures()
    result["durationMs"] = round((time.perf_counter() - started) * 1000)
    return json.dumps(result)


# ───────────────────────── lesson test runner ─────────────────────────


class _Check(Exception):
    """Raised by a \`check\` test (via fail() or assert) with a learner-facing message."""


def _revive(value):
    """JSON → Python, with {"$tuple": ...}, {"$set": ...} and {"$dict": [[k, v], ...]} markers for what JSON lacks."""
    if isinstance(value, list):
        return [_revive(v) for v in value]
    if isinstance(value, dict):
        if set(value) == {"$tuple"}:
            return tuple(_revive(v) for v in value["$tuple"])
        if set(value) == {"$set"}:
            return {_revive(v) for v in value["$set"]}
        if set(value) == {"$dict"}:
            return {_revive(k): _revive(v) for k, v in value["$dict"]}
        return {k: _revive(v) for k, v in value.items()}
    return value


def _equal(a, b):
    """Equality that is tolerant of float rounding and does not confuse True with 1."""
    if isinstance(a, bool) != isinstance(b, bool):
        return False
    if isinstance(a, float) or isinstance(b, float):
        try:
            return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)
        except TypeError:
            return False
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return type(a) is type(b) and len(a) == len(b) and all(_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_equal(a[k], b[k]) for k in a)
    return a == b


def _normalise_output(text):
    return "\\n".join(line.rstrip() for line in text.rstrip("\\n").split("\\n"))


def _run_fresh(code, stdin):
    """Execute the learner's program in a clean namespace, capturing what it prints."""
    global _scripted_input
    namespace = {"__name__": "__main__", "__builtins__": builtins}
    buffer = io.StringIO()
    previous, _scripted_input = sys.stdout, list(stdin)
    sys.stdout = buffer
    try:
        exec(code, namespace)
    except SystemExit:
        pass
    finally:
        sys.stdout = previous
        _scripted_input = None
    return namespace, buffer.getvalue()


def _call_text(fn, args, kwargs):
    parts = [repr(a) for a in args] + [f"{k}={v!r}" for k, v in kwargs.items()]
    return f"{fn}({', '.join(parts)})"


def _type_note(expected, got):
    if type(expected) is not type(got) and not (isinstance(expected, (int, float)) and isinstance(got, (int, float))
                                                  and not isinstance(expected, bool) and not isinstance(got, bool)):
        return f" (that is a {type(got).__name__}, but a {type(expected).__name__} was expected)"
    return ""


def _check_call(test, namespace):
    fn, args = test["fn"], _revive(test.get("args", []))
    kwargs = _revive(test.get("kwargs", {}))
    if fn not in namespace:
        raise _Check(f"I can't find a function called \`{fn}\`. Define it with \`def {fn}(...):\`.")
    if not callable(namespace[fn]):
        raise _Check(f"\`{fn}\` exists, but it is not a function. Define it with \`def {fn}(...):\`.")
    call = _call_text(fn, args, kwargs)
    expected = _revive(test["expected"])
    try:
        got = namespace[fn](*args, **kwargs)
    except Exception as exc:  # the learner's function crashed
        frames = traceback.extract_tb(exc.__traceback__)
        where = f" (line {frames[-1].lineno} of your code)" if frames else ""
        raise _Check(f"\`{call}\` raised {type(exc).__name__}: {exc}{where}")
    if _equal(got, expected):
        return
    note = ""
    if got is None and expected is not None:
        note = " It returned \`None\`. Is there a \`return\` statement on every path?"
    raise _Check(f"\`{call}\` should return {expected!r}, but it returned {got!r}{_type_note(expected, got)}.{note}", repr(expected), repr(got))


def _check_output(test, out):
    expected, got = _normalise_output(test["expected"]), _normalise_output(out)
    if expected == got:
        return
    want_lines, got_lines = expected.split("\\n"), got.split("\\n")
    for index, (w, g) in enumerate(zip(want_lines, got_lines), start=1):
        if w != g:
            raise _Check(f"Line {index} of the output should be {w!r}, but it is {g!r}.", test["expected"], out)
    if len(got_lines) < len(want_lines):
        raise _Check(f"Your program printed {len(got_lines)} line(s), but {len(want_lines)} were expected.", test["expected"], out)
    raise _Check(f"Your program printed {len(got_lines)} line(s), but only {len(want_lines)} were expected.", test["expected"], out)


def _check_var(test, namespace):
    name, expected = test["variable"], _revive(test["expected"])
    if name not in namespace:
        raise _Check(f"I don't see a variable called \`{name}\`. Did you assign it with \`{name} = ...\`?")
    got = namespace[name]
    if not _equal(got, expected):
        raise _Check(f"\`{name}\` should be {expected!r}, but it is {got!r}{_type_note(expected, got)}.", repr(expected), repr(got))


def _check_code(test, namespace, out, source):
    def fail(message="Check failed"):
        raise _Check(str(message))

    scope = {"ns": namespace, "out": out, "src": source, "fail": fail, "equal": _equal, "__builtins__": builtins}
    try:
        exec(test["code"], scope)
    except _Check:
        raise
    except AssertionError as exc:
        raise _Check(str(exc) or f"This check did not pass: {test['name']}")
    except Exception as exc:
        raise _Check(f"While checking your code, {type(exc).__name__} happened: {exc}")


def _evaluate(test, code, source):
    """Run one test case. Returns (passed, message, expected, got)."""
    try:
        namespace, out = _run_fresh(code, test.get("stdin", []))
    except KeyboardInterrupt:
        raise
    except BaseException as exc:
        frames = traceback.extract_tb(exc.__traceback__)
        user = [f for f in frames if f.filename == code.co_filename]
        where = f" on line {user[-1].lineno}" if user else ""
        return False, f"Your program stopped with {type(exc).__name__}: {exc}{where}.", None, None
    try:
        kind = test["kind"]
        if kind == "call":
            _check_call(test, namespace)
        elif kind == "output":
            _check_output(test, out)
        elif kind == "var":
            _check_var(test, namespace)
        else:
            _check_code(test, namespace, out, source)
    except _Check as failure:
        args = failure.args
        return False, args[0], (args[1] if len(args) > 2 else None), (args[2] if len(args) > 2 else None)
    return True, None, None, None


def run_tests(files_json, main, tests_json):
    """Run lesson tests against the learner's code. Returns a JSON report string."""
    files, tests = json.loads(files_json), json.loads(tests_json)
    _reset_workspace(files)
    sys.argv = [main]
    started = time.perf_counter()
    try:
        code = compile(files[main], main, "exec")
    except SyntaxError as exc:
        return json.dumps({"error": _describe(exc, set(files)), "results": [], "durationMs": 0})

    results = []
    for test in tests:
        hidden = bool(test.get("hidden"))
        try:
            passed, message, expected, got = _evaluate(test, code, files[main])
        except KeyboardInterrupt:
            return json.dumps({"error": None, "results": results, "durationMs": 0, "stopped": True})
        if not passed and hidden:
            message = test.get("hint") or "This hidden test did not pass. Think about edge cases: empty inputs, zero, negatives, repeats."
            expected = got = None
        elif not passed and test.get("hint"):
            message = f"{message} Hint: {test['hint']}"
        results.append({
            "name": test["name"], "hidden": hidden, "passed": passed,
            "message": message, "expected": expected, "got": got,
        })
    return json.dumps({"error": None, "results": results, "durationMs": round((time.perf_counter() - started) * 1000)})
`),e.runPython(`import sys; sys.path.insert(0, '/')`),n&&e.unpackArchive(new Uint8Array(n),`wheel`),e.FS.writeFile(`/pythia_analyze.py`,`"""Pythia's local bug prediction: syntax check, pyflakes, and beginner-trap rules.

\`analyze(code)\` returns a JSON list of diagnostics. Each carries a guiding *question* (never the
fix), a concrete *hint* and a full *explanation*, revealed one rung at a time by the UI.
Levels control chattiness: 1 = essential (a certain crash), 2 = helpful (a likely bug),
3 = chatty (style and tidiness). Pure Python, no JS boundary, so it is easy to test.
"""
import ast
import builtins
import json
import re

SHADOWABLE = {
    "list", "dict", "set", "str", "int", "float", "bool", "tuple", "sum", "min", "max", "len", "input",
    "print", "range", "type", "id", "sorted", "map", "filter", "zip", "abs", "round", "open", "all", "any",
    "next", "iter", "object", "format", "hash", "dir", "vars", "enumerate", "reversed", "pow", "bytes",
}
COMMON_SHADOWS = {"list", "dict", "set", "str", "int", "float", "sum", "min", "max", "len", "input", "print", "type", "id", "sorted", "range"}
INPLACE_METHODS = {"append", "sort", "extend", "insert", "reverse", "remove", "clear", "add", "update", "discard"}
MUTATING_ITER = {"remove", "append", "insert", "pop", "extend", "clear"}
STR_METHODS = {"upper", "lower", "strip", "lstrip", "rstrip", "replace", "title", "capitalize", "swapcase", "join", "split", "format", "zfill", "center", "ljust", "rjust"}
METHOD_NAMES = STR_METHODS | INPLACE_METHODS | {"count", "index", "find", "keys", "values", "items", "get", "copy", "pop", "startswith", "endswith", "isdigit", "isalpha"}
PURE_BUILTINS = {"len", "sorted", "int", "float", "str", "abs", "round", "sum", "min", "max", "list", "set", "dict", "tuple", "reversed"}
NUMERIC_CALLS = {"int", "float", "len", "sum", "round", "abs"}
CLASS_NAMES = {"str", "list", "dict", "set", "int", "float", "tuple", "bytes"}


def diag(rule, line, level, category, question, hint, explanation, col=0):
    return {
        "id": f"{rule}:{line}", "rule": rule, "line": line, "col": col, "level": level, "category": category,
        "question": question, "hint": hint, "explanation": explanation, "source": "local",
    }


# ───────────────────────────── syntax ─────────────────────────────

SYNTAX_PATTERNS = [
    (r"expected ':'", "syntax-colon",
     "Which character must end a line that opens a block, like \`if\`, \`for\`, \`while\` or \`def\`?",
     "Look at the end of the line Python points to: something that starts a block is missing its closing mark.",
     "Lines that open a block (\`if\`, \`elif\`, \`else\`, \`for\`, \`while\`, \`def\`, \`class\`, \`try\`...) must end with a colon \`:\`, and the lines inside are indented."),
    (r"unterminated string literal|unterminated triple", "syntax-string",
     "Which quote opens this string, and where is its matching partner?",
     "Count the quote marks on that line. Each opening quote needs a closing one of the same kind.",
     "A string must be closed by the same kind of quote that opened it, on the same line (unless it uses triple quotes)."),
    (r"'.' was never closed", "syntax-bracket",
     "Which bracket on this line (or just above it) is still waiting for its partner?",
     "Walk through the line and match every opening bracket \`(\`, \`[\`, \`{\` with a closing one.",
     "Every opening bracket needs a matching closing bracket. Python reports the bracket that never got one."),
    (r"unmatched '.'|closing parenthesis '.' does not match", "syntax-unmatched",
     "Which opening bracket does this closing one belong to?",
     "Check that brackets close in the opposite order they opened, and that the kinds match.",
     "Brackets nest like boxes inside boxes: the one opened last must be closed first, with the matching kind of bracket."),
    (r"Maybe you meant '==' or ':=' instead of '='|cannot assign to .* here\\. Maybe you meant '=='", "syntax-assign-compare",
     "Are you asking whether two things are equal here, or storing a value? How many equals signs does each need?",
     "In a condition you want to compare, not assign. Compare the number of equals signs in \`x = 5\` and \`x == 5\`.",
     "One \`=\` stores a value; two \`==\` ask whether two values are equal. A condition (\`if\`, \`while\`) asks a question, so it needs \`==\`."),
    (r"Missing parentheses in call to 'print'", "syntax-print",
     "In Python 3, is \`print\` a keyword, or a function you call?",
     "Functions are called with parentheses around their arguments.",
     "\`print\` is a function, so write \`print(...)\` with the value to show inside the parentheses."),
    (r"expected an indented block", "syntax-indent-missing",
     "Which lines belong inside this block, and how far should they be indented?",
     "The line after a block-opening line must be indented further than it.",
     "After a line that opens a block (ending in \`:\`), at least one following line must be indented to show what belongs inside."),
    (r"unexpected indent", "syntax-indent-extra",
     "Does this line belong to the block above it? What would line it up with its neighbours?",
     "Compare the spaces at the start of this line with the line above.",
     "A line may only be indented more than the previous one when the previous line opens a block."),
    (r"unindent does not match|inconsistent use of tabs", "syntax-indent-mismatch",
     "Which earlier line should this one line up with?",
     "Lines in the same block need exactly the same indentation. Mixing tabs and spaces causes this too.",
     "Every line of a block must be indented by the same amount. Python can't tell which block this line belongs to."),
    (r"invalid decimal literal|invalid syntax\\. Perhaps you forgot a comma", "syntax-comma",
     "Is anything missing between these two items: a comma, an operator, or a space?",
     "Look at where Python stopped: two values may be touching without something between them.",
     "Items in a list, call or tuple are separated by commas, and values are combined with operators."),
]


def syntax_diag(exc):
    line = exc.lineno or 1
    message = exc.msg or ""
    for pattern, rule, question, hint, explanation in SYNTAX_PATTERNS:
        if re.search(pattern, message):
            return diag(rule, line, 1, "syntax", question, hint, explanation, (exc.offset or 1) - 1)
    return diag(
        "syntax-other", line, 1, "syntax",
        "What does Python expect to see right where it stopped reading?",
        f"Python says: {message}. Look at the character just before the spot it points to.",
        f"Python could not understand this line ({message}). Check brackets, quotes, colons and spelling around it.",
        (exc.offset or 1) - 1,
    )


# ───────────────────────────── helpers ─────────────────────────────

def link_parents(tree):
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            child._parent = node


def names_in(node):
    return {n.id for n in ast.walk(node) if isinstance(n, ast.Name)}


def is_call_to(node, name):
    return isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == name


def enclosing_scope(node):
    while hasattr(node, "_parent"):
        node = node._parent
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            return node
    return None


def const_num(node):
    return isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and not isinstance(node.value, bool)


def infer_type(node):
    """A very small type guess for an expression: 'str', 'num' or None (unknown)."""
    if isinstance(node, ast.Constant):
        if isinstance(node.value, str):
            return "str"
        if const_num(node):
            return "num"
    if isinstance(node, ast.JoinedStr):
        return "str"
    if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Sub, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow)):
        return "num"
    if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Mult)):
        left, right = infer_type(node.left), infer_type(node.right)
        return left if left == right else None
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        if node.func.id in NUMERIC_CALLS:
            return "num"
        if node.func.id in ("str", "input"):
            return "str"
    return None


def build_env(tree):
    """Simple assignments per (scope, name): [(line, kind)], kind in 'input' / 'str' / 'num' / 'other'."""
    env = {}
    for node in ast.walk(tree):
        targets = []
        if isinstance(node, ast.Assign):
            targets = [(t.id, node.value) for t in node.targets if isinstance(t, ast.Name)]
        elif isinstance(node, ast.AugAssign) and isinstance(node.target, ast.Name):
            targets = [(node.target.id, None)]
        elif isinstance(node, ast.For):
            targets = [(n.id, None) for n in ast.walk(node.target) if isinstance(n, ast.Name)]
        for name, value in targets:
            if value is None:
                kind = "other"
            elif is_call_to(value, "input"):
                kind = "input"
            else:
                kind = infer_type(value) or "other"
            env.setdefault((enclosing_scope(node), name), []).append((node.lineno, kind))
    for events in env.values():
        events.sort()
    return env


def last_assigned(env, name, line):
    events = _current_env.get(("any", name))
    return None


def kind_at(env, node, name):
    """Kind of the latest simple assignment to \`name\` on an earlier line in the same scope, or None."""
    best = None
    for line, kind in env.get((enclosing_scope(node), name), []):
        if line < node.lineno:
            best = kind
    return best


# ───────────────────────────── rules ─────────────────────────────

def rule_range_goal(tree, code, out):
    """\`range(1, 10)\` next to text that says "1 to 10": the classic off-by-one."""
    goals = set()
    for match in re.finditer(r"\\b(\\d+)\\s*(?:to|through|\\.\\.|-|–)\\s*(\\d+)\\b", code):
        goals.add((int(match.group(1)), int(match.group(2))))
    if not goals:
        return
    for node in ast.walk(tree):
        if isinstance(node, ast.For) and is_call_to(node.iter, "range"):
            args = node.iter.args
            if len(args) == 2 and all(isinstance(a, ast.Constant) and isinstance(a.value, int) for a in args):
                lo, hi = args[0].value, args[1].value
                if (lo, hi) in goals:
                    var = node.target.id if isinstance(node.target, ast.Name) else "the loop variable"
                    out.append(diag(
                        "range-last", node.lineno, 2, "logic",
                        f"What do you expect \`{var}\` to be on the last loop?",
                        f"\`range({lo}, {hi})\` stops *before* {hi}. Does your text say the last value should be {hi}?",
                        f"\`range(start, stop)\` never includes \`stop\`, so \`range({lo}, {hi})\` ends at {hi - 1}. Your program's text talks about {lo} to {hi}, which means the last value is meant to be included.",
                        node.col_offset,
                    ))


def rule_len_index(tree, out):
    """Indexing past the end: range(len(x) + 1), \`while i <= len(x)\`, or x[i + 1] inside range(len(x))."""
    for node in ast.walk(tree):
        if isinstance(node, ast.For) and isinstance(node.target, ast.Name) and is_call_to(node.iter, "range") and len(node.iter.args) == 1:
            arg, var = node.iter.args[0], node.target.id
            seq = None
            plus = 0
            if isinstance(arg, ast.BinOp) and isinstance(arg.op, ast.Add) and is_call_to(arg.left, "len") and const_num(arg.right):
                if isinstance(arg.left.args[0], ast.Name):
                    seq, plus = arg.left.args[0].id, arg.right.value
            elif is_call_to(arg, "len") and isinstance(arg.args[0], ast.Name):
                seq = arg.args[0].id
            if seq is None:
                continue
            for sub in ast.walk(node):
                if isinstance(sub, ast.Subscript) and isinstance(sub.value, ast.Name) and sub.value.id == seq:
                    index = sub.slice
                    if plus >= 1 and isinstance(index, ast.Name) and index.id == var:
                        out.append(diag(
                            "index-past-end", node.lineno, 2, "logic",
                            f"How many items does \`{seq}\` have, and what is the last index that actually exists?",
                            f"Indexes start at 0, so a list with n items stops at index n - 1. What is \`{var}\` on the final round here?",
                            f"\`range(len({seq}) + 1)\` produces one number too many: on the last round \`{var}\` equals \`len({seq})\`, and \`{seq}[{var}]\` is an IndexError.",
                            node.col_offset,
                        ))
                        break
                    if plus == 0 and isinstance(index, ast.BinOp) and isinstance(index.op, ast.Add) and isinstance(index.left, ast.Name) and index.left.id == var and const_num(index.right) and index.right.value >= 1:
                        out.append(diag(
                            "index-past-end", sub.lineno, 2, "logic",
                            f"On the very last round, what is \`{var}\`, and does \`{seq}[{var} + {index.right.value}]\` exist then?",
                            f"When \`{var}\` is the last valid index, adding {index.right.value} points past the end of \`{seq}\`.",
                            f"Looking one item ahead (\`{var} + {index.right.value}\`) fails on the last round, because there is no item after the last one. Either stop the loop one round earlier or check before looking ahead.",
                            sub.col_offset,
                        ))
                        break
        if isinstance(node, ast.While) and isinstance(node.test, ast.Compare) and len(node.test.ops) == 1 and isinstance(node.test.ops[0], ast.LtE):
            left, right = node.test.left, node.test.comparators[0]
            if isinstance(left, ast.Name) and is_call_to(right, "len") and isinstance(right.args[0], ast.Name):
                seq, var = right.args[0].id, left.id
                if any(isinstance(s, ast.Subscript) and isinstance(s.value, ast.Name) and s.value.id == seq and isinstance(s.slice, ast.Name) and s.slice.id == var for s in ast.walk(node)):
                    out.append(diag(
                        "index-past-end", node.lineno, 2, "logic",
                        f"How many items does \`{seq}\` have, and what is the last index that exists?",
                        f"The condition lets \`{var}\` reach \`len({seq})\`. Is that a valid index?",
                        f"\`{var} <= len({seq})\` allows \`{var}\` to equal \`len({seq})\`, one past the last valid index, so \`{seq}[{var}]\` raises an IndexError.",
                        node.col_offset,
                    ))


def rule_comparison_statement(tree, out):
    for node in ast.walk(tree):
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Compare):
            out.append(diag(
                "useless-comparison", node.lineno, 2, "logic",
                "This line asks a question, but what happens to the True/False answer?",
                "A comparison on its own line changes nothing. Did you mean to store a value, or to use the answer in an \`if\`?",
                "\`x == 5\` produces \`True\` or \`False\` and then throws it away. To store a value use \`=\`; to act on the answer use \`if x == 5:\`.",
                node.col_offset,
            ))
        elif isinstance(node, ast.Compare) and any(isinstance(op, (ast.Is, ast.IsNot)) for op in node.ops):
            operands = [node.left, *node.comparators]
            if any(isinstance(o, ast.Constant) and isinstance(o.value, (int, float, str)) and not isinstance(o.value, bool) for o in operands):
                out.append(diag(
                    "is-literal", node.lineno, 2, "logic",
                    "\`is\` and \`==\` ask different questions. Which one do you mean here?",
                    "One compares whether two names point at the very same object; the other compares values.",
                    "Use \`==\` to compare numbers and text. \`is\` checks identity, which can be false even for equal values.",
                    node.col_offset,
                ))


def following_siblings(stmt):
    """Statements after \`stmt\` in the same block."""
    parent = getattr(stmt, "_parent", None)
    for field in ("body", "orelse", "finalbody"):
        block = getattr(parent, field, None)
        if isinstance(block, list) and stmt in block:
            return block[block.index(stmt) + 1:]
    return []


def rule_mutate_while_iterating(tree, out):
    for node in ast.walk(tree):
        if not (isinstance(node, ast.For) and isinstance(node.iter, ast.Name)):
            continue
        name = node.iter.id
        for sub in ast.walk(node):
            if sub is node:
                continue
            is_method = isinstance(sub, ast.Call) and isinstance(sub.func, ast.Attribute) and isinstance(sub.func.value, ast.Name) and sub.func.value.id == name and sub.func.attr in MUTATING_ITER
            is_del = isinstance(sub, ast.Delete) and any(isinstance(t, ast.Subscript) and isinstance(t.value, ast.Name) and t.value.id == name for t in sub.targets)
            if not (is_method or is_del):
                continue
            stmt = sub
            while not isinstance(getattr(stmt, "_parent", None), (ast.For, ast.While, ast.If, ast.Try, ast.With, ast.FunctionDef, ast.Module)):
                stmt = stmt._parent
            # "find it, change it, stop" is safe: the loop ends before it can misbehave.
            if any(isinstance(s, (ast.Break, ast.Return)) for s in following_siblings(stmt)):
                continue
            out.append(diag(
                "mutate-while-iterating", sub.lineno, 2, "logic",
                f"What happens to the positions of the items still waiting in \`{name}\` when you change it while the loop is walking through it?",
                f"The loop keeps its place by position. If \`{name}\` shrinks or grows underneath it, which items might it skip or visit twice?",
                f"Changing \`{name}\` while looping over it makes the loop skip items (after a removal) or never finish (after an append). Loop over a copy, or build a new list of what you want to keep.",
                sub.col_offset,
            ))
            break


def always_returns(stmts):
    for stmt in stmts:
        if isinstance(stmt, (ast.Return, ast.Raise)):
            return True
        if isinstance(stmt, ast.If) and stmt.orelse and always_returns(stmt.body) and always_returns(stmt.orelse):
            return True
        if isinstance(stmt, ast.Try):
            if (always_returns(stmt.body) or (stmt.orelse and always_returns(stmt.orelse))) and all(always_returns(h.body) for h in stmt.handlers):
                return True
            if stmt.finalbody and always_returns(stmt.finalbody):
                return True
        if isinstance(stmt, (ast.With,)) and always_returns(stmt.body):
            return True
        if isinstance(stmt, ast.While) and isinstance(stmt.test, ast.Constant) and stmt.test.value is True and not any(isinstance(n, ast.Break) for n in ast.walk(stmt)):
            return True
    return False


def returns_value(fn):
    """Does this function contain \`return <something>\` (not a bare return)?"""
    return any(isinstance(n, ast.Return) and n.value is not None for n in ast.walk(fn) if enclosing_scope(n) is fn)


def rule_functions(tree, out):
    functions = {n.name: n for n in tree.body if isinstance(n, ast.FunctionDef)}
    duplicates = [n.name for n in tree.body if isinstance(n, ast.FunctionDef)]
    for fn in ast.walk(tree):
        if not isinstance(fn, ast.FunctionDef):
            continue
        has_yield = any(isinstance(n, (ast.Yield, ast.YieldFrom)) for n in ast.walk(fn) if enclosing_scope(n) is fn)
        stub = all(isinstance(s, ast.Pass) or (isinstance(s, ast.Expr) and isinstance(s.value, ast.Constant)) for s in fn.body)
        if has_yield or stub:
            continue
        if returns_value(fn) and not always_returns(fn.body):
            last = fn.body[-1]
            level = 2 if isinstance(last, (ast.If, ast.Try)) else 3
            out.append(diag(
                "missing-return", fn.lineno, level, "logic",
                f"What does \`{fn.name}\` give back when none of its \`return\` lines run?",
                "Follow the path through the function where every \`if\` is false (or the loop finds nothing). Which line ends it?",
                f"If no \`return\` runs, Python quietly returns \`None\`. Make sure every way through \`{fn.name}\` ends in a \`return\` (or decide that \`None\` really is the right answer).",
                fn.col_offset,
            ))
        # mutable default arguments
        defaults = list(fn.args.defaults) + [d for d in fn.args.kw_defaults if d is not None]
        names = [a.arg for a in fn.args.args][-len(fn.args.defaults):] if fn.args.defaults else []
        for default in defaults:
            if isinstance(default, (ast.List, ast.Dict, ast.Set)) or (isinstance(default, ast.Call) and isinstance(default.func, ast.Name) and default.func.id in ("list", "dict", "set")):
                arg = names[defaults.index(default)] if defaults.index(default) < len(names) else "the parameter"
                out.append(diag(
                    "mutable-default", default.lineno, 2, "logic",
                    f"If you call \`{fn.name}\` twice without passing \`{arg}\`, does the second call start from an empty collection?",
                    "A default value is created once, when the \`def\` runs, not each time the function is called.",
                    f"The default \`{arg}\` is one shared object that is reused (and keeps its changes) on every call. Use \`None\` as the default and create a fresh collection inside the function.",
                    default.col_offset,
                ))
    # calling something that returns nothing and using the result
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in functions and duplicates.count(node.func.id) == 1:
            target = functions[node.func.id]
            parent = getattr(node, "_parent", None)
            uses_value = isinstance(parent, (ast.Assign, ast.BinOp, ast.Compare, ast.Return, ast.AugAssign)) or (isinstance(parent, ast.Call) and node in parent.args and isinstance(parent.func, ast.Name) and parent.func.id in ("print", "len", "sum", "int", "str", "float"))
            has_yield = any(isinstance(n, (ast.Yield, ast.YieldFrom)) for n in ast.walk(target))
            if uses_value and not has_yield and not returns_value(target) and not any(isinstance(d, ast.expr) for d in target.decorator_list):
                out.append(diag(
                    "uses-none-result", node.lineno, 2, "logic",
                    f"\`{node.func.id}\` never returns a value. What will be stored or printed from this call?",
                    f"Look inside \`{node.func.id}\`: does it have a \`return\` line, or does it only print?",
                    f"A function with no \`return\` gives back \`None\`. Printing inside a function shows something on screen but doesn't hand a value to the caller. Add \`return\` for the value you want to use.",
                    node.col_offset,
                ))
    # wrong number of arguments for functions defined in this program
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in functions and duplicates.count(node.func.id) == 1:
            fn = functions[node.func.id]
            a = fn.args
            if a.vararg or a.kwarg or fn.decorator_list or any(isinstance(x, ast.Starred) for x in node.args) or any(k.arg is None for k in node.keywords):
                continue
            params = [p.arg for p in a.posonlyargs + a.args]
            required = len(params) - len(a.defaults)
            given = len(node.args) + len([k for k in node.keywords if k.arg in params])
            kw_only_ok = {p.arg for p in a.kwonlyargs}
            if any(k.arg not in params and k.arg not in kw_only_ok for k in node.keywords):
                continue
            if len(node.args) > len(params) or given < required:
                out.append(diag(
                    "call-arity", node.lineno, 1, "type",
                    f"How many values does \`{fn.name}\` ask for in its definition, and how many does this call give it?",
                    f"Compare the parentheses of \`def {fn.name}(...)\` with the parentheses of this call.",
                    f"\`{fn.name}\` takes {required if required == len(params) else f'{required} to {len(params)}'} argument(s), but this call passes {given}. That is a TypeError.",
                    node.col_offset,
                ))


def rule_int_division(tree, out):
    for node in ast.walk(tree):
        if isinstance(node, ast.Subscript) and isinstance(node.slice, ast.BinOp) and isinstance(node.slice.op, ast.Div):
            out.append(diag(
                "float-index", node.lineno, 1, "type",
                "What type does \`/\` always produce, and what type may an index be?",
                "Even when the answer looks whole (like 4.0), \`/\` gives a float. Which operator keeps only the whole part?",
                "\`/\` always returns a float, and lists, strings and \`range\` only accept whole numbers. Use \`//\` for a whole-number result.",
                node.col_offset,
            ))
        if is_call_to(node, "range") and any(isinstance(a, ast.BinOp) and isinstance(a.op, ast.Div) for a in node.args):
            out.append(diag(
                "float-range", node.lineno, 1, "type",
                "What type does \`/\` always produce, and what type does \`range\` accept?",
                "\`range\` needs whole numbers. Which operator divides and keeps only the whole part?",
                "\`/\` always returns a float, even for \`10 / 2\` (which is \`5.0\`), and \`range\` raises a TypeError for floats. Use \`//\` for whole-number division.",
                node.col_offset,
            ))
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.BinOp) and isinstance(node.value.op, ast.FloorDiv):
            for t in node.targets:
                if isinstance(t, ast.Name) and re.search(r"average|mean|avg|percent|ratio|rate", t.id, re.I):
                    out.append(diag(
                        "floor-average", node.lineno, 2, "logic",
                        f"Should \`{t.id}\` lose its decimal part? What does \`//\` do to the answer?",
                        "Compare \`7 / 2\` with \`7 // 2\`.",
                        f"\`//\` throws away the fractional part, so \`{t.id}\` will be rounded down. Use \`/\` if you want the exact value.",
                        node.col_offset,
                    ))
        if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)) and isinstance(node.right, ast.Constant) and node.right.value == 0 and not isinstance(node.right.value, bool):
            out.append(diag(
                "divide-by-zero", node.lineno, 1, "logic",
                "What happens when a number is divided by zero?",
                "The right-hand side of this division is the literal 0.",
                "Dividing by zero raises a ZeroDivisionError. Check what the divisor really should be.",
                node.col_offset,
            ))


def rule_shadowing(tree, out):
    seen = set()

    def flag(name, node):
        if name in SHADOWABLE and (name, node.lineno) not in seen:
            seen.add((name, node.lineno))
            level = 2 if name in COMMON_SHADOWS else 3
            out.append(diag(
                "shadow-builtin", node.lineno, level, "style",
                f"\`{name}\` is already a name Python uses. What happens to the original \`{name}\` once you reuse it?",
                f"After this line, what would \`{name}(...)\` mean later in the program?",
                f"Python already has a built-in called \`{name}\`. Assigning to that name hides it for the rest of the scope, so a later \`{name}(...)\` call may fail. Pick a more specific name.",
                getattr(node, "col_offset", 0),
            ))

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for t in node.targets:
                for n in ast.walk(t):
                    if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
                        flag(n.id, n)
        elif isinstance(node, ast.For):
            for n in ast.walk(node.target):
                if isinstance(n, ast.Name):
                    flag(n.id, n)
        elif isinstance(node, ast.FunctionDef):
            flag(node.name, node)
            for a in node.args.args + node.args.kwonlyargs:
                flag(a.arg, a)


def block_lists(tree):
    for node in ast.walk(tree):
        for field in ("body", "orelse", "finalbody"):
            stmts = getattr(node, field, None)
            if isinstance(stmts, list) and stmts and isinstance(stmts[0], ast.stmt):
                yield stmts


def rule_unreachable(tree, out):
    for stmts in block_lists(tree):
        for i, stmt in enumerate(stmts[:-1]):
            stop = isinstance(stmt, (ast.Return, ast.Raise, ast.Break, ast.Continue)) or (
                isinstance(stmt, ast.While) and isinstance(stmt.test, ast.Constant) and stmt.test.value is True
                and not any(isinstance(n, ast.Break) for n in ast.walk(stmt))
            )
            if stop:
                nxt = stmts[i + 1]
                if isinstance(nxt, ast.FunctionDef):
                    continue
                kind = type(stmt).__name__.lower()
                out.append(diag(
                    "unreachable", nxt.lineno, 2, "logic",
                    "Will Python ever get to this line? What comes right before it?",
                    f"The line above is a \`{kind}\`" + (" loop that never ends." if kind == "while" else ", which ends this block immediately."),
                    "Statements after \`return\`, \`raise\`, \`break\` or \`continue\` (or after a loop that never ends) can never run. Move them before it, or remove them.",
                    nxt.col_offset,
                ))
                break


def rule_input_types(tree, env, out):
    for node in ast.walk(tree):
        if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Sub, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow)):
            for a, b in ((node.left, node.right), (node.right, node.left)):
                if isinstance(a, ast.Name) and kind_at(env, node, a.id) == "input" and const_num(b):
                    if isinstance(node.op, ast.Mod) and a is node.right:
                        continue
                    out.append(diag(
                        "input-is-text", node.lineno, 1, "type",
                        f"What type does \`input()\` hand back, and what type does this arithmetic need for \`{a.id}\`?",
                        f"Whatever the user types, \`input()\` returns text. Is there a conversion between \`input()\` and \`{a.id}\`'s use here?",
                        f"\`{a.id}\` holds text (a \`str\`), even if the user typed digits, so combining it with a number raises a TypeError. Convert it first with \`int()\` or \`float()\`.",
                        node.col_offset,
                    ))
                    break
        if isinstance(node, ast.Compare) and len(node.ops) == 1:
            a, b = node.left, node.comparators[0]
            for x, y in ((a, b), (b, a)):
                if isinstance(x, ast.Name) and kind_at(env, node, x.id) == "input" and const_num(y):
                    ordering = isinstance(node.ops[0], (ast.Lt, ast.Gt, ast.LtE, ast.GtE))
                    out.append(diag(
                        "input-is-text", node.lineno, 1 if ordering else 2, "type",
                        f"What type is \`{x.id}\` right now: the text the user typed, or a number?",
                        f"\`input()\` always returns text. Comparing text with the number {y.value} can never be what you want.",
                        f"\`{x.id}\` is a string, and a string is never equal to a number (and can't be ordered against one). Convert with \`int()\` or \`float()\` before comparing.",
                        node.col_offset,
                    ))
                    break
        if is_call_to(node, "range"):
            for arg in node.args:
                if isinstance(arg, ast.Name) and kind_at(env, node, arg.id) == "input":
                    out.append(diag(
                        "input-is-text", node.lineno, 1, "type",
                        f"What type is \`{arg.id}\`, and what type must \`range\` receive?",
                        "\`input()\` returns text; \`range\` needs a whole number.",
                        f"\`{arg.id}\` is text from \`input()\`. Convert it with \`int()\` before using it in \`range\`.",
                        node.col_offset,
                    ))
                    break


def rule_text_plus_number(tree, env, out):
    for node in ast.walk(tree):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            kinds = []
            for side in (node.left, node.right):
                if isinstance(side, ast.Name):
                    kind = kind_at(env, node, side.id)
                    kinds.append("str" if kind in ("input", "str") else ("num" if kind == "num" else None))
                else:
                    kinds.append(infer_type(side))
            if sorted(k or "" for k in kinds) == ["num", "str"]:
                numeric = node.left if kinds[0] == "num" else node.right
                label = f"\`{numeric.id}\`" if isinstance(numeric, ast.Name) else "the number"
                out.append(diag(
                    "text-plus-number", node.lineno, 1, "type",
                    f"What type is {label}, and what does \`+\` need from both sides when one side is text?",
                    "\`+\` joins text with text and adds number to number. It will not mix the two.",
                    f"Joining text and a number with \`+\` raises a TypeError. Convert the number with \`str(...)\`, or use an f-string.",
                    node.col_offset,
                ))


def rule_methods(tree, out):
    for node in ast.walk(tree):
        # x = x.append(...)  /  y = x.sort()
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Attribute) and node.value.func.attr in INPLACE_METHODS:
            name = node.targets[0].id if isinstance(node.targets[0], ast.Name) else "the variable"
            method = node.value.func.attr
            out.append(diag(
                "assigns-none", node.lineno, 2, "logic",
                f"What does \`{method}\` give back, and so what ends up in \`{name}\`?",
                f"\`{method}\` changes the collection in place. Does a method that changes something in place also return it?",
                f"\`{method}\` modifies the collection itself and returns \`None\`, so \`{name}\` becomes \`None\`. Call it on its own line without assigning the result.",
                node.col_offset,
            ))
        # name.upper  (never called)
        if isinstance(node, ast.Attribute) and node.attr in METHOD_NAMES and isinstance(node.ctx, ast.Load):
            parent = getattr(node, "_parent", None)
            if isinstance(parent, ast.Call) and parent.func is node:
                continue
            if isinstance(node.value, ast.Name) and node.value.id in CLASS_NAMES:
                continue
            if isinstance(parent, (ast.keyword, ast.Call, ast.Attribute, ast.Lambda)):
                continue
            if isinstance(parent, (ast.Expr, ast.Assign, ast.BinOp, ast.Compare, ast.JoinedStr, ast.FormattedValue)):
                out.append(diag(
                    "method-not-called", node.lineno, 2, "logic",
                    f"Is \`{node.attr}\` being called here, or only mentioned? What do parentheses do?",
                    f"Compare \`value.{node.attr}\` with \`value.{node.attr}()\`.",
                    f"\`.{node.attr}\` without parentheses refers to the method itself instead of running it. Add \`()\` (and any arguments) to call it.",
                    node.col_offset,
                ))
        # str methods whose result is thrown away
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call = node.value
            if isinstance(call.func, ast.Attribute) and call.func.attr in STR_METHODS and isinstance(call.func.value, (ast.Name, ast.Constant)):
                out.append(diag(
                    "discarded-result", node.lineno, 2, "logic",
                    f"\`{call.func.attr}\` returns a new string. Where does that new string go?",
                    "Strings can't be changed in place, so methods give you a changed copy and leave the original alone.",
                    f"\`.{call.func.attr}()\` doesn't modify the original string. Its result must be stored (\`name = name.{call.func.attr}()\`) or used right away.",
                    node.col_offset,
                ))
            elif isinstance(call.func, ast.Name) and call.func.id in PURE_BUILTINS:
                out.append(diag(
                    "discarded-result", node.lineno, 2, "logic",
                    f"\`{call.func.id}(...)\` computes a value. Where does it go?",
                    "A call on its own line runs, but its answer is thrown away unless you store or print it.",
                    f"\`{call.func.id}\` returns a value without changing anything, so calling it alone does nothing useful. Store it in a variable or print it.",
                    node.col_offset,
                ))
        # a bare expression that computes something and discards it
        if isinstance(node, ast.Expr) and isinstance(node.value, (ast.BinOp, ast.Name, ast.Subscript)) and not isinstance(node.value, ast.Compare):
            out.append(diag(
                "useless-expression", node.lineno, 2, "logic",
                "This line calculates something, but where does the result go?",
                "Nothing here is stored, printed or returned.",
                "An expression on its own line is evaluated and then forgotten. Assign it to a name, print it, or return it.",
                node.col_offset,
            ))


def rule_infinite_while(tree, out):
    for node in ast.walk(tree):
        if not isinstance(node, ast.While):
            continue
        body_nodes = [n for stmt in node.body for n in ast.walk(stmt)]
        exits = any(isinstance(n, (ast.Break, ast.Return, ast.Raise, ast.Yield)) for n in body_nodes) or any(
            isinstance(n, ast.Call) and ((isinstance(n.func, ast.Name) and n.func.id in ("exit", "quit")) or (isinstance(n.func, ast.Attribute) and n.func.attr in ("exit", "_exit")))
            for n in body_nodes
        )
        if exits:
            continue
        test = node.test
        if isinstance(test, ast.Constant) and test.value:
            out.append(diag(
                "infinite-loop", node.lineno, 2, "logic",
                "What makes this loop stop?",
                "The condition is always true, and nothing inside the loop leaves it.",
                "\`while True\` runs forever unless something inside uses \`break\` or \`return\`. Press Stop if it is running, and add a way out.",
                node.col_offset,
            ))
            continue
        if any(isinstance(n, (ast.Call, ast.Attribute)) for n in ast.walk(test)):
            continue
        watched = names_in(test)
        if not watched:
            continue
        changed = set()
        for n in body_nodes:
            if isinstance(n, ast.Assign):
                for t in n.targets:
                    changed |= names_in(t)
            elif isinstance(n, (ast.AugAssign, ast.AnnAssign)):
                changed |= names_in(n.target)
            elif isinstance(n, ast.For):
                changed |= names_in(n.target)
            elif isinstance(n, ast.NamedExpr):
                changed |= names_in(n.target)
            elif isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute):
                changed |= names_in(n.func.value)
            elif isinstance(n, (ast.Global, ast.Nonlocal)):
                changed |= set(n.names)
        if not (watched & changed):
            shown = ", ".join(f"\`{n}\`" for n in sorted(watched))
            out.append(diag(
                "infinite-loop", node.lineno, 2, "logic",
                f"What changes inside the loop so that the condition can become false?",
                f"The condition looks at {shown}. Does anything in the loop body give it a new value?",
                f"The loop only depends on {shown}, but nothing in its body changes it, so the condition never changes and the loop never ends. Add an update such as \`i += 1\`.",
                node.col_offset,
            ))


# ───────────────────────────── pyflakes ─────────────────────────────

def pyflakes_diags(tree, code):
    try:
        from pyflakes import checker
    except Exception:  # not installed: the other rules still work
        return []
    out = []
    try:
        messages = checker.Checker(tree, "code").messages
    except Exception:
        return []
    for m in messages:
        kind = type(m).__name__
        args = getattr(m, "message_args", ())
        name = args[0] if args else "it"
        line, col = m.lineno, getattr(m, "col", 0)
        if kind == "UndefinedName":
            out.append(diag(
                "undefined-name", line, 1, "name",
                f"Where does \`{name}\` get its value before this line, and is it spelled exactly the same where it's created?",
                "Python reads top to bottom. Check for a typo, a different capital letter, or a name created further down.",
                f"\`{name}\` is used but never defined before this point. Names must be created (by assignment, \`def\`, \`import\` or a loop) before they are used, and spelling and capitals must match exactly.",
                col,
            ))
        elif kind == "UndefinedLocal":
            out.append(diag(
                "undefined-local", line, 1, "name",
                f"Inside this function, does \`{name}\` have a value at the moment it is read?",
                f"The function assigns to \`{name}\` somewhere, which makes it a *local* name for the whole function, even above the assignment.",
                f"Because \`{name}\` is assigned inside the function, Python treats every use of it there as local, including reads before the assignment. Pass it in as a parameter or assign it first.",
                col,
            ))
        elif kind == "UnusedVariable":
            out.append(diag(
                "unused-variable", line, 3, "style",
                f"You create \`{name}\` but never use it. What was it meant to feed into?",
                "Either use the value, or remove the line.",
                f"\`{name}\` is assigned a value that nothing reads. It may be a leftover, or a sign that a later line uses the wrong name.",
                col,
            ))
        elif kind == "UnusedImport":
            out.append(diag(
                "unused-import", line, 3, "style",
                f"You import \`{name}\`. Where do you use it?",
                "Imports that nothing uses are clutter, or a sign a line is missing.",
                f"\`{name}\` is imported but never used in this program.",
                col,
            ))
        elif kind == "RedefinedWhileUnused":
            out.append(diag(
                "redefined", line, 2, "logic",
                f"\`{name}\` is defined twice and the first one is never used. Which one do you mean?",
                "The second definition replaces the first.",
                f"A second \`def\` (or import) of \`{name}\` silently replaces the first before it was ever used.",
                col,
            ))
        elif kind in ("ReturnOutsideFunction", "YieldOutsideFunction"):
            out.append(diag(
                "return-outside", line, 1, "syntax",
                "Which kind of block can \`return\` be used in?",
                "\`return\` ends a function, so it has to be indented inside a \`def\`.",
                "\`return\` only makes sense inside a function. Is this line indented under the right \`def\`?",
                col,
            ))
    return out


# ───────────────────────────── entry point ─────────────────────────────

def analyze(code):
    """Analyse source text. Returns a JSON string: a list of diagnostics, most important first per line."""
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return json.dumps([syntax_diag(exc)])
    except (ValueError, RecursionError):
        return "[]"
    link_parents(tree)
    env = build_env(tree)
    found = []
    rules = (
        lambda: rule_range_goal(tree, code, found),
        lambda: rule_len_index(tree, found),
        lambda: rule_comparison_statement(tree, found),
        lambda: rule_mutate_while_iterating(tree, found),
        lambda: rule_functions(tree, found),
        lambda: rule_int_division(tree, found),
        lambda: rule_shadowing(tree, found),
        lambda: rule_unreachable(tree, found),
        lambda: rule_input_types(tree, env, found),
        lambda: rule_text_plus_number(tree, env, found),
        lambda: rule_methods(tree, found),
        lambda: rule_infinite_while(tree, found),
    )
    for rule in rules:
        try:
            rule()
        except Exception:  # a buggy heuristic must never take the whole analysis down
            pass
    found.extend(pyflakes_diags(tree, code))
    # One diagnostic per line and rule, the most important (lowest level) first.
    seen, result = set(), []
    for d in sorted(found, key=lambda d: (d["line"], d["level"])):
        key = (d["line"], d["rule"])
        if key not in seen:
            seen.add(key)
            result.append(d)
    return json.dumps(result)
`);let i=e.pyimport(`pythia_runtime`),a=e.pyimport(`pythia_analyze`);i.configure(e=>t.readLine(e),()=>t.wasCancelled(),e=>t.image(e));let o=async n=>{try{await e.loadPackagesFromImports(n.join(`
`),{messageCallback:t.status,errorCallback:t.status})}catch(e){t.status(`Couldn't load a package automatically: ${e instanceof Error?e.message:String(e)}`)}};return{async run(e,t){await o(e.map(e=>e.code));let n=JSON.stringify(Object.fromEntries(e.map(e=>[e.name,e.code])));return JSON.parse(i.run(n,t))},async runTests(e,t,n){await o([...e.map(e=>e.code),...n.flatMap(e=>e.kind===`check`?[e.code]:[])]);let r=JSON.stringify(Object.fromEntries(e.map(e=>[e.name,e.code])));return JSON.parse(i.run_tests(r,t,JSON.stringify(n)))},analyze(e){return JSON.parse(a.analyze(e))},async install(t){try{return await e.loadPackage(`micropip`),await e.pyimport(`micropip`).install(t),{ok:!0,message:`Installed ${t.join(`, `)}`}}catch(e){let n=(e instanceof Error?e.message:String(e)).split(`
`).filter(Boolean).pop()??`unknown error`;return{ok:!1,message:`Couldn't install ${t.join(`, `)}: ${n}`}}}}}const t=e=>self.postMessage(e);let n=null,r=null,i=0,a=!1,o=[];function s(e){if(a=!1,!r)return o.shift()??null;let n=new Int32Array(r.input);for(Atomics.store(n,0,0),t({type:`input-request`,id:i,prompt:e});Atomics.load(n,0)===0;)Atomics.wait(n,0,0);let s=Atomics.load(n,0);if(Atomics.store(n,0,0),s===2)return a=!0,null;let c=new Uint8Array(r.input,8,Atomics.load(n,1)).slice();return new TextDecoder().decode(c)}async function c(o,c){r=c;try{let{loadPyodide:c}=await import(
/* @vite-ignore */
`${o}pyodide.mjs`),l=await c({indexURL:o});r&&l.setInterruptBuffer(new Uint8Array(r.interrupt));let u=await fetch(`/Pythia/vendor/pyflakes-4.0.3-py2.py3-none-any.whl`).then(e=>e.ok?e.arrayBuffer():void 0).catch(()=>void 0);n=await e(l,{stdout:e=>t({type:`stdout`,id:i,text:e}),stderr:e=>t({type:`stderr`,id:i,text:e}),image:e=>t({type:`image`,id:i,png:e}),status:e=>t({type:`status`,id:i,text:e}),readLine:s,wasCancelled:()=>a},u),t({type:`ready`,python:l.runPython(`import sys; sys.version.split()[0]`)})}catch(e){t({type:`init-error`,message:e instanceof Error?e.message:String(e)})}}self.onmessage=async e=>{let a=e.data;if(a.type===`init`)return c(a.baseUrl,a.shared);if(n){if(i=a.id,a.type===`run`){r&&(new Uint8Array(r.interrupt)[0]=0),o=[...a.stdinLines];let e=await n.run(a.files,a.main);t({type:`done`,id:a.id,result:e})}else if(a.type===`analyze`)t({type:`analysis`,id:a.id,diagnostics:n.analyze(a.code)});else if(a.type===`test`){r&&(new Uint8Array(r.interrupt)[0]=0);let e=await n.runTests(a.files,a.main,a.tests);t({type:`tests-done`,id:a.id,report:e})}else{let{ok:e,message:r}=await n.install(a.packages);t({type:`install-done`,id:a.id,ok:e,message:r})}}};