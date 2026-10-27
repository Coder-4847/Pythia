/** Cloud accounts are optional: without both values the app is local-only and loads none of the cloud code. */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Where Supabase sends people back to after OAuth, email confirmation and password recovery. */
export const authRedirect = () => `${window.location.origin}${import.meta.env.BASE_URL}`
