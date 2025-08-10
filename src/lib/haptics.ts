export type Haptic = 'tap' | 'remove' | 'reset' | 'done'

const patterns: Record<Haptic, number | number[]> = {
  tap: 10,
  remove: [12, 30, 12],
  reset: [20, 30, 20],
  done: 30
}

export function haptic(kind: Haptic) {
  try {
    if (window?.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const vibrate = (navigator as any)?.vibrate
    if (!vibrate) return
    vibrate(patterns[kind])
  } catch {}
}
