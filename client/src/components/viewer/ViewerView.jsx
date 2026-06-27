import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import Leaderboard from './Leaderboard'
import CurrentTables from './CurrentTables'

export default function ViewerView({ tournament }) {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard,
  })

  const { data: currentRound } = useQuery({
    queryKey: ['round', 'current'],
    queryFn: api.getCurrentRound,
  })

  if (tournament.status === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 -mt-32">
        <p className="text-8xl mb-6">♠</p>
        <h2 className="text-white text-4xl font-bold mb-4">Starting Tournament</h2>
        <p className="text-slate-400 text-xl">Waiting for the admin to add players and start the tournament...</p>
      </div>
    )
  }

  return (
    <div>
      {tournament.status === 'finished' && (
        <div className="bg-green-900/40 border-b border-green-700 px-4 py-3 text-center">
          <p className="text-green-200 font-semibold">Final Scores</p>
          {leaderboard?.standings[0] && (
            <p className="text-green-400 text-sm">Winner: {leaderboard.standings[0].name}</p>
          )}
        </div>
      )}

      <div className="flex min-h-screen">
        <div className="flex-1 p-6">
          <h2 className="text-white font-semibold mb-8 text-center text-2xl">Leaderboard</h2>
          <Leaderboard data={leaderboard} />
        </div>
        <div className="w-px bg-slate-700 shrink-0" />
        <div className="flex-1 p-6">
          <h2 className="text-white font-semibold mb-8 text-center text-2xl">Tables</h2>
          <CurrentTables round={currentRound} />
        </div>
      </div>
    </div>
  )
}
