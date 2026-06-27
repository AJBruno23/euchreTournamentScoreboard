import type { Round } from '../../types'

interface CurrentTablesProps {
  round: Round | null | undefined
}

export default function CurrentTables({ round }: CurrentTablesProps) {
  if (!round) {
    return <p className="text-slate-400 text-center py-8">No active round</p>
  }

  return (
    <div className="space-y-3">
      {round.tables.map(table => {
        const teamA = table.assignments.filter(a => a.team === 'A')
        const teamB = table.assignments.filter(a => a.team === 'B')
        return (
          <div key={table.id} className="bg-slate-800 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4">
                <p className="text-blue-400 text-sm mb-2">Team A</p>
                <p className="text-white text-xl font-semibold">{teamA.map(p => p.name).join(' & ')}</p>
              </div>
              <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4">
                <p className="text-red-400 text-sm mb-2">Team B</p>
                <p className="text-white text-xl font-semibold">{teamB.map(p => p.name).join(' & ')}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
