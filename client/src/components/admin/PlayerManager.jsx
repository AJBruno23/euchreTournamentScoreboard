import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import ConfirmModal from '../ConfirmModal'
import { noAutofill } from '../../formProps'
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from '../icons'

export default function PlayerManager({ tournament }) {
  const qc = useQueryClient()
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: api.getPlayers })
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function addPlayer(e) {
    e.preventDefault()
    setError('')
    if (!newName.trim()) {
      setError('Please enter a valid name')
      return
    }
    try {
      await api.addPlayer(newName.trim())
      setNewName('')
      qc.invalidateQueries({ queryKey: ['players'] })
    } catch (e) {
      setError(e.message)
    }
  }

  async function saveEdit(id) {
    try {
      await api.updatePlayer(id, { name: editName })
      setEditId(null)
      qc.invalidateQueries({ queryKey: ['players'] })
    } catch (e) {
      alert(e.message)
    }
  }

  async function toggleActive(player) {
    try {
      await api.updatePlayer(player.id, { active: !player.active })
      qc.invalidateQueries({ queryKey: ['players'] })
    } catch (e) {
      alert(e.message)
    }
  }

  async function confirmDelete() {
    try {
      await api.deletePlayer(deleteTarget.id)
      qc.invalidateQueries({ queryKey: ['players'] })
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  const active = players.filter(p => p.active)
  const inactive = players.filter(p => !p.active)

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl p-4">
        <h2 className="text-white font-semibold text-xl mb-3">
          Players <span className="text-slate-400 text-sm font-normal">({active.length} active)</span>
        </h2>

        <form onSubmit={addPlayer} className="flex gap-2 mb-4" autoComplete="off">
          <input
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Player name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            {...noAutofill}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <ul className="space-y-1.5">
          {active.map(player => (
            <li key={player.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
              {editId === player.id ? (
                <>
                  <input
                    className="flex-1 bg-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                    {...noAutofill}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(player.id); if (e.key === 'Escape') setEditId(null) }}
                  />
                  <button onClick={() => saveEdit(player.id)} className="text-green-400 hover:text-green-300 p-1 transition-colors" title="Save"><CheckIcon /></button>
                  <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-300 p-1 transition-colors" title="Cancel"><XIcon /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-white text-sm">{player.name}</span>
                  {tournament.status === 'setup' && (
                    <>
                      <button
                        onClick={() => { setEditId(player.id); setEditName(player.name) }}
                        className="text-slate-400 hover:text-white p-1 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(player)}
                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        {inactive.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-slate-500 text-xs mb-2">Sitting out</p>
            <ul className="space-y-1">
              {inactive.map(player => (
                <li key={player.id} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-3 py-1.5">
                  <span className="flex-1 text-slate-400 text-sm line-through">{player.name}</span>
                  <button
                    onClick={() => toggleActive(player)}
                    className="text-green-400 hover:text-green-300 text-xs"
                  >Rejoin</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.name}?`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
