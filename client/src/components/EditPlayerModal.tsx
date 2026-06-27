import { useState } from 'react'
import { noAutofill } from '../formProps'
import type { Standing } from '../types'

interface EditPlayerModalProps {
  player: Standing
  onSave: (id: number, data: { name: string; score: number }) => Promise<void>
  onClose: () => void
}

export default function EditPlayerModal({ player, onSave, onClose }: EditPlayerModalProps) {
  const [name, setName] = useState(player.name)
  const [score, setScore] = useState(String(player.total_points))
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name cannot be empty'); return }
    const parsedScore = parseInt(score, 10)
    if (isNaN(parsedScore) || parsedScore < 0) { setError('Score must be a non-negative number'); return }
    try {
      await onSave(player.id, { name: name.trim(), score: parsedScore })
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-semibold text-lg mb-4">Edit Player</h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Name</label>
            <input
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              {...noAutofill}
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Score</label>
            <input
              type="number"
              min="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
              value={score}
              onChange={e => setScore(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
