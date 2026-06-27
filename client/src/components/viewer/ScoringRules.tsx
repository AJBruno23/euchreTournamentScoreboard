interface Rule {
  scenario: string
  points: string
  team: string
  color: string
}

const RULES: Rule[] = [
  { scenario: 'Win 3 or 4 tricks', points: '+1 pt', team: 'Winning team', color: 'text-green-400' },
  { scenario: 'Win all 5 tricks', points: '+2 pts', team: 'Winning team', color: 'text-green-400' },
  { scenario: 'Euchre (opponents wins 3+ tricks when you called trump)', points: '+2 pts', team: 'Defending team', color: 'text-red-400' },
  { scenario: 'Go alone — caller declares before the hand, partner sits out, caller wins all 5 tricks', points: '+4 pts', team: 'Winning team', color: 'text-green-400' },
]

export default function ScoringRules() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl p-4">
        <h2 className="text-white font-semibold text-xl mb-3">Scoring Rules</h2>
        <div className="space-y-3">
          {RULES.map((r, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-700/40 rounded-lg p-3">
              <span className={`text-xl font-bold w-16 shrink-0 ${r.color}`}>{r.points}</span>
              <div>
                <p className="text-white text-sm font-medium">{r.scenario}</p>
                <p className="text-slate-400 text-xs">{r.team} earns points per player</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4">
        <h2 className="text-white font-semibold text-xl mb-3">Tournament Format</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-blue-400 shrink-0">•</span>
            Solo tournament — each player earns their own points
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 shrink-0">•</span>
            Tables of 4 (2 teams of 2)
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 shrink-0">•</span>
            Winners at each table stay and play against the winners from another table next round; losers rotate to play against other losers
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 shrink-0">•</span>
            Each player will deal twice per round and earn as many points as they can
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 shrink-0">•</span>
            In the case of a tie, one more round will be played
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 shrink-0">•</span>
            Player with the most points at the end wins
          </li>
        </ul>
      </div>
    </div>
  )
}
