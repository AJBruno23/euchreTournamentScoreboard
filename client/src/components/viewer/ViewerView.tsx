import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import Leaderboard from './Leaderboard'
import CurrentTables from './CurrentTables'
import type { Tournament } from '../../types'

interface ViewerViewProps {
  tournament: Tournament
}

export default function ViewerView({ tournament }: ViewerViewProps) {
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

  if (tournament.status === 'finished') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="text-white font-semibold text-3xl mb-4">Final Scores</h2>
          <Leaderboard data={leaderboard} />
        </div>
      </div>
    )
  }

  return (
    <div>
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
