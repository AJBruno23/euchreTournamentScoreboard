export type TournamentStatus = 'setup' | 'active' | 'finished'

export interface Tournament {
  id: number
  name: string
  status: TournamentStatus
}

export interface Player {
  id: number
  name: string
  active: number
  score_adjustment: number
}

export interface Assignment {
  id: number
  team: 'A' | 'B'
  name: string
}

export interface TableRow {
  id: number
  round_id: number
  table_number: number
  team_a_score: number
  team_b_score: number
  scored: number
  assignments: Assignment[]
}

export interface Round {
  id: number
  round_number: number
  status: 'active' | 'scored'
  tables: TableRow[]
}

export interface RoundSummary {
  id: number
  round_number: number
  status: 'active' | 'scored'
}

export interface Standing {
  id: number
  name: string
  active: number
  total_points: number
  rounds_played: number
  tables_won: number
  score_adjustment: number
}

export interface LeaderboardData {
  standings: Standing[]
}
