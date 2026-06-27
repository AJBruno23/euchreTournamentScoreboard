import { Router } from 'express'
import { db } from '../db/index.js'
import type { DbPlayer, DbTournament } from '../types.js'

const router = Router()

interface AssignmentScoreRow {
  team: 'A' | 'B'
  team_a_score: number
  team_b_score: number
  round_id: number
  scored: number
}

router.get('/', (_req, res) => {
  const players = db.prepare('SELECT id, name, active, score_adjustment FROM players WHERE active = 1').all() as unknown as DbPlayer[]

  const standings = players.map(player => {
    const assignments = db.prepare(`
      SELECT a.team, t.team_a_score, t.team_b_score, t.round_id, t.scored
      FROM assignments a
      JOIN tables t ON a.table_id = t.id
      WHERE a.player_id = ? AND t.scored = 1
    `).all(player.id) as unknown as AssignmentScoreRow[]

    let total_points = 0
    let tables_won = 0
    const roundIds = new Set<number>()

    for (const row of assignments) {
      roundIds.add(row.round_id)
      const myScore = row.team === 'A' ? row.team_a_score : row.team_b_score
      const theirScore = row.team === 'A' ? row.team_b_score : row.team_a_score
      total_points += myScore
      if (myScore > theirScore) tables_won++
    }

    total_points += player.score_adjustment ?? 0

    return {
      id: player.id,
      name: player.name,
      active: player.active,
      total_points,
      rounds_played: roundIds.size,
      tables_won,
      score_adjustment: player.score_adjustment ?? 0,
    }
  }).sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    if (b.tables_won !== a.tables_won) return b.tables_won - a.tables_won
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })

  res.json({ standings })
})

export default router
