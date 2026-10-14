import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Building2, Menu } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { getInitials } from '@/lib/utils'
import type { TipoCambio } from '@/types'

const breadcrumbs: Record<string, string> = {
  '/app/dashboard':    'Dashboard',
  '/app/cajas':        'Cajas y Bancos',
  '/app/contabilidad': 'Contabilidad',
  '/app/compras':      'Compras',
  '/app/gastos':       'Gastos',
  '/app/productos':    'Productos',
  '/app/proveedores':  'Proveedores',
  '/app/tipo-cambio':  'Tipo de Cambio',
}

export function Header({ onMenu }: { onMenu?: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, empresa } = useAuth()
  const currentPage = breadcrumbs[pathname] ?? 'ContaBeni'

  const { data: tipoCambio } = useQuery<TipoCambio>({
    queryKey: ['tipo-cambio'],
    queryFn: () => api.get('/tipo-cambio').then(r => r.data).catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!user,
  })

  return (
    <header
      className="header flex items-center justify-between px-4 lg:px-6"
      style={{
        height: 64,
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-warm)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Izquierda: hamburguesa (solo <lg) + breadcrumb */}
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <button
          onClick={onMenu}
          className="lg:hidden -ml-1 mr-1 p-2.5 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>
        <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>ContaBeni</span>
        <span className="hidden sm:inline" style={{ color: 'var(--border-input)' }}>/</span>
        <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{currentPage}</span>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Botón para volver a ver las empresas */}
        <button
          onClick={() => navigate('/empresas')}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:bg-emerald-50 active:scale-95 shadow-sm"
          style={{
            background: 'rgba(20, 94, 50, 0.08)',
            color: 'var(--brand-primary)',
            border: '1px solid rgba(20, 94, 50, 0.25)',
          }}
          title="Ver y seleccionar empresas"
        >
          <Building2 size={14} />
          <span className="hidden sm:inline">
            {empresa?.nombre ? `Empresa: ${empresa.nombre}` : 'Mis Empresas'}
          </span>
          <span className="text-[11px] font-normal underline ml-0.5 opacity-80 sm:inline hidden">
            (Cambiar)
          </span>
          <span className="sm:hidden">Empresas</span>
        </button>

        {/* Chip tipo de cambio */}
        <button
          onClick={() => navigate('/app/tipo-cambio')}
          className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--brand-primary)' }}
          title="Ver cotización y calculadora de cambio"
        >
          <span>USD</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span>
          <span>Bs {Number(tipoCambio?.tasa || 11.70).toFixed(2)}</span>
        </button>

        {/* Avatar usuario */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold"
            style={{ width: 34, height: 34, background: 'var(--brand-primary)', color: '#fff' }}
          >
            {getInitials(user?.nombre || (user as any)?.nombreCompleto || user?.email || (user as any)?.correo)}
          </div>
          <span className="hidden text-sm font-medium sm:block" style={{ color: 'var(--text-primary)' }}>
            {user?.nombre || (user as any)?.nombreCompleto || 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  )
}
