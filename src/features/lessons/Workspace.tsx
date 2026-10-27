import { Button } from '@/components/ui/Button'
import { CodeEditor } from '@/features/editor/CodeEditor'
import { Console } from '@/features/runtime/Console'
import { RuntimePill } from '@/features/runtime/RuntimePill'
import type { useRunner } from '@/features/runtime/useRunner'
import { useSettings } from '@/stores/settings'

interface Props {
  /** Identifies the document being edited (resets editor state when it changes). */
  docKey: string
  code: string
  onCodeChange: (code: string) => void
  runner: ReturnType<typeof useRunner>
  onRun: () => void
  /** Present for exercises: runs the tests. */
  onCheck?: () => void
  onReset?: () => void
  stdin: string
  onStdinChange: (text: string) => void
}

/** Editor + toolbar + console, shared by the worked example and the exercises. */
export function Workspace({ docKey, code, onCodeChange, runner, onRun, onCheck, onReset, stdin, onStdinChange }: Props) {
  const { editorFontSize, keybindings } = useSettings()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
        <RuntimePill />
        <div className="ml-auto flex items-center gap-2">
          {onReset && (
            <Button size="sm" variant="ghost" onClick={onReset} disabled={runner.running}>
              Reset
            </Button>
          )}
          {runner.running && !runner.checking ? (
            <Button size="sm" onClick={runner.stop} className="border-bad/60 text-bad">
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={onRun} disabled={runner.running}>
              Run
            </Button>
          )}
          {onCheck && (
            <Button size="sm" variant="primary" onClick={onCheck} disabled={runner.running}>
              {runner.checking ? 'Checking…' : 'Check answer'}
            </Button>
          )}
        </div>
      </div>
      <CodeEditor
        docKey={docKey}
        initialValue={code}
        onChange={onCodeChange}
        onRun={onRun}
        onCheck={onCheck}
        fontSize={editorFontSize}
        keybindings={keybindings}
        ariaLabel="Python code editor"
        className="min-h-56 flex-[3] border-b border-line"
      />
      <Console
        entries={runner.entries}
        running={runner.running}
        prompt={runner.prompt}
        onSubmitInput={runner.submitInput}
        onClear={runner.clear}
        stdin={stdin}
        onStdinChange={onStdinChange}
        className="min-h-40 flex-[2]"
      />
    </div>
  )
}
