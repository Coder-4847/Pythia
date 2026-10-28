"""
Run one exercise through Pythia's own test runner on the machine's Python, for lessons that
need packages the Node test environment can't download (NumPy, pandas, scikit-learn, Matplotlib).

    echo '{"code": "...", "tests": [...]}' | python scripts/native_check.py

Prints the same JSON report the browser produces. The runner is the very same file the
Pyodide worker loads, so a pass here means the lesson's tests and reference solution agree.
Used by `src/content/content.test.ts` when PYTHIA_NATIVE_PYTHON points at a Python that has the
scientific stack installed.
"""
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "workers"))
import pythia_runtime as rt  # noqa: E402

request = json.load(sys.stdin)  # before configure(), which replaces sys.stdin
rt.USER_DIR = tempfile.mkdtemp(prefix="pythia-")
rt.configure(lambda prompt: None, lambda: False, lambda png: None)
print(rt.run_tests(json.dumps({"main.py": request["code"]}), "main.py", json.dumps(request["tests"])))
