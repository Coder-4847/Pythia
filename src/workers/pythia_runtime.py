"""Pythia's in-Pyodide runtime: runs learner code and reports what happened.

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
        sys.stdout.write(line + "\n")  # echo the answer and Enter, as the console shows them
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
            return _input("") + "\n"
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
        lines.append("Traceback (most recent call last):\n")
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
        "traceback": "".join(lines).rstrip("\n"),
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
    """Run `main` from the given {name: source} files. Returns a JSON string."""
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
    """Raised by a `check` test (via fail() or assert) with a learner-facing message."""


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
    return "\n".join(line.rstrip() for line in text.rstrip("\n").split("\n"))


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
        raise _Check(f"I can't find a function called `{fn}`. Define it with `def {fn}(...):`.")
    if not callable(namespace[fn]):
        raise _Check(f"`{fn}` exists, but it is not a function. Define it with `def {fn}(...):`.")
    call = _call_text(fn, args, kwargs)
    expected = _revive(test["expected"])
    try:
        got = namespace[fn](*args, **kwargs)
    except Exception as exc:  # the learner's function crashed
        frames = traceback.extract_tb(exc.__traceback__)
        where = f" (line {frames[-1].lineno} of your code)" if frames else ""
        raise _Check(f"`{call}` raised {type(exc).__name__}: {exc}{where}")
    if _equal(got, expected):
        return
    note = ""
    if got is None and expected is not None:
        note = " It returned `None`. Is there a `return` statement on every path?"
    raise _Check(f"`{call}` should return {expected!r}, but it returned {got!r}{_type_note(expected, got)}.{note}", repr(expected), repr(got))


def _check_output(test, out):
    expected, got = _normalise_output(test["expected"]), _normalise_output(out)
    if expected == got:
        return
    want_lines, got_lines = expected.split("\n"), got.split("\n")
    for index, (w, g) in enumerate(zip(want_lines, got_lines), start=1):
        if w != g:
            raise _Check(f"Line {index} of the output should be {w!r}, but it is {g!r}.", test["expected"], out)
    if len(got_lines) < len(want_lines):
        raise _Check(f"Your program printed {len(got_lines)} line(s), but {len(want_lines)} were expected.", test["expected"], out)
    raise _Check(f"Your program printed {len(got_lines)} line(s), but only {len(want_lines)} were expected.", test["expected"], out)


def _check_var(test, namespace):
    name, expected = test["variable"], _revive(test["expected"])
    if name not in namespace:
        raise _Check(f"I don't see a variable called `{name}`. Did you assign it with `{name} = ...`?")
    got = namespace[name]
    if not _equal(got, expected):
        raise _Check(f"`{name}` should be {expected!r}, but it is {got!r}{_type_note(expected, got)}.", repr(expected), repr(got))


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
