import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'

export default function TableReassign({ round, table, onClose }) {
  const qc = useQueryClient()
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: api.getPlayers })
  const activePlayers = players.filter(p => p.active)

  const [selected, setSelected] = useState(table.assignments.map(a => ({ playerId: a.id, team: a.team })))

  const teamA = selected.filter(s => s.team === 'A').map(s => s.playerId)
  const teamB = selected.filter(s => s.team === 'B').map(s => s.playerId)

  function togglePlayer(playerId, team) {
    setSelected(prev => {
      const existing = prev.find(s => s.playerId === playerId)
      if (existing) {
        return prev.filter(s => s.playerId !== playerId)
      }
      if (prev.length >= 4) return prev
      return [...prev, { playerId, team }]
    })
  }

  async function save() {
    if (selected.length !== 4) return alert('Select exactly 4 players')
    const a = selected.filter(s => s.team === 'A').map(s => s.playerId)
    const b = selected.filter(s => s.team === 'B').map(s => s.playerId)
    if (a.length !== 2 || b.length !== 2) return alert('Each team must have exactly 2 players')

    try {
      await api.reassignTable(round.id, table.id, [...a, ...b])
      await qc.invalidateQueries({ queryKey: ['round', 'current'] })
      onClose()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-semibold text-xl">Reassign Table {table.table_number}</h2>
        <p className="text-slate-400 text-xs">Select 2 players per team (4 total)</p>

        <div className="grid grid-cols-2 gap-3">
          {['A', 'B'].map(team => (
            <div key={team} className={`rounded-lg p-3 ${team === 'A' ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-red-900/30 border border-red-800/50'}`}>
              <p className={`text-xs mb-2 ${team === 'A' ? 'text-blue-400' : 'text-red-400'}`}>Team {team}</p>
              {activePlayers.map(p => {
                const isSelected = selected.some(s => s.playerId === p.id && s.team === team)
                const isOtherTeam = selected.some(s => s.playerId === p.id && s.team !== team)
                return (
                  <button
                    key={p.id}
                    onClick={() => !isOtherTeam && togglePlayer(p.id, team)}
                    disabled={isOtherTeam}
                    className={`w-full text-left text-sm px-2 py-1 rounded mb-1 transition-colors ${
                      isSelected ? (team === 'A' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white') :
                      isOtherTeam ? 'text-slate-600 cursor-not-allowed' :
                      'text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {p.name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <p className="text-slate-400 text-xs text-center">
          {selected.filter(s => s.team === 'A').length}/2 Team A &nbsp;·&nbsp;
          {selected.filter(s => s.team === 'B').length}/2 Team B
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg transition-colors text-sm">Cancel</button>
          <button
            onClick={save}
            disabled={selected.length !== 4 || selected.filter(s => s.team === 'A').length !== 2}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
