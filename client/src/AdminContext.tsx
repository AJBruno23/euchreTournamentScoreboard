import { createContext, useContext, useState, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { api } from './api'

interface AdminContextValue {
  isAdmin: boolean
  login: (pin: string) => Promise<boolean>
  logout: () => void
  error: string
  setError: Dispatch<SetStateAction<string>>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')

  const login = useCallback(async (pin: string): Promise<boolean> => {
    setError('')
    try {
      const { valid } = await api.verifyPin(pin)
      if (valid) {
        setIsAdmin(true)
        return true
      } else {
        setError('Incorrect PIN')
        return false
      }
    } catch (e) {
      setError((e as Error).message)
      return false
    }
  }, [])

  const logout = useCallback(() => setIsAdmin(false), [])

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, error, setError }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
