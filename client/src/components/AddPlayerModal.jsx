import { useState } from 'react'
import { noAutofill } from '../formProps'

export default function AddPlayerModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter a valid name'); return }
    try {
      await onAdd(name.trim())
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-semibold text-lg mb-4">Add Player</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm mb-3"
            placeholder="Player name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            {...noAutofill}
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
