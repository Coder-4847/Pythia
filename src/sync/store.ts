import { create } from 'zustand'
import { isCloudConfigured } from '@/sync/config'

export interface CloudUser {
  id: string
  email: string
}

/** Why the first-sign-in dialog is showing, and what each choice would do. */
export interface SyncChoice {
  /** The account already holds learner data. */
  cloudHasData: boolean
  local: { lessons: number; attempts: number }
}

/**
 * What the UI knows about the cloud. Nothing here imports the Supabase SDK, so the header and
 * pages can read it without pulling the SDK in; `actions.ts` loads the real work on demand.
 */
export type SyncPhase = 'off' | 'paused' | 'idle' | 'syncing' | 'offline' | 'error'

interface CloudState {
  configured: boolean
  /** The first session check has finished. */
  ready: boolean
  user: CloudUser | null
  /** The learner followed a password-recovery link and must choose a new password. */
  recovery: boolean
  /** The page was opened by an OAuth / email-link redirect, so land them somewhere useful. */
  returned: boolean
  phase: SyncPhase
  lastSyncAt: number | null
  pending: number
  error: string | null
  choice: SyncChoice | null
  set: (patch: Partial<Omit<CloudState, 'set'>>) => void
}

export const useCloud = create<CloudState>((set) => ({
  configured: isCloudConfigured,
  ready: !isCloudConfigured,
  user: null,
  recovery: false,
  returned: false,
  phase: 'off',
  lastSyncAt: null,
  pending: 0,
  error: null,
  choice: null,
  set: (patch) => set(patch),
}))
