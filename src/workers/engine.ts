import type { PyodideInterface } from 'pyodide'
import runtimeSource from '@/workers/pythia_runtime.py?raw'
import type { RunResult, SourceFile } from '@/workers/protocol'

/** What the engine needs from its environment (the worker, or a test). */
export interface EngineHost {
  stdout: (text: string) => void
  stderr: (text: string) => void
  image: (pngBase64: string) => void
  status: (text: string) => void
  /** Block until the learner answers. `null` means end of input. */
  readLine: (prompt: string) => string | null
  /** True if the last readLine returned null because Stop was pressed. */
  wasCancelled: () => boolean
}

export interface Engine {
  run: (files: SourceFile[], main: string) => Promise<RunResult>
  install: (packages: string[]) => Promise<{ ok: boolean; message: string }>
}

type PyRuntimeModule = { run: (filesJson: string, main: string) => string; configure: (...fns: unknown[]) => void }

/** Wrap Pyodide with Pythia's run/stream/plot/input behaviour. Pure logic, no worker globals. */
export async function createEngine(py: PyodideInterface, host: EngineHost): Promise<Engine> {
  const decoder = (sink: (t: string) => void) => {
    const d = new TextDecoder()
    return {
      isatty: true, // line-buffered, so output streams while the program runs
      write: (buf: Uint8Array) => {
        sink(d.decode(buf, { stream: true }))
        return buf.length
      },
    }
  }
  py.setStdout(decoder(host.stdout))
  py.setStderr(decoder(host.stderr))

  py.FS.writeFile('/pythia_runtime.py', runtimeSource)
  py.runPython("import sys; sys.path.insert(0, '/')")
  const runtime = py.pyimport('pythia_runtime') as unknown as PyRuntimeModule
  runtime.configure(
    (prompt: string) => host.readLine(prompt),
    () => host.wasCancelled(),
    (png: string) => host.image(png),
  )

  return {
    async run(files, main) {
      try {
        await py.loadPackagesFromImports(files.map((f) => f.code).join('\n'), {
          messageCallback: host.status,
          errorCallback: host.status,
        })
      } catch (e) {
        // The import will fail with a normal ModuleNotFoundError, which Pythia can explain.
        host.status(`Couldn't load a package automatically: ${e instanceof Error ? e.message : String(e)}`)
      }
      const filesJson = JSON.stringify(Object.fromEntries(files.map((f) => [f.name, f.code])))
      return JSON.parse(runtime.run(filesJson, main)) as RunResult
    },

    async install(packages) {
      try {
        await py.loadPackage('micropip')
        const micropip = py.pyimport('micropip')
        await micropip.install(packages)
        return { ok: true, message: `Installed ${packages.join(', ')}` }
      } catch (e) {
        const first = (e instanceof Error ? e.message : String(e)).split('\n').filter(Boolean).pop() ?? 'unknown error'
        return { ok: false, message: `Couldn't install ${packages.join(', ')}: ${first}` }
      }
    },
  }
}
