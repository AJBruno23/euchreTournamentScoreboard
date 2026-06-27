import { Router } from 'express'
import { db } from '../db/index.js'
import { ADMIN_PINS } from '../config.js'
import type { DbTournament } from '../types.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(db.prepare('SELECT id, name, status FROM tournament WHERE id = 1').get() as unknown as DbTournament)
})

router.post('/setup', (req, res) => {
  const { name } = req.body as { name?: string }
  if (!name?.trim()) return res.status(400).json({ error: 'Tournament name is required' })

  db.prepare('UPDATE tournament SET name = ?, status = ? WHERE id = 1')
    .run(name.trim(), 'setup')

  db.exec('DELETE FROM assignments; DELETE FROM tables; DELETE FROM rounds;')

  res.json({ ok: true })
})

router.post('/verify-pin', (req, res) => {
  const { pin } = req.body as { pin?: unknown }
  res.json({ valid: ADMIN_PINS.includes(String(pin)) })
})

router.post('/start', (_req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM players WHERE active = 1').get() as unknown as { count: number }
  if (count < 4) return res.status(400).json({ error: 'Need at least 4 active players' })
  db.prepare('UPDATE tournament SET status = ? WHERE id = 1').run('active')
  res.json({ ok: true })
})

router.post('/end', (_req, res) => {
  db.prepare('UPDATE tournament SET status = ? WHERE id = 1').run('finished')
  res.json({ ok: true })
})

router.post('/reset', (_req, res) => {
  db.exec(`
    DELETE FROM assignments;
    DELETE FROM tables;
    DELETE FROM rounds;
    DELETE FROM players;
    UPDATE tournament SET name = 'Euchre Club', status = 'setup' WHERE id = 1;
  `)
  res.json({ ok: true })
})

export default router
