import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { USERS } from '../data/mockUsers.js'

const STORAGE_KEY = 'cuytrace.auth.user'

const AuthContext = createContext(null)

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = safeJsonParse(raw)
    if (!parsed?.role) return
    const restored = USERS.find((u) => u.role === parsed.role) || null
    setUser(restored)
  }, [])

  const login = useCallback((role) => {
    const nextUser = USERS.find((u) => u.role === role) || null
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: nextUser.role }))
      return true
    }
    localStorage.removeItem(STORAGE_KEY)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      user,
      users: USERS,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
