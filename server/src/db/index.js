import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/tournament.db');
mkdirSync(join(__dirname, '../../data'), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournament (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT 'Euchre Club',
    status TEXT NOT NULL DEFAULT 'setup'
  );

  INSERT OR IGNORE INTO tournament (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1,
    score_adjustment INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL REFERENCES rounds(id),
    table_number INTEGER NOT NULL,
    team_a_score INTEGER NOT NULL DEFAULT 0,
    team_b_score INTEGER NOT NULL DEFAULT 0,
    scored INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES tables(id),
    player_id INTEGER NOT NULL REFERENCES players(id),
    team TEXT NOT NULL CHECK (team IN ('A', 'B'))
  );
`);

// Migrations for columns added after initial schema
try { db.exec('ALTER TABLE players ADD COLUMN score_adjustment INTEGER NOT NULL DEFAULT 0'); } catch {}

