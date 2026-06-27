const BASE = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export const api = {
  getTournament: () => request('/tournament'),
  setupTournament: (body) => request('/tournament/setup', { method: 'POST', body }),
  verifyPin: (pin) => request('/tournament/verify-pin', { method: 'POST', body: { pin } }),
  startTournament: () => request('/tournament/start', { method: 'POST' }),
  endTournament: () => request('/tournament/end', { method: 'POST' }),
  resetTournament: () => request('/tournament/reset', { method: 'POST' }),

  getPlayers: () => request('/players'),
  addPlayer: (name) => request('/players', { method: 'POST', body: { name } }),
  updatePlayer: (id, data) => request(`/players/${id}`, { method: 'PUT', body: data }),
  deletePlayer: (id) => request(`/players/${id}`, { method: 'DELETE' }),

  getCurrentRound: () => request('/rounds/current'),
  getRoundHistory: () => request('/rounds/history'),
  generateRound: () => request('/rounds/generate', { method: 'POST' }),
  scoreTable: (roundId, tableId, scores) =>
    request(`/rounds/${roundId}/tables/${tableId}/score`, { method: 'PUT', body: scores }),
  reassignTable: (roundId, tableId, player_ids) =>
    request(`/rounds/${roundId}/tables/${tableId}`, { method: 'PUT', body: { player_ids } }),

  getLeaderboard: () => request('/leaderboard'),
};
