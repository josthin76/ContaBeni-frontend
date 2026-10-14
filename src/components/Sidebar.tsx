import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Landmark, BookOpen, ShoppingCart,
  Receipt, Package, Users, ArrowLeftRight, LogOut,
  ChevronLeft, ChevronRight, Building2,
} from 'lucide-react'
import { ContaBeniLogo } from '@/components/ContaBeniLogo'
import { useAuth } from '@/context/AuthContext'
import { getInitials } from '@/lib/utils'

const navItems = [
  { to: '/app/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/app/cajas',         label: 'Cajas y Bancos', icon: Landmark },
  { to: '/app/contabilidad',  label: 'Contabilidad',  icon: BookOpen },
  { to: '/app/compras',       label: 'Compras',       icon: ShoppingCart },
  { to: '/app/gastos',        label: 'Gastos',        icon: Receipt },
  { to: '/app/productos',     label: 'Productos',     icon: Package },
  { to: '/app/proveedores',   label: 'Proveedores',   icon: Users },
  { to: '/app/tipo-cambio',   label: 'Tipo de Cambio',icon: ArrowLeftRight },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, empresa, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside
      className="sidebar relative flex flex-col h-screen transition-all duration-300 flex-shrink-0"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--surface-dark)',
        borderRight: '1px solid rgba(245,222,179,0.06)',
      }}
    >
      {/* Logo + empresa */}
      <div className="flex flex-col items-center py-5 px-3" style={{ borderBottom: '1px solid rgba(245,222,179,0.08)' }}>
        <div
          className="cursor-pointer mb-2"
          onClick={() => navigate('/app/dashboard')}
        >
          <ContaBeniLogo size="md" collapsed={collapsed} />
        </div>

        {!collapsed ? (
          <div className="w-full flex flex-col items-center mt-2">
            {/* Slot logo empresa */}
            <div
              onClick={() => navigate('/empresas')}
              className="flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-transform hover:scale-105"
              style={{
                width: 48, height: 48,
                border: '2px solid var(--brand-primary)',
                background: 'var(--surface-mid)',
                color: 'var(--text-on-dark)',
                fontFamily: 'Sora, sans-serif',
              }}
              title="Click para cambiar empresa"
            >
              {empresa ? getInitials(empresa.nombre) : '🏢'}
            </div>
            <p
              className="mt-1.5 text-xs text-center truncate max-w-[170px] font-semibold"
              style={{ color: 'var(--text-on-dark)' }}
            >
              {empresa?.nombre ?? 'Sin empresa'}
            </p>
            <button
              onClick={() => navigate('/empresas')}
              className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium py-1 px-2.5 rounded-md transition-all hover:bg-white/10 active:scale-95"
              style={{ color: 'var(--brand-secondary)' }}
              title="Volver a la selección de empresas"
            >
              <Building2 size={12} />
              <span>Ver empresas</span>
            </button>
          </div>
        ) : (
          <div
            onClick={() => navigate('/empresas')}
            className="mt-2 flex items-center justify-center rounded-full text-xs font-bold cursor-pointer hover:opacity-80"
            style={{
              width: 36, height: 36,
              border: '2px solid var(--brand-primary)',
              background: 'var(--surface-mid)',
              color: 'var(--text-on-dark)',
            }}
            title="Cambiar empresa"
          >
            {empresa ? getInitials(empresa.nombre) : '🏢'}
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-0.5 text-sm font-medium transition-all group"
            style={({ isActive }) => ({
              color: isActive ? 'var(--brand-secondary)' : 'var(--text-on-dark)',
              background: isActive ? 'var(--surface-mid)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
              paddingLeft: isActive ? 10 : 12,
            })}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer usuario */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid rgba(245,222,179,0.08)' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
              style={{ width: 30, height: 30, background: 'var(--brand-primary)', color: '#fff' }}
            >
              {getInitials(user?.nombre || (user as any)?.nombreCompleto || user?.email || (user as any)?.correo)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-on-dark)' }}>
                {user?.nombre || (user as any)?.nombreCompleto || 'Usuario'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
                {user?.email || (user as any)?.correo || ''}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-900/20"
          style={{ color: 'rgba(245,222,179,0.6)' }}
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 hidden lg:flex items-center justify-center rounded-full border shadow-md"
        style={{
          width: 24, height: 24,
          background: 'var(--surface-card)',
          borderColor: 'var(--border-warm)',
          color: 'var(--text-muted)',
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
