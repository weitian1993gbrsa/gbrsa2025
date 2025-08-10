
import * as React from 'react'
import { Link } from 'react-router-dom'

export default function Freestyle() {
  return (
    <div className="min-h-screen bg-brand-page p-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow ring-1 ring-black/5">
        <h1 className="text-xl font-bold">Freestyle Judge</h1>
        <p className="mt-2 text-sm text-gray-600">Placeholder page. We’ll build the judging UI here.</p>
        <Link className="inline-block mt-6 text-blue-700 underline" to="/">← Back</Link>
      </div>
    </div>
  )
}
