
import * as React from 'react'
import { Link } from 'react-router-dom'

export default function SpeedPractice() {
  const [count, setCount] = React.useState(0)
  const [history, setHistory] = React.useState<number[]>([])

  // keyboard helpers: space/enter add, backspace remove, r reset, d done
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

  const onTap = () => setCount(c => c + 1)
  const onRemove = () => setCount(c => Math.max(0, c - 1))
  const onReset = () => setCount(0)
  const onDone = () => {
    setHistory(h => [count, ...h].slice(0, 10))
    setCount(0)
  }

  return (
    <main className="min-h-screen bg-brand-page p-6">
      <div className="max-w-[420px] mx-auto">
        {/* Top controls */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={onDone}
            className="col-span-1 rounded-lg px-4 py-3 font-semibold text-white bg-emerald-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Done
          </button>
          <button
            onClick={onRemove}
            className="col-span-1 rounded-lg px-4 py-3 font-semibold text-white bg-emerald-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 justify-self-center"
          >
            Remove Step
          </button>
          <button
            onClick={onReset}
            className="col-span-1 rounded-lg px-4 py-3 font-semibold text-white bg-rose-500 shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-rose-300 justify-self-end"
          >
            Reset
          </button>
        </div>

        {/* Tap zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={onTap}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onTap() } }}
          className="w-full rounded-lg bg-brand-dark text-white select-none shadow ring-1 ring-black/5 flex items-center justify-center"
          style={{ aspectRatio: '1 / 1' }}
        >
          <div className="text-center">
            <div className="text-lg opacity-90">Steps</div>
            <div className="text-3xl font-extrabold tracking-wide mt-1">{count}</div>
          </div>
        </div>

        {/* Footer (optional link back) */}
        <div className="mt-6 text-center">
          <Link className="text-blue-700 underline" to="/">
            ← Back
          </Link>
        </div>

        {/* Tiny history under the hood (helps practice) */}
        {history.length > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            Last: {history.join(', ')}
          </div>
        )}
      </div>
    </main>
  )
}
