import * as React from 'react'
import { Link } from 'react-router-dom'

export default function VibrateTest() {
  const [customMs, setCustomMs] = React.useState(120)
  const [supported, setSupported] = React.useState(false)
  const [secure, setSecure] = React.useState(false)
  const [ua, setUa] = React.useState('')

  React.useEffect(() => {
    setSupported(typeof (navigator as any).vibrate === 'function')
    setSecure(window.isSecureContext)
    setUa(navigator.userAgent)
  }, [])

  const call = (pattern: number | number[]) => {
    try {
      const v = (navigator as any).vibrate
      if (typeof v === 'function') {
        v(0); v(pattern)
      }
    } catch {}
  }

  return (
    <main className="h-dvh bg-brand-page">
      <div className="h-full max-w-[420px] mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-5 shadow ring-1 ring-black/5">
          <h1 className="text-xl font-bold">Vibration Tester</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use these buttons on your Android phone. iOS Safari does not support web vibration.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onPointerDown={(e) => { e.preventDefault(); call(30) }}
              className="rounded-lg px-4 py-3 font-semibold text-white bg-brand-dark shadow">30 ms</button>
            <button onPointerDown={(e) => { e.preventDefault(); call(200) }}
              className="rounded-lg px-4 py-3 font-semibold text-white bg-brand-dark shadow">200 ms</button>
            <button onPointerDown={(e) => { e.preventDefault(); call([0,50,100,50,100,50]) }}
              className="rounded-lg px-4 py-3 font-semibold text-white bg-brand-dark shadow col-span-2">Pattern [0,50,100,50,100,50]</button>
            <button onPointerDown={(e) => { e.preventDefault(); call(0) }}
              className="rounded-lg px-4 py-3 font-semibold text-white bg-rose-500 shadow col-span-2">Stop Vibrate</button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input type="number" min={1} value={customMs}
              onChange={(e) => setCustomMs(parseInt(e.target.value || '0', 10))}
              className="w-28 rounded-md border px-3 py-2" />
            <button onPointerDown={(e) => { e.preventDefault(); call(customMs) }}
              className="rounded-lg px-4 py-2 font-semibold text-white bg-emerald-600 shadow">Vibrate {customMs} ms</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow ring-1 ring-black/5 text-sm">
          <div>Secure context: <span className={secure ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{String(secure)}</span></div>
          <div>navigator.vibrate: <span className={supported ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{supported ? 'available' : 'unavailable'}</span></div>
          <div className="mt-1 break-words">UA: <span className="text-gray-600">{ua}</span></div>
        </div>

        <div className="text-center mt-auto">
          <Link to="/" className="text-blue-700 underline">← Home</Link>
        </div>
      </div>
    </main>
  )
}
