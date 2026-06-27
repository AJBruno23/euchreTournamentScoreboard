import type { Tournament, Player, Round, RoundSummary, LeaderboardData } from './types'

const BASE = 'http://localhost:3001/api'

async function request<T>(path: string, options: Omit<RequestInit, 'body'> & { body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json() as T & { error?: string }
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

export const api = {
  getTournament: () => request<Tournament>('/tournament'),
  setupTournament: (body: { name: string }) => request<{ ok: boolean }>('/tournament/setup', { method: 'POST', body }),
  verifyPin: (pin: string) => request<{ valid: boolean }>('/tournament/verify-pin', { method: 'POST', body: { pin } }),
  startTournament: () => request<{ ok: boolean }>('/tournament/start', { method: 'POST' }),
  endTournament: () => request<{ ok: boolean }>('/tournament/end', { method: 'POST' }),
  resetTournament: () => request<{ ok: boolean }>('/tournament/reset', { method: 'POST' }),

  getPlayers: () => request<Player[]>('/players'),
  addPlayer: (name: string) => request<Player>('/players', { method: 'POST', body: { name } }),
  updatePlayer: (id: number, data: Partial<Pick<Player, 'name' | 'active' | 'score_adjustment'>>) =>
    request<{ ok: boolean }>(`/players/${id}`, { method: 'PUT', body: data }),
  deletePlayer: (id: number) => request<{ ok: boolean }>(`/players/${id}`, { method: 'DELETE' }),

  getCurrentRound: () => request<Round | null>('/rounds/current'),
  getRoundHistory: () => request<RoundSummary[]>('/rounds/history'),
  generateRound: () => request<Round>('/rounds/generate', { method: 'POST' }),
  scoreTable: (roundId: number, tableId: number, scores: { team_a_score: number; team_b_score: number }) =>
    request<{ ok: boolean; round_complete: boolean }>(`/rounds/${roundId}/tables/${tableId}/score`, { method: 'PUT', body: scores }),
  reassignTable: (roundId: number, tableId: number, player_ids: number[]) =>
    request<{ ok: boolean }>(`/rounds/${roundId}/tables/${tableId}`, { method: 'PUT', body: { player_ids } }),

  getLeaderboard: () => request<LeaderboardData>('/leaderboard'),
}
