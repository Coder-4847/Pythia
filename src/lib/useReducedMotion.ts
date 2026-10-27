import { useReducedMotion as useOsReducedMotion } from 'framer-motion'
import { useSettings } from '@/stores/settings'

/**
 * Should animations be minimal? The in-app setting wins over the OS preference in both
 * directions: "on" always reduces, "off" never does, "system" follows the OS.
 */
export function useReducedMotion(): boolean {
  const os = useOsReducedMotion()
  const setting = useSettings((s) => s.reducedMotion)
  return setting === 'on' || (setting === 'system' && Boolean(os))
}
