# Euchre Tournament Scoreboard

Local React + Node.js scoreboard for individual-format euchre tournaments.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v3 + TanStack Query + React Router (`client/`)
- **Backend**: Express.js + `node:sqlite` built-in module (`server/`)
- **Database**: SQLite file at `server/data/tournament.db` (auto-created on first run, gitignored)
- **Node version**: 22 (see `.nvmrc`) — required for `node:sqlite`

## Starting the app

### Both services at once (recommended)

```bash
npm run dev
```

Starts the Express API on `:3001` and the Vite dev server on `:5173` concurrently.
Open http://localhost:5173 in a browser.

### First-time setup

```bash
npm run install:all   # installs root + client + server dependencies
npm run dev
```

### Individual services

```bash
# Backend only
cd server && npm run dev

# Frontend only
cd client && npm run dev
```

## Project structure

```
euchreTournamentScoreboard/
├── client/                  # Vite React app
│   └── src/
│       ├── api.js           # All fetch calls to the backend
│       ├── AdminContext.jsx # PIN-based admin auth state
│       ├── pages/           # SetupPage, TournamentPage
│       └── components/
│           ├── admin/       # AdminView, PlayerManager, RoundManager, ScoreEntry, TableReassign
│           └── viewer/      # ViewerView, Leaderboard, CurrentTables, ScoringRules
├── server/
│   ├── src/
│   │   ├── db/index.js      # SQLite setup + schema
│   │   ├── index.js         # Express entry point
│   │   └── routes/          # tournament, players, rounds, leaderboard
│   └── data/                # SQLite DB lives here (gitignored)
└── package.json             # Root — runs both via concurrently
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tournament` | Get current tournament (no PIN field) |
| POST | `/api/tournament/setup` | Create/reset tournament |
| POST | `/api/tournament/verify-pin` | Validate admin PIN |
| POST | `/api/tournament/start` | Activate tournament |
| POST | `/api/tournament/end` | Mark tournament finished |
| GET | `/api/players` | List all players |
| POST | `/api/players` | Add player |
| PUT | `/api/players/:id` | Edit name or active status |
| DELETE | `/api/players/:id` | Remove (soft-deletes if they have round history) |
| GET | `/api/rounds/current` | Active round + tables + assignments |
| GET | `/api/rounds/history` | All rounds |
| POST | `/api/rounds/generate` | Generate next round pairings |
| PUT | `/api/rounds/:rid/tables/:tid/score` | Submit scores for a table |
| PUT | `/api/rounds/:rid/tables/:tid` | Manually reassign players at a table |
| GET | `/api/leaderboard` | Standings + tournament meta |

## Key behaviors

- **Admin auth**: PIN set at tournament setup. No sessions — just a client-side flag toggled by correct PIN entry. Viewer mode is the default.
- **Pairing algorithm**: 50-attempt random shuffle that minimizes repeat partnerships by tracking historical pairings in `table_assignments`.
- **Round lifecycle**: generate → play → enter scores per table → all tables scored → round auto-closes → generate next round.
- **Win condition auto-trigger**: after each table is scored, the server checks if the win condition (target points or fixed rounds) has been met and marks the tournament finished.
- **`node:sqlite` flag**: the server `dev` script includes `--experimental-sqlite` — required in Node 22. This is intentional, not a mistake.

## No Python dependencies

This is a pure Node.js project. No `requirements.txt` is needed.
