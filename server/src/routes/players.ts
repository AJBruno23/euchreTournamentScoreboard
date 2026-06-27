import { Router } from 'express'
import { db } from '../db/index.js'
import type { DbPlayer } from '../types.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(db.prepare('SELECT id, name, active, score_adjustment FROM players ORDER BY name COLLATE NOCASE').all() as unknown as DbPlayer[])
})

router.post('/', (req, res) => {
  const { name } = req.body as { name?: string }
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

  const exists = db.prepare('SELECT id FROM players WHERE name = ? COLLATE NOCASE').get(name.trim())
  if (exists) return res.status(409).json({ error: 'Player already exists' })

  const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name.trim())
  res.json({ id: result.lastInsertRowid, name: name.trim(), active: 1, score_adjustment: 0 })
})

router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
  if (!player) return res.status(404).json({ error: 'Player not found' })

  const { name, active, score_adjustment } = req.body as { name?: string; active?: unknown; score_adjustment?: number }

  if (name !== undefined) {
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
    const dupe = db.prepare('SELECT id FROM players WHERE name = ? COLLATE NOCASE AND id != ?').get(name.trim(), id)
    if (dupe) return res.status(409).json({ error: 'Player already exists' })
    db.prepare('UPDATE players SET name = ? WHERE id = ?').run(name.trim(), id)
  }
  if (active !== undefined) db.prepare('UPDATE players SET active = ? WHERE id = ?').run(active ? 1 : 0, id)
  if (score_adjustment !== undefined) db.prepare('UPDATE players SET score_adjustment = ? WHERE id = ?').run(score_adjustment, id)

  res.json({ ok: true })
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
  if (!player) return res.status(404).json({ error: 'Player not found' })

  const inRound = db.prepare('SELECT id FROM assignments WHERE player_id = ?').get(id)
  if (inRound) {
    db.prepare('UPDATE players SET active = 0 WHERE id = ?').run(id)
  } else {
    db.prepare('DELETE FROM players WHERE id = ?').run(id)
  }

  res.json({ ok: true })
})

export default router
