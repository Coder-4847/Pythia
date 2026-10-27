import { create } from 'zustand'

interface Toast {
  id: number
  text: string
}

interface ToastState {
  toasts: Toast[]
  show: (text: string) => void
}

let nextId = 0

/** Short-lived confirmations ("Link copied"). Each disappears by itself after 2.8 s. */
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (text) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, text }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2800)
  },
}))
