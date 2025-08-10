import * as React from 'react'

export default function Practice() {
  const [steps, setSteps] = React.useState(0)

  // simple Android vibrate (ignored by iOS Safari)
  function vibrate(ms = 30) {
    try { (navigator as any)?.vibrate?.([0, ms]) } catch {}
  }

  const onNext = React.useCallback(() => { setSteps(s => s + 1) }, [])
  const onUndo = React.useCallback(() => { setSteps(s => Math.max(0, s - 1)) }, [])
  const onReset = React.useCallback(() => { setSteps(0) }, [])

  // keyboard support like IJRU's practice
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); vibrate(30); onNext() }
      else if (e.key.toLowerCase() === 'z' || e.key === 'Backspace') { e.preventDefault(); vibrate(50); onUndo() }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); vibrate(70); onReset() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext, onUndo, onReset])

  // pointerdown for no-lag tapping
  const zoneRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const el = zoneRef.current
    if (!el) return
    const handler = (e: PointerEvent) => { e.preventDefault(); vibrate(30); onNext() }
    el.addEventListener('pointerdown', handler, { passive: false })
    return () => el.removeEventListener('pointerdown', handler)
  }, [onNext])

  return (
    <main className="h-dvh bg-brand-page">
      <div className="h-full max-w-[960px] mx-auto px-6 py-6 flex flex-col overflow-hidden">
        {/* Top buttons - IJRU layout and labels */}
        <div className="grid grid-cols-3 gap-6 mb-6 shrink-0">
          <button
            onPointerDown={(e) => { e.preventDefault(); vibrate(30); onNext() }}
            className="rounded-xl px-4 py-4 font-semibold text-white bg-emerald-500 shadow focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Next Step
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); vibrate(50); onUndo() }}
            className="rounded-xl px-4 py-4 font-semibold text-white bg-orange-500 shadow focus:outline-none focus:ring-4 focus:ring-orange-300"
          >
            Undo
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); vibrate(70); onReset() }}
            className="rounded-xl px-4 py-4 font-semibold text-white bg-rose-500 shadow focus:outline-none focus:ring-4 focus:ring-rose-300"
          >
            Reset
          </button>
        </div>

        {/* Big green tap area */}
        <div
          ref={zoneRef}
          role="button"
          tabIndex={0}
          className="flex-1 w-full rounded-xl bg-emerald-500 text-white select-none shadow ring-1 ring-black/5 flex items-center justify-center [touch-action:none]"
        >
          <div className="text-center">
            <div className="text-xl opacity-90">Steps</div>
            <div className="text-3xl md:text-5xl font-extrabold tracking-wide mt-1">{steps}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
