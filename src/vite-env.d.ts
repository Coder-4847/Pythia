/// <reference types="vite/client" />

declare module '*.py?raw' {
  const source: string
  export default source
}

interface ImportMetaEnv {
  /** Base URL (ending in "/") of a self-hosted Pyodide distribution. Defaults to the jsDelivr CDN. */
  readonly VITE_PYODIDE_BASE?: string
  readonly VITE_AI_PROXY_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}
