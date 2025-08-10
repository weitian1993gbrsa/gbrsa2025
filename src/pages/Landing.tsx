
import * as React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main className="min-h-screen bg-brand-page flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-white rounded-3xl shadow-xl ring-1 ring-black/5 p-8 text-center">
        <img
          src="./logo.svg"
          alt="GBRSA logo"
          className="h-20 w-20 mx-auto rounded-2xl object-contain"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-wide">GBRSA JUDGING</h1>

        <div className="mt-8 space-y-4">
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
