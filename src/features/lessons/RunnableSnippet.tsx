import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CodeEditor } from '@/features/editor/CodeEditor'
import { Console } from '@/features/runtime/Console'
import { useRunner } from '@/features/runtime/useRunner'
import { useSettings } from '@/stores/settings'

/** An editable, runnable code sample embedded in lesson text (a ```python run fence). */
export function RunnableSnippet({ code, id }: { code: string; id: string }) {
  const [value, setValue] = useState(code)
  const [stdin, setStdin] = useState('')
  const runner = useRunner()
  const { editorFontSize, keybindings } = useSettings()
  const run = () => void runner.run([{ name: 'main.py', code: value }], 'main.py', stdin)
  const touched = runner.entries.length > 0 || runner.running

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-line-strong bg-surface">
      <CodeEditor
        docKey={id}
        initialValue={code}
        onChange={setValue}
        onRun={run}
        fontSize={editorFontSize - 1}
        keybindings={keybindings}
        ariaLabel="Editable example code"
      />
      <div className="flex items-center gap-2 border-t border-line px-3 py-2">
        {runner.running ? (
          <Button size="sm" onClick={runner.stop} className="border-bad/60 text-bad">
            Stop
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={run}>
            Run
          </Button>
        )}
        <span className="ml-auto text-xs text-dim">Edit the code and run it again</span>
      </div>
      {touched && (
        <Console
          compact
          entries={runner.entries}
          running={runner.running}
          prompt={runner.prompt}
          onSubmitInput={runner.submitInput}
          onClear={runner.clear}
          stdin={stdin}
          onStdinChange={setStdin}
          className="border-t border-line"
        />
      )}
    </div>
  )
}
