
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

type HapticKind = 'tap' | 'remove' | 'reset' | 'done'

export default function SpeedPractice() {
  const [count, setCount] = React.useState(0)
  const [history, setHistory] = React.useState<number[]>([])
  const navigate = useNavigate()

  // Stronger, unified haptics using pointer events
  function vibrateStrong(kind: HapticKind) {
    const patternMap: Record<HapticKind, number | number[]> = {
      tap: [0, 18],
      remove: [0, 28, 40, 28],
      reset: [0, 35, 40, 35, 40, 35],
      done: [0, 50],
    }
    try {
      const v = (navigator as any)?.vibrate
      if (v) { v(0); v(patternMap[kind]) }
    } catch {}
  }

  // keyboard helpers (desktop practice)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setCount(c => c + 1); vibrateStrong('tap') }
      else if (e.key.toLowerCase() === 'z' || e.key === 'Backspace') { e.preventDefault(); setCount(c => Math.max(0, c - 1)); vibrateStrong('remove') }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); setCount(0); vibrateStrong('reset') }
      else if (e.key.toLowerCase() === 'd') { e.preventDefault(); onDone() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onTap = () => setCount(c => c + 1)
  const onRemove = () => setCount(c => Math.max(0, c - 1))
  const onReset = () => setCount(0)
  const onDone = () => {
    setHistory(h => [count, ...h].slice(0, 10))
    setCount(0)
    navigate('/')
  }

  // helper to bind pointer down for ultra-low latency
  const bindPD = (kind: HapticKind, action: () => void) => (e: React.PointerEvent) => {
    e.preventDefault()
    vibrateStrong(kind)
    action()
  }

  return (
    <main className="h-dvh bg-brand-page">
      <div className="h-full max-w-[420px] mx-auto px-4 py-4 flex flex-col overflow-hidden overscroll-none">
        {/* Controls (fixed height) */}
        <div className="grid grid-cols-3 gap-4 mb-4 shrink-0">
          <button
            onPointerDown={bindPD('done', onDone)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vibrateStrong('done'); onDone() } }}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-emerald-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Done
          </button>
          <button
            onPointerDown={bindPD('remove', onRemove)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vibrateStrong('remove'); onRemove() } }}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-emerald-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 justify-self-center"
          >
            Remove Step
          </button>
          <button
            onPointerDown={bindPD('reset', onReset)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vibrateStrong('reset'); onReset() } }}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-rose-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-rose-300 justify-self-end"
          >
            Reset
          </button>
        </div>

        {/* Tap zone fills the rest; ultra-low latency with Pointer events */}
        <div
          role="button"
          tabIndex={0}
          onPointerDown={bindPD('tap', onTap)}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); vibrateStrong('tap'); onTap() } }}
          className="flex-1 w-full rounded-xl bg-brand-dark text-white select-none shadow ring-1 ring-black/5 flex items-center justify-center pb-[max(env(safe-area-inset-bottom),8px)] [touch-action:manipulation]"
        >
          <div className="text-center">
            <div className="text-lg opacity-90">Steps</div>
            <div className="text-4xl font-extrabold tracking-wide mt-1">{count}</div>
          </div>
        </div>

        {/* tiny history */}
        {history.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 shrink-0">
            Last: {history.join(', ')}
          </div>
        )}
      </div>
    </main>
  )
}
