import { Router } from 'express'
import { db } from '../db/index.js'
import type {
  DbRound,
  DbTable,
  DbTableWithAssignments,
  AssignmentRow,
  PlayerRef,
  PairedTable,
  PartnerHistoryRow,
  PartnerPair,
  ScoredResult,
} from '../types.js'

const router = Router()

function getTableWithAssignments(tableId: number): AssignmentRow[] {
  return db.prepare(`
    SELECT a.team, p.id, p.name
    FROM assignments a
    JOIN players p ON a.player_id = p.id
    WHERE a.table_id = ?
  `).all(tableId) as unknown as AssignmentRow[]
}

function shufflePairings(players: PlayerRef[]): PairedTable[] {
  const shuffled = [...players]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const tables: PairedTable[] = []
  for (let i = 0; i + 3 < shuffled.length; i += 4) {
    const g = shuffled.slice(i, i + 4)
    tables.push({ team_a: [g[0], g[1]], team_b: [g[2], g[3]] })
  }
  return tables
}

function getPartnerHistory(): PartnerPair[] {
  const rows = db.prepare(`
    SELECT a.table_id, a.team, a.player_id
    FROM assignments a
    JOIN tables t ON a.table_id = t.id
    WHERE t.scored = 1
  `).all() as unknown as PartnerHistoryRow[]

  const byTableTeam: Record<string, number[]> = {}
  for (const a of rows) {
    const key = `${a.table_id}-${a.team}`
    if (!byTableTeam[key]) byTableTeam[key] = []
    byTableTeam[key].push(a.player_id)
  }
  const pairs: PartnerPair[] = []
  for (const members of Object.values(byTableTeam)) {
    if (members.length === 2) {
      const [p1, p2] = [...members].sort((a, b) => a - b) as [number, number]
      pairs.push({ p1, p2 })
    }
  }
  return pairs
}

function getPartneredBeforeSet(): Set<string> {
  return new Set(getPartnerHistory().map(r => `${r.p1}-${r.p2}`))
}

function generateSmartPairings(players: PlayerRef[], attempts = 50): PairedTable[] | null {
  const partneredBefore = getPartneredBeforeSet()

  let best: PairedTable[] | null = null
  let bestRepeatCount = Infinity

  for (let attempt = 0; attempt < attempts; attempt++) {
    const tables = shufflePairings(players)
    let repeats = 0
    for (const t of tables) {
      const [a1, a2] = t.team_a.map(p => p.id).sort((x, y) => x - y) as [number, number]
      const [b1, b2] = t.team_b.map(p => p.id).sort((x, y) => x - y) as [number, number]
      if (partneredBefore.has(`${a1}-${a2}`)) repeats++
      if (partneredBefore.has(`${b1}-${b2}`)) repeats++
    }
    if (repeats < bestRepeatCount) {
      bestRepeatCount = repeats
      best = tables
      if (repeats === 0) break
    }
  }
  return best
}

function getLastScoredRoundTables(): DbTableWithAssignments[] | null {
  const lastRound = db.prepare(`
    SELECT * FROM rounds WHERE status = 'scored' ORDER BY round_number DESC LIMIT 1
  `).get() as unknown as DbRound | undefined
  if (!lastRound) return null

  const tables = db.prepare('SELECT * FROM tables WHERE round_id = ? ORDER BY table_number').all(lastRound.id) as unknown as DbTable[]
  return tables.map(t => ({ ...t, assignments: getTableWithAssignments(t.id) }))
}

function generateRotationPairings(lastTables: DbTableWithAssignments[]): PairedTable[] {
  const sorted = [...lastTables].sort((a, b) => a.table_number - b.table_number)
  const numTables = sorted.length

  const results: ScoredResult[] = sorted.map(table => {
    const teamA = table.assignments.filter(a => a.team === 'A')
    const teamB = table.assignments.filter(a => a.team === 'B')
    return table.team_a_score >= table.team_b_score
      ? { winners: teamA, losers: teamB }
      : { winners: teamB, losers: teamA }
  })

  const partneredBefore = getPartneredBeforeSet()

  function wasPartnered(a: AssignmentRow, b: AssignmentRow): boolean {
    const [p1, p2] = [a.id, b.id].sort((x, y) => x - y) as [number, number]
    return partneredBefore.has(`${p1}-${p2}`)
  }

  function scoreOption(w: [AssignmentRow, AssignmentRow], l1: AssignmentRow, l2: AssignmentRow): number {
    return (wasPartnered(w[0], l1) ? 1 : 0) + (wasPartnered(w[1], l2) ? 1 : 0)
  }

  return results.map((result, i) => {
    const [w1, w2] = result.winners as [AssignmentRow, AssignmentRow]
    const [l1, l2] = results[(i - 1 + numTables) % numTables].losers as [AssignmentRow, AssignmentRow]

    const scoreA = scoreOption([w1, w2], l1, l2)
    const scoreB = scoreOption([w1, w2], l2, l1)
    const useOptionB = scoreB < scoreA || (scoreB === scoreA && Math.random() < 0.5)

    return useOptionB
      ? { team_a: [w1, l2], team_b: [w2, l1] }
      : { team_a: [w1, l1], team_b: [w2, l2] }
  })
}

router.get('/current', (_req, res) => {
  const round = db.prepare(`SELECT * FROM rounds WHERE status = 'active' ORDER BY round_number DESC LIMIT 1`).get() as unknown as DbRound | undefined
  if (!round) return res.json(null)

  const tables = db.prepare('SELECT * FROM tables WHERE round_id = ? ORDER BY table_number').all(round.id) as unknown as DbTable[]
  res.json({
    ...round,
    tables: tables.map(t => ({ ...t, assignments: getTableWithAssignments(t.id) })),
  })
})

router.get('/history', (_req, res) => {
  res.json(db.prepare('SELECT * FROM rounds ORDER BY round_number').all() as unknown as DbRound[])
})

router.post('/generate', (_req, res) => {
  const tournament = db.prepare('SELECT status FROM tournament WHERE id = 1').get() as unknown as { status: string }
  if (tournament.status !== 'active') {
    return res.status(400).json({ error: 'Tournament is not active' })
  }

  const activeRound = db.prepare(`SELECT id FROM rounds WHERE status = 'active'`).get()
  if (activeRound) {
    return res.status(400).json({ error: 'Score the current round before generating a new one' })
  }

  const players = db.prepare('SELECT id, name FROM players WHERE active = 1').all() as unknown as PlayerRef[]
  if (players.length < 4) return res.status(400).json({ error: 'Need at least 4 players' })

  const lastTables = getLastScoredRoundTables()
  let tables: PairedTable[] | null

  if (lastTables && lastTables.length > 0) {
    const lastPlayerIds = new Set(lastTables.flatMap(t => t.assignments.map(a => a.id)))
    const activePlayerIds = new Set(players.map(p => p.id))
    const setsMatch =
      lastPlayerIds.size === activePlayerIds.size &&
      [...lastPlayerIds].every(id => activePlayerIds.has(id))

    tables = setsMatch ? generateRotationPairings(lastTables) : generateSmartPairings(players)
  } else {
    tables = generateSmartPairings(players)
  }

  if (!tables || tables.length === 0) {
    return res.status(400).json({ error: 'Could not generate pairings' })
  }

  db.exec('BEGIN')
  try {
    const { max } = db.prepare('SELECT MAX(round_number) as max FROM rounds').get() as unknown as { max: number | null }
    const round = db.prepare('INSERT INTO rounds (round_number, status) VALUES (?, ?) RETURNING *')
      .get((max ?? 0) + 1, 'active') as unknown as DbRound

    const createdTables = tables.map((tableData, idx) => {
      const table = db.prepare(
        'INSERT INTO tables (round_id, table_number, team_a_score, team_b_score, scored) VALUES (?, ?, 0, 0, 0) RETURNING *'
      ).get(round.id, idx + 1) as unknown as DbTable

      tableData.team_a.forEach(p =>
        db.prepare('INSERT INTO assignments (table_id, player_id, team) VALUES (?, ?, ?)').run(table.id, p.id, 'A')
      )
      tableData.team_b.forEach(p =>
        db.prepare('INSERT INTO assignments (table_id, player_id, team) VALUES (?, ?, ?)').run(table.id, p.id, 'B')
      )

      return { ...table, assignments: getTableWithAssignments(table.id) }
    })

    db.exec('COMMIT')
    res.json({ ...round, tables: createdTables })
  } catch (err) {
    db.exec('ROLLBACK')
    res.status(500).json({ error: 'Could not generate round' })
  }
})

router.put('/:roundId/tables/:tableId/score', (req, res) => {
  const { team_a_score, team_b_score } = req.body as { team_a_score?: number; team_b_score?: number }
  if (team_a_score === undefined || team_b_score === undefined) {
    return res.status(400).json({ error: 'team_a_score and team_b_score are required' })
  }

  const table = db.prepare(
    'SELECT * FROM tables WHERE id = ? AND round_id = ?'
  ).get(Number(req.params.tableId), Number(req.params.roundId)) as unknown as DbTable | undefined
  if (!table) return res.status(404).json({ error: 'Table not found' })

  db.prepare('UPDATE tables SET team_a_score = ?, team_b_score = ?, scored = 1 WHERE id = ?')
    .run(team_a_score, team_b_score, table.id)

  const roundTables = db.prepare('SELECT scored FROM tables WHERE round_id = ?').all(Number(req.params.roundId)) as unknown as { scored: number }[]
  const allScored = roundTables.every(t => t.scored)

  if (allScored) {
    db.prepare(`UPDATE rounds SET status = 'scored' WHERE id = ?`).run(Number(req.params.roundId))
  }

  res.json({ ok: true, round_complete: allScored })
})

router.put('/:roundId/tables/:tableId', (req, res) => {
  const { player_ids } = req.body as { player_ids?: number[] }
  if (!player_ids || player_ids.length !== 4) {
    return res.status(400).json({ error: 'Exactly 4 player_ids required: [teamA1, teamA2, teamB1, teamB2]' })
  }

  const table = db.prepare(
    'SELECT * FROM tables WHERE id = ? AND round_id = ?'
  ).get(Number(req.params.tableId), Number(req.params.roundId)) as unknown as DbTable | undefined
  if (!table) return res.status(404).json({ error: 'Table not found' })
  if (table.scored) return res.status(400).json({ error: 'Cannot reassign a scored table' })

  db.prepare('DELETE FROM assignments WHERE table_id = ?').run(table.id)
  db.prepare('INSERT INTO assignments (table_id, player_id, team) VALUES (?, ?, ?)').run(table.id, player_ids[0], 'A')
  db.prepare('INSERT INTO assignments (table_id, player_id, team) VALUES (?, ?, ?)').run(table.id, player_ids[1], 'A')
  db.prepare('INSERT INTO assignments (table_id, player_id, team) VALUES (?, ?, ?)').run(table.id, player_ids[2], 'B')
  db.prepare('INSERT INTO assignments (table_id, player_id, team) VALUES (?, ?, ?)').run(table.id, player_ids[3], 'B')

  res.json({ ok: true })
})

export default router
