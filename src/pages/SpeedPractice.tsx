import * as React from 'react'
import { useNavigate } from 'react-router-dom'

type HapticKind = 'tap' | 'remove' | 'reset' | 'done'

export default function SpeedPractice() {
  const [count, setCount] = React.useState(0)
  const [history, setHistory] = React.useState<number[]>([])
  const navigate = useNavigate()

  // Vibrate-only feedback (Android browsers). iOS Safari ignores it gracefully.
  function vibrate(kind: HapticKind) {
    try {
      const v = (navigator as any)?.vibrate
      if (!v) return
      const pattern: Record<HapticKind, number | number[]> = {
        tap: [0, 30],
        remove: [0, 40, 30, 40],
        reset: [0, 60, 40, 60, 40, 60],
        done: [0, 70],
      }
      v(0); v(pattern[kind])
    } catch {}
  }

  // keyboard helpers
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setCount(c => c + 1); vibrate('tap') }
      else if (e.key.toLowerCase() === 'z' || e.key === 'Backspace') { e.preventDefault(); setCount(c => Math.max(0, c - 1)); vibrate('remove') }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); setCount(0); vibrate('reset') }
      else if (e.key.toLowerCase() === 'd') { e.preventDefault(); onDone() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onTap = React.useCallback(() => setCount(c => c + 1), [])
  const onRemove = React.useCallback(() => setCount(c => Math.max(0, c - 1)), [])
  const onReset = React.useCallback(() => setCount(0), [])
  const onDone = React.useCallback(() => {
    setHistory(h => [count, ...h].slice(0, 10))
    setCount(0)
    navigate('/')
  }, [count, navigate])

  const tapRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const el = tapRef.current
    if (!el) return
    const handler = (e: PointerEvent) => {
      e.preventDefault()
      vibrate('tap')
      onTap()
    }
    el.addEventListener('pointerdown', handler, { passive: false })
    return () => el.removeEventListener('pointerdown', handler)
  }, [onTap])

  return (
    <main className="h-dvh bg-brand-page">
      <div className="h-full max-w-[420px] mx-auto px-4 py-3 flex flex-col overflow-hidden overscroll-none">
        {/* Controls */}
        <div className="grid grid-cols-3 gap-3 mb-3 shrink-0">
          <button
            onPointerDown={(e) => { e.preventDefault(); vibrate('done'); onDone() }}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-emerald-500 shadow focus:outline-none focus:ring-4 focus:ring-emerald-300 no-tap-highlight"
          >
            Done
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); vibrate('remove'); onRemove() }}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-emerald-500 shadow focus:outline-none focus:ring-4 focus:ring-emerald-300 justify-self-center no-tap-highlight"
          >
            Remove Step
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); vibrate('reset'); onReset() }}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-rose-500 shadow focus:outline-none focus:ring-4 focus:ring-rose-300 justify-self-end no-tap-highlight"
          >
            Reset
          </button>
        </div>

        {/* Tap zone */}
        <div
          ref={tapRef}
          role="button"
          tabIndex={0}
          className="flex-1 w-full rounded-xl bg-brand-dark text-white select-none shadow ring-1 ring-black/5 flex items-center justify-center pb-[max(env(safe-area-inset-bottom),8px)] [touch-action:none] no-tap-highlight"
        >
          <div className="text-center">
            <div className="text-lg opacity-90">Steps</div>
            <div className="text-4xl font-extrabold tracking-wide mt-1">{count}</div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 shrink-0">
            Last: {history.join(', ')}
          </div>
        )}
      </div>
    </main>
  )
}
