
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

export default function SpeedPractice() {
  const [count, setCount] = React.useState(0)
  const [history, setHistory] = React.useState<number[]>([])
  const navigate = useNavigate()

  // haptics (Android Chrome supports Vibration API; iOS Safari ignores gracefully)
  function vibrate(pattern: number | number[] = 10) {
    try { (navigator as any)?.vibrate?.(pattern) } catch {}
  }

  // keyboard helpers
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setCount(c => c + 1) }
      else if (e.key.toLowerCase() === 'z' || e.key === 'Backspace') { e.preventDefault(); setCount(c => Math.max(0, c - 1)) }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); setCount(0) }
      else if (e.key.toLowerCase() === 'd') { e.preventDefault(); onDone() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onTap = () => { vibrate(8); setCount(c => c + 1) }
  const onRemove = () => { vibrate([12, 40, 12]); setCount(c => Math.max(0, c - 1)) }
  const onReset = () => { vibrate([20, 40, 20, 40, 20]); setCount(0) }
  const onDone = () => {
    vibrate(25);
    setHistory(h => [count, ...h].slice(0, 10))
    setCount(0)
    navigate('/')
  }

  return (
    <main className="h-dvh bg-brand-page">
      <div className="h-full max-w-[420px] mx-auto px-4 py-4 flex flex-col overflow-hidden overscroll-none">
        {/* Controls (fixed height, no shrink) */}
        <div className="grid grid-cols-3 gap-4 mb-4 shrink-0">
          <button
            onClick={onDone}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-emerald-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Done
          </button>
          <button
            onClick={onRemove}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-emerald-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 justify-self-center"
          >
            Remove Step
          </button>
          <button
            onClick={onReset}
            className="col-span-1 rounded-xl px-4 py-3 font-semibold text-white bg-rose-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-rose-300 justify-self-end"
          >
            Reset
          </button>
        </div>

        {/* Tap zone fills the rest; respects safe areas */}
        <div
          role="button"
          tabIndex={0}
          onClick={onTap}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onTap() } }}
          className="flex-1 w-full rounded-xl bg-brand-dark text-white select-none shadow ring-1 ring-black/5 flex items-center justify-center pb-[max(env(safe-area-inset-bottom),8px)]"
        >
          <div className="text-center">
            <div className="text-lg opacity-90">Steps</div>
            <div className="text-4xl font-extrabold tracking-wide mt-1">{count}</div>
          </div>
        </div>

        {/* tiny history (no layout impact) */}
        {history.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 shrink-0">
            Last: {history.join(', ')}
          </div>
        )}
      </div>
    </main>
  )
}
