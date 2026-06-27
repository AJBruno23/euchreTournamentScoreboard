import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { noAutofill } from '../formProps'

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

export default function SetupPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter a valid name'); return }
    setLoading(true)
    try {
      await api.setupTournament({ name })
      await qc.invalidateQueries({ queryKey: ['tournament'] })
      navigate('/tournament')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Euchre Club</h1>
          <p className="text-slate-400">Tournament Scoreboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-6 space-y-5" autoComplete="off">
          <h2 className="text-lg font-semibold text-white">New Tournament</h2>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Tournament Name</label>
            <input
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Solo Tournament 1"
              value={name}
              onChange={e => setName(toTitleCase(e.target.value))}
              {...noAutofill}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Setting up...' : 'Create Tournament'}
          </button>
        </form>
      </div>
    </div>
  )
}
