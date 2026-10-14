import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, Empresa } from '@/types'

interface AuthState {
  user: User | null
  empresa: Empresa | null
  isLoading: boolean
  login: (token: string, refreshToken: string, user: any) => void
  logout: () => void
  setEmpresa: (empresa: Empresa) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [empresa, setEmpresaState] = useState<Empresa | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    const storedEmpresa = localStorage.getItem('empresa')
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser)
        setUser({
          ...u,
          email: u.email || u.correo || '',
          correo: u.correo || u.email || '',
          nombre: u.nombre || u.nombreCompleto || 'Usuario',
          nombreCompleto: u.nombreCompleto || u.nombre || 'Usuario',
        })
      } catch {
        localStorage.removeItem('user')
      }
    }
    if (storedEmpresa) {
      try {
        const e = JSON.parse(storedEmpresa)
        setEmpresaState({
          ...e,
          activa: e.activo ?? e.activa ?? true,
          activo: e.activo ?? e.activa ?? true,
          moneda: e.moneda ?? e.monedaPrincipal ?? 'BOB',
          monedaPrincipal: e.moneda ?? e.monedaPrincipal ?? 'BOB',
        })
      } catch {
        localStorage.removeItem('empresa')
        localStorage.removeItem('empresaId')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, refreshToken: string, userData: any) => {
    const normalizedUser: User = {
      ...userData,
      email: userData.email || userData.correo || '',
      correo: userData.correo || userData.email || '',
      nombre: userData.nombre || userData.nombreCompleto || 'Usuario',
      nombreCompleto: userData.nombreCompleto || userData.nombre || 'Usuario',
    }
    localStorage.setItem('access_token', token)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user', JSON.stringify(normalizedUser))
    setUser(normalizedUser)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    setEmpresaState(null)
    window.location.href = '/login'
  }

  const setEmpresa = (emp: Empresa) => {
    const normalizedEmp: Empresa = {
      ...emp,
      activa: emp.activo ?? emp.activa ?? true,
      activo: emp.activo ?? emp.activa ?? true,
      moneda: emp.moneda ?? emp.monedaPrincipal ?? 'BOB',
      monedaPrincipal: emp.moneda ?? emp.monedaPrincipal ?? 'BOB',
    }
    localStorage.setItem('empresaId', normalizedEmp.id)
    localStorage.setItem('empresa', JSON.stringify(normalizedEmp))
    setEmpresaState(normalizedEmp)
  }

  return (
    <AuthContext.Provider value={{ user, empresa, isLoading, login, logout, setEmpresa }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
