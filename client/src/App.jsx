import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import SetupPage from './pages/SetupPage'
import TournamentPage from './pages/TournamentPage'

function App() {
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament'],
    queryFn: api.getTournament,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          tournament && tournament.status !== 'setup'
            ? <Navigate to="/tournament" replace />
            : <SetupPage />
        }
      />
      <Route
        path="/tournament"
        element={
          tournament
            ? <TournamentPage tournament={tournament} />
            : <Navigate to="/" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
