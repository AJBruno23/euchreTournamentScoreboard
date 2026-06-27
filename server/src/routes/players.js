import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const players = db.prepare('SELECT id, name, active, score_adjustment FROM players ORDER BY name COLLATE NOCASE').all();
  res.json(players);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const exists = db.prepare('SELECT id FROM players WHERE name = ? COLLATE NOCASE').get(name.trim());
  if (exists) return res.status(409).json({ error: 'Player already exists' });

  const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name.trim());
  res.json({ id: result.lastInsertRowid, name: name.trim(), active: 1, score_adjustment: 0 });
});

router.put('/:id', (req, res) => {
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(Number(req.params.id));
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const { name, active, score_adjustment } = req.body;
  if (name !== undefined) {
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const dupe = db.prepare('SELECT id FROM players WHERE name = ? COLLATE NOCASE AND id != ?')
      .get(name.trim(), Number(req.params.id));
    if (dupe) return res.status(409).json({ error: 'Player already exists' });
    db.prepare('UPDATE players SET name = ? WHERE id = ?').run(name.trim(), Number(req.params.id));
  }
  if (active !== undefined) db.prepare('UPDATE players SET active = ? WHERE id = ?').run(active ? 1 : 0, Number(req.params.id));
  if (score_adjustment !== undefined) db.prepare('UPDATE players SET score_adjustment = ? WHERE id = ?').run(score_adjustment, Number(req.params.id));

  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const player = db.prepare('SELECT id FROM players WHERE id = ?').get(Number(req.params.id));
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const inRound = db.prepare('SELECT id FROM assignments WHERE player_id = ?').get(Number(req.params.id));
  if (inRound) {
    db.prepare('UPDATE players SET active = 0 WHERE id = ?').run(Number(req.params.id));
  } else {
    db.prepare('DELETE FROM players WHERE id = ?').run(Number(req.params.id));
  }

  res.json({ ok: true });
});

export default router;
