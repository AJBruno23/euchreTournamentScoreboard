import { PencilIcon, TrashIcon } from '../icons'

export default function Leaderboard({ data, onEdit, onDelete }) {
  if (!data) return <p className="text-slate-400 text-center py-8">Loading...</p>
  const { standings } = data

  if (standings.length === 0) {
    return <p className="text-slate-400 text-center py-8">No scores yet</p>
  }

  const isAdmin = !!(onEdit || onDelete)

  // Compute display rank accounting for ties
  const ranks = standings.map((player, i) => {
    if (i === 0) return 1
    return standings[i - 1].total_points === player.total_points ? null : i + 1
  })
  const displayRanks = ranks.map((r, i) => {
    if (r !== null) return r
    for (let j = i - 1; j >= 0; j--) {
      if (ranks[j] !== null) return ranks[j]
    }
    return 1
  })
  // A rank is tied if more than one player shares it
  const rankCounts = displayRanks.reduce((acc, r) => { acc[r] = (acc[r] ?? 0) + 1; return acc }, {})

  return (
    <div className="space-y-2.5 mx-10">
      {standings.map((player, i) => {
        const rank = displayRanks[i]
        const isFirst = rank === 1 && player.total_points > 0
        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 rounded-xl px-5 py-4 ${isFirst ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-slate-800'}`}
          >
            <span className="w-8 text-center text-slate-400 font-semibold text-sm shrink-0">
              {rankCounts[rank] > 1 ? `T-${rank}` : rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-lg ${isFirst ? 'text-amber-200' : 'text-white'}`}>{player.name}</p>
              <p className="text-slate-400 text-xs">{player.rounds_played} rounds played · {player.tables_won} tables won</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-2xl font-bold ${isFirst ? 'text-amber-300' : 'text-white'}`}>{player.total_points}</p>
              <p className="text-slate-500 text-xs">pts</p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(player)}
                    className="text-slate-400 hover:text-white p-1.5 transition-colors"
                    title="Edit player"
                  >
                    <PencilIcon />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(player)}
                    className="text-red-400 hover:text-red-300 p-1.5 transition-colors"
                    title="Delete player"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
