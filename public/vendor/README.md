# Vendored Python packages

`pyflakes-4.0.3-py2.py3-none-any.whl` is [pyflakes](https://github.com/PyCQA/pyflakes) 4.0.3 (MIT licence, © Divmod / Florent Xicluna / Pyflakes contributors),
unmodified except that its test suite and command-line scripts were removed to save bytes. It is unpacked straight into
Pyodide's site-packages by the worker, so Pythia's undefined-name and unused-variable checks work offline and don't depend
on PyPI or micropip being reachable.
