import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdmin } from '../AdminContext'
import { api } from '../api'
import AdminView from '../components/admin/AdminView'
import ViewerView from '../components/viewer/ViewerView'
import PinModal from '../components/PinModal'
import RulesModal from '../components/RulesModal'
import ConfirmModal from '../components/ConfirmModal'

export default function TournamentPage({ tournament }) {
  const { isAdmin, logout } = useAdmin()
  const [showMenu, setShowMenu] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showEndTournamentModal, setShowEndTournamentModal] = useState(false)
  const [previewingPlayerView, setPreviewingPlayerView] = useState(false)
  const qc = useQueryClient()

  async function handleEndTournament() {
    setShowEndTournamentModal(false)
    try {
      await api.endTournament()
      await qc.invalidateQueries({ queryKey: ['tournament'] })
      await qc.invalidateQueries({ queryKey: ['leaderboard'] })
    } catch (e) {
      alert(e.message)
    }
  }

  function handleMenuAction(action) {
    setShowMenu(false)
    if (action === 'auth') {
      if (isAdmin) { logout(); setPreviewingPlayerView(false) }
      else setShowPinModal(true)
    } else if (action === 'rules') {
      setShowRulesModal(true)
    }
  }

  const statusLabel = {
    finished: 'Final Scores',
    active: 'In Progress',
    setup: 'Setup',
  }[tournament.status] ?? tournament.status

  const showAdminView = isAdmin && !previewingPlayerView

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl leading-none">{tournament.name}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{statusLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setPreviewingPlayerView(false)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  !previewingPlayerView ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin View
              </button>
              <button
                onClick={() => setPreviewingPlayerView(true)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  previewingPlayerView ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Player View
              </button>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(m => !m)}
              className="flex flex-col justify-center items-center gap-1 w-9 h-9 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <span className="w-4 h-0.5 bg-slate-300 rounded-full" />
              <span className="w-4 h-0.5 bg-slate-300 rounded-full" />
              <span className="w-4 h-0.5 bg-slate-300 rounded-full" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 min-w-[180px] overflow-hidden">
                  <button
                    onClick={() => handleMenuAction('auth')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    {isAdmin ? 'Exit Admin' : 'Admin Mode'}
                  </button>
                  <button
                    onClick={() => handleMenuAction('rules')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Show Rules
                  </button>
                  <button
                    onClick={isAdmin && tournament.status !== 'finished' ? () => { setShowMenu(false); setShowEndTournamentModal(true) } : undefined}
                    disabled={!isAdmin || tournament.status === 'finished'}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors disabled:text-slate-600 disabled:cursor-not-allowed enabled:text-red-400 enabled:hover:bg-slate-700 enabled:hover:text-red-300"
                  >
                    End Tournament
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {showAdminView
          ? <AdminView tournament={tournament} />
          : <ViewerView tournament={tournament} />
        }
      </main>

      {showPinModal && <PinModal onClose={() => setShowPinModal(false)} />}
      {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
      {showEndTournamentModal && (
        <ConfirmModal
          title="End the tournament?"
          body="Final scores will be shown to all viewers."
          onConfirm={handleEndTournament}
          onClose={() => setShowEndTournamentModal(false)}
        />
      )}
    </div>
  )
}
