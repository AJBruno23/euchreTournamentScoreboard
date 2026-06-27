import { useState } from 'react'
import { useAdmin } from '../AdminContext'
import { noAutofill } from '../formProps'

export default function PinModal({ onClose }) {
  const { login, error, setError } = useAdmin()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const ok = await login(pin)
    setLoading(false)
    if (ok) onClose()
  }

  function handleClose() {
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-semibold text-lg mb-4">Admin Mode</h2>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input
            autoFocus
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            {...noAutofill}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center text-xl tracking-widest focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !pin}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? '...' : 'Enter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
