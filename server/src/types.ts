export type TournamentStatus = 'setup' | 'active' | 'finished'

export interface DbTournament {
  id: number
  name: string
  status: TournamentStatus
}

export interface DbPlayer {
  id: number
  name: string
  active: number
  score_adjustment: number
}

export interface DbRound {
  id: number
  round_number: number
  status: 'active' | 'scored'
}

export interface DbTable {
  id: number
  round_id: number
  table_number: number
  team_a_score: number
  team_b_score: number
  scored: number
}

export interface AssignmentRow {
  team: 'A' | 'B'
  id: number
  name: string
}

export interface DbTableWithAssignments extends DbTable {
  assignments: AssignmentRow[]
}

export interface PlayerRef {
  id: number
  name: string
}

export interface PairedTable {
  team_a: PlayerRef[]
  team_b: PlayerRef[]
}

export interface PartnerHistoryRow {
  table_id: number
  team: 'A' | 'B'
  player_id: number
}

export interface PartnerPair {
  p1: number
  p2: number
}

export interface ScoredResult {
  winners: AssignmentRow[]
  losers: AssignmentRow[]
}
