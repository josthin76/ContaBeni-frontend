import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAuth } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, empresa, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--surface-light)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!empresa) return <Navigate to="/empresas" replace />

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay: solo en móvil/tablet, cierra el drawer al tocar fuera */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: fixed en <lg (fuera del flujo, no consume ancho) / static en lg+ (como siempre) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenu={() => setMobileOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-light)', padding: 24 }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
