import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../AdminContext'
import { api } from '../../api'
import PlayerManager from './PlayerManager'
import Leaderboard from '../viewer/Leaderboard'
import AdminTablesColumn from './AdminTablesColumn'
import AddPlayerModal from '../AddPlayerModal'
import EditPlayerModal from '../EditPlayerModal'
import ConfirmModal from '../ConfirmModal'

function saveResultsAsJson(tournament, leaderboard) {
  const payload = {
    tournament: tournament.name,
    date: new Date().toLocaleDateString(),
    standings: leaderboard.standings.map((p, i) => ({
      place: i + 1,
      name: p.name,
      points: p.total_points,
      rounds_played: p.rounds_played,
      tables_won: p.tables_won,
    })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${tournament.name.replace(/\s+/g, '_')}_results.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminView({ tournament }) {
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { logout } = useAdmin()

  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: api.getPlayers })
  const activePlayers = players.filter(p => p.active)

  const { data: currentRound } = useQuery({
    queryKey: ['round', 'current'],
    queryFn: api.getCurrentRound,
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard,
  })

  async function handleStart() {
    try {
      await api.startTournament()
      await qc.invalidateQueries({ queryKey: ['tournament'] })
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleNewTournament() {
    try {
      await api.resetTournament()
      // Update the cached status synchronously so the '/' route renders SetupPage
      // immediately — avoids a transient re-render on /tournament (the flash).
      qc.setQueryData(['tournament'], prev => prev ? { ...prev, status: 'setup' } : prev)
      logout()
      navigate('/')
      qc.invalidateQueries()
    } catch (e) {
      alert(e.message)
    }
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (tournament.status === 'finished') {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="text-white font-semibold text-xl mb-1">Final Scores</h2>
          <p className="text-slate-400 text-sm mb-4">{tournament.name}</p>
          <Leaderboard data={leaderboard} />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => leaderboard && saveResultsAsJson(tournament, leaderboard)}
            disabled={!leaderboard}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Save Results
          </button>
          <button
            onClick={handleNewTournament}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Start New Tournament
          </button>
        </div>
      </div>
    )
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (tournament.status === 'setup') {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 font-medium">Tournament not started</p>
            <p className="text-blue-400 text-sm">Add at least 4 players</p>
          </div>
          <button
            onClick={handleStart}
            disabled={activePlayers.length < 4}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Start Tournament
          </button>
        </div>
        <PlayerManager tournament={tournament} />
      </div>
    )
  }

  // ── Active ────────────────────────────────────────────────────────────────
  async function handleAddPlayer(name) {
    await api.addPlayer(name)
    qc.invalidateQueries({ queryKey: ['players'] })
    qc.invalidateQueries({ queryKey: ['leaderboard'] })
  }

  async function handleEditPlayer(id, { name, score }) {
    const player = leaderboard?.standings.find(p => p.id === id)
    const baseScore = player ? player.total_points - (player.score_adjustment ?? 0) : 0
    const adjustment = score - baseScore
    await api.updatePlayer(id, { name, score_adjustment: adjustment })
    qc.invalidateQueries({ queryKey: ['players'] })
    qc.invalidateQueries({ queryKey: ['leaderboard'] })
  }

  async function handleDeletePlayer() {
    await api.deletePlayer(deleteTarget.id)
    setDeleteTarget(null)
    qc.invalidateQueries({ queryKey: ['players'] })
    qc.invalidateQueries({ queryKey: ['leaderboard'] })
  }

  return (
    <div>
      <div className="flex min-h-screen">
        {/* Left column */}
        <div className="flex-1 p-6">
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-2xl">Leaderboard</h2>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="text-slate-400 hover:text-white border border-slate-500 hover:border-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shrink-0"
                title="Add player"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
          <Leaderboard data={leaderboard} onEdit={setEditTarget} onDelete={setDeleteTarget} />
        </div>

        <div className="w-px bg-slate-700 shrink-0" />

        {/* Right column */}
        <div className="flex-1 p-6">
          <AdminTablesColumn round={currentRound} />
        </div>
      </div>

      {showAddPlayer && (
        <AddPlayerModal onAdd={handleAddPlayer} onClose={() => setShowAddPlayer(false)} />
      )}
      {editTarget && (
        <EditPlayerModal player={editTarget} onSave={handleEditPlayer} onClose={() => setEditTarget(null)} />
      )}
      {deleteTarget && (
        <ConfirmModal title={`Delete ${deleteTarget.name}?`} onConfirm={handleDeletePlayer} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
