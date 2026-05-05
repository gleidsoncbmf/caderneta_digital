'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { AuthState, LoginPayload, RegisterPayload, User } from '@/types/auth'
import { authService } from '@/services/authService'

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const setAuth = (user: User, token: string) => {
    localStorage.setItem('auth_token', token)
    setState({ user, token, isAuthenticated: true, isLoading: false })
  }

  const clearAuth = () => {
    localStorage.removeItem('auth_token')
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }))
      return
    }

    authService.me()
      .then((user) => setState({ user, token, isAuthenticated: true, isLoading: false }))
      .catch(() => clearAuth())
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload)
    setAuth(result.user, result.token)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload)
    setAuth(result.user, result.token)
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    clearAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
