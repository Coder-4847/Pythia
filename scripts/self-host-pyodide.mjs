// Copies the Pyodide core (interpreter + stdlib) from node_modules into public/pyodide so the
// app can run with no CDN: `VITE_PYODIDE_BASE=/pyodide/`. Used for offline development and e2e.
// Scientific packages (NumPy, pandas, ...) are not part of the core and still need the CDN.
import { cp, mkdir } from 'node:fs/promises'

const src = 'node_modules/pyodide'
const dest = 'public/pyodide'
await mkdir(dest, { recursive: true })
for (const file of ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
  await cp(`${src}/${file}`, `${dest}/${file}`).catch((e) => {
    if (e.code !== 'ENOENT') throw e
  })
}
console.log('Pyodide core copied to', dest)
