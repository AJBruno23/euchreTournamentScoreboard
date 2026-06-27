import express from 'express';
import cors from 'cors';
import tournamentRouter from './routes/tournament.js';
import playersRouter from './routes/players.js';
import roundsRouter from './routes/rounds.js';
import leaderboardRouter from './routes/leaderboard.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/tournament', tournamentRouter);
app.use('/api/players', playersRouter);
app.use('/api/rounds', roundsRouter);
app.use('/api/leaderboard', leaderboardRouter);

app.listen(PORT, () => {
  console.log(`Euchre server running on http://localhost:${PORT}`);
});
