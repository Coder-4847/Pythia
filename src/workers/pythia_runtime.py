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


def configure(read_line, was_cancelled, emit_image):
    """Wire the JS host callbacks and replace input()/sys.stdin."""
    global _read_line, _was_cancelled, _emit_image
    _read_line, _was_cancelled, _emit_image = read_line, was_cancelled, emit_image
    builtins.input = _input
    sys.stdin = _Stdin()


def _input(prompt=""):
    sys.stdout.write(str(prompt))
    sys.stdout.flush()
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
