import { useEffect } from 'react'

const BASE = 'Pythia'

/** Set the tab title while a page is mounted ("Variables · Pythia"). */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — the AI Python tutor that sees your bugs coming`
  }, [title])
}
