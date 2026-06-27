import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import TableReassign from './TableReassign'
import type { Round, TableRow } from '../../types'

interface AdminTableCardProps {
  round: Round
  table: TableRow
  onScored: (roundComplete: boolean) => Promise<void>
}

function AdminTableCard({ round, table, onScored }: AdminTableCardProps) {
  const [scores, setScores] = useState({ a: '', b: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(!!table.scored)
  const [reassigning, setReassigning] = useState(false)

  const teamA = table.assignments.filter(a => a.team === 'A')
  const teamB = table.assignments.filter(a => a.team === 'B')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.scoreTable(round.id, table.id, {
        team_a_score: Number(scores.a),
        team_b_score: Number(scores.b),
      })
      setDone(true)
      onScored(res.round_complete)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm font-medium">Table {table.table_number}</span>
          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">Scored</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-3">
            <p className="text-blue-400 text-xs mb-1.5">Team A</p>
            <p className="text-white text-sm">{teamA.map(p => p.name).join(' & ')}</p>
            <p className="text-blue-300 font-bold text-lg mt-1">{table.team_a_score} pts</p>
          </div>
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3">
            <p className="text-red-400 text-xs mb-1.5">Team B</p>
            <p className="text-white text-sm">{teamB.map(p => p.name).join(' & ')}</p>
            <p className="text-red-300 font-bold text-lg mt-1">{table.team_b_score} pts</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={submit} className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm font-medium">Table {table.table_number}</span>
          <button
            type="button"
            onClick={() => setReassigning(true)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reassign
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3">
            <p className="text-blue-400 text-xs mb-1">Team A</p>
            <p className="text-white text-sm mb-2">{teamA.map(p => p.name).join(' & ')}</p>
            <input
              type="number" min="0" max="32" placeholder="Points"
              value={scores.a}
              onChange={e => setScores(s => ({ ...s, a: e.target.value }))}
              className="w-full bg-slate-700 border border-blue-700/50 rounded px-2 py-1.5 text-white text-center text-lg font-bold focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
            <p className="text-red-400 text-xs mb-1">Team B</p>
            <p className="text-white text-sm mb-2">{teamB.map(p => p.name).join(' & ')}</p>
            <input
              type="number" min="0" max="32" placeholder="Points"
              value={scores.b}
              onChange={e => setScores(s => ({ ...s, b: e.target.value }))}
              className="w-full bg-slate-700 border border-red-700/50 rounded px-2 py-1.5 text-white text-center text-lg font-bold focus:outline-none focus:border-red-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || scores.a === '' || scores.b === ''}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Saving...' : 'Save Score'}
        </button>
      </form>
      {reassigning && (
        <TableReassign round={round} table={table} onClose={() => setReassigning(false)} />
      )}
    </>
  )
}

interface AdminTablesColumnProps {
  round: Round | null | undefined
}

export default function AdminTablesColumn({ round }: AdminTablesColumnProps) {
  const qc = useQueryClient()
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  const { data: history = [] } = useQuery({
    queryKey: ['rounds', 'history'],
    queryFn: api.getRoundHistory,
  })

  async function generateRound() {
    setGenerating(true)
    setGenerateError('')
    try {
      await api.generateRound()
      await qc.invalidateQueries({ queryKey: ['round', 'current'] })
    } catch (e) {
      setGenerateError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleScored(roundComplete: boolean) {
    await qc.invalidateQueries({ queryKey: ['round', 'current'] })
    await qc.invalidateQueries({ queryKey: ['leaderboard'] })
    if (roundComplete) {
      await qc.invalidateQueries({ queryKey: ['tournament'] })
      await qc.invalidateQueries({ queryKey: ['rounds', 'history'] })
    }
  }

  const nextRoundNumber = round ? round.round_number + 1 : history.length + 1

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-white">Tables</h2>
          <button
            onClick={generateRound}
            disabled={generating}
            className="text-slate-400 hover:text-white disabled:opacity-40 border border-slate-500 hover:border-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shrink-0"
            title={`Generate Round ${nextRoundNumber}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      </div>
      {generateError && (
        <p className="text-red-400 text-sm text-center mb-2">{generateError}</p>
      )}

      {!round && (
        <p className="text-slate-400 text-center py-8">No active round</p>
      )}

      {round && round.tables.map(table => (
        <AdminTableCard
          key={table.id}
          round={round}
          table={table}
          onScored={handleScored}
        />
      ))}
    </div>
  )
}
