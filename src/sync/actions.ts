/**
 * What the UI calls. Each action loads the cloud code on first use, so the always-loaded parts
 * of the app (header, pages) never import the Supabase SDK or the sync manager directly.
 */
const manager = () => import('@/sync/manager')

export const signIn = (email: string, password: string) => manager().then((m) => m.signIn(email, password))
export const signUp = (email: string, password: string) => manager().then((m) => m.signUp(email, password))
export const signInWithProvider = (p: 'github' | 'google') => manager().then((m) => m.signInWithProvider(p))
export const sendPasswordReset = (email: string) => manager().then((m) => m.sendPasswordReset(email))
export const setNewPassword = (password: string) => manager().then((m) => m.setNewPassword(password))
export const signOut = () => manager().then((m) => m.signOut())
export const deleteAccount = () => manager().then((m) => m.deleteAccount())
export const syncNow = () => manager().then((m) => m.requestSync(0))
export const resolveChoice = (c: 'merge' | 'replace' | 'later') => manager().then((m) => m.resolveChoice(c))
export const enableSync = () => manager().then((m) => m.enableSync())
