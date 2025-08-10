
import * as React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main className="min-h-screen bg-brand-page flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-white rounded-3xl shadow-xl ring-1 ring-black/5 p-8 text-center">
        

<div className="flex justify-center items-center mt-2 mb-4 overflow-visible">
  <img
    src="/logo.png"
    alt="GBRSA official logo"
    className="block w-24 md:w-28 h-auto object-contain"
  />
</div>

<h1 className="mt-4 text-2xl font-bold tracking-wide">GBRSA JUDGING</h1>

        \1<Link to=\"/speed-practice\" className=\"block w-full rounded-full px-6 py-4 font-semibold bg-brand-dark text-white shadow hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 transition\">SPEED PRACTICE</Link>
          <Link
            to="/speed"
            className="block w-full rounded-full px-6 py-4 font-semibold bg-brand-dark text-white shadow hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          >
            SPEED JUDGE
          </Link>
          <Link
            to="/freestyle"
            className="block w-full rounded-full px-6 py-4 font-semibold bg-brand-dark text-white shadow hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          >
            FREESTYLE JUDGE
          </Link>
        </div>

        <div className="mt-10 text-left">
          <div className="rounded-2xl bg-brand-light p-5 leading-relaxed text-sm">
            <p className="font-semibold">
              For best experience, add this web-app to your home screen.
            </p>
            <p className="mt-2">
              <span className="font-semibold">On Android,</span> open the browser menu (⋮) and choose “Add to Home screen” or “Install”.
            </p>
            <p className="mt-2">
              <span className="font-semibold">On iOS,</span> tap the “Share” button and select “Add to Home Screen”.
            </p>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-gray-500">
          GBRSA ROPE SKIPPING ACADEMY 2025 – GBRSA SCORE – the simple scoring system
        </p>
      </section>
    </main>
  )
}
