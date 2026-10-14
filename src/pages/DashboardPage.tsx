import { useQuery } from '@tanstack/react-query'
import { Landmark, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '@/lib/api'
import { KpiCard } from '@/components/KpiCard'
import { StatusChip } from '@/components/StatusChip'
import { AmountCell } from '@/components/AmountCell'
import { formatCurrency, formatDate, getTransaccionFecha } from '@/lib/utils'
import type { CuentaFinanciera, Transaccion } from '@/types'

// Datos simulados para el gráfico hasta integrar el endpoint real de histórico
const chartData = [
  { mes: 'May', ingresos: 48000, gastos: 32000 },
  { mes: 'Jun', ingresos: 52000, gastos: 38000 },
  { mes: 'Jul', ingresos: 45000, gastos: 29000 },
  { mes: 'Ago', ingresos: 61000, gastos: 42000 },
  { mes: 'Sep', ingresos: 55000, gastos: 36000 },
  { mes: 'Oct', ingresos: 70000, gastos: 44000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-white px-3 py-2 shadow-lg text-xs" style={{ border: '1px solid var(--border-warm)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ color: '#2E7D32' }}>Ingresos: {formatCurrency(payload[0]?.value)}</p>
        <p style={{ color: '#C62828' }}>Gastos: {formatCurrency(payload[1]?.value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data: cuentas = [], isLoading: loadingCuentas } = useQuery<CuentaFinanciera[]>({
    queryKey: ['cajas', 'cuentas'],
    queryFn: () =>
      api.get('/cajas/cuentas').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: transacciones = [], isLoading: loadingTxs } = useQuery<Transaccion[]>({
    queryKey: ['cajas', 'transacciones'],
    queryFn: () =>
      api.get('/cajas/transacciones').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: resultados } = useQuery({
    queryKey: ['contabilidad', 'estado-resultados'],
    queryFn: () => {
      const hoy = new Date()
      const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10)
      const hasta = hoy.toISOString().slice(0, 10)
      return api.get(`/contabilidad/estado-resultados?fechaDesde=${desde}&fechaHasta=${hasta}`).then(r => r.data).catch(() => null)
    },
  })

  const cuentasList = Array.isArray(cuentas) ? cuentas : []
  const transaccionesList = Array.isArray(transacciones) ? transacciones : []

  const totalCajas = cuentasList.reduce((s, c) => s + (Number(c?.saldo) || 0), 0)

  const ingresosMes = Number(resultados?.ingresos?.total ?? (typeof resultados?.ingresos === 'number' ? resultados.ingresos : 0)) || 0
  const gastosMes = Number(resultados?.gastos?.total ?? (typeof resultados?.gastos === 'number' ? resultados.gastos : 0)) || 0
  const costosMes = Number(resultados?.costos?.total ?? (typeof resultados?.costos === 'number' ? resultados.costos : 0)) || 0
  const utilidad = Number(resultados?.utilidad ?? (ingresosMes - (gastosMes + costosMes))) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Resumen de tu negocio al día de hoy
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total en Cajas"
          value={formatCurrency(totalCajas)}
          icon={<Landmark size={18} style={{ color: 'var(--brand-primary)' }} />}
          borderColor="var(--brand-primary)"
          isLoading={loadingCuentas}
        />
        <KpiCard
          title="Ingresos del mes"
          value={formatCurrency(ingresosMes)}
          icon={<TrendingUp size={18} style={{ color: '#2E7D32' }} />}
          borderColor="#2E7D32"
        />
        <KpiCard
          title="Gastos del mes"
          value={formatCurrency(gastosMes)}
          icon={<TrendingDown size={18} style={{ color: '#C62828' }} />}
          borderColor="#C62828"
        />
        <KpiCard
          title="Utilidad neta"
          value={formatCurrency(utilidad)}
          icon={<DollarSign size={18} style={{ color: utilidad >= 0 ? '#1565C0' : '#C62828' }} />}
          borderColor={utilidad >= 0 ? '#1565C0' : '#C62828'}
        />
      </div>

      {/* Gráfico + Saldo por caja */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Gráfico */}
        <div className="xl:col-span-2 rounded-xl bg-white p-5" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Ingresos vs Gastos — últimos 6 meses
          </h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#145e32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#145e32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C62828" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ingresos" stroke="#145e32" strokeWidth={2} fill="url(#ingGrad)" />
                <Area type="monotone" dataKey="gastos" stroke="#C62828" strokeWidth={2} fill="url(#gasGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Saldo por caja */}
        <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Cajas y Bancos
            </h2>
            <Link to="/app/cajas" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand-primary)' }}>
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {loadingCuentas ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: '#e2e8f0' }} />)}
            </div>
          ) : cuentasList.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin cajas registradas</p>
          ) : (
            <div className="space-y-2">
              {cuentasList.map(cuenta => (
                <div key={cuenta?.id || Math.random()} className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  style={{ background: 'var(--surface-light)', border: '1px solid var(--border-warm)' }}>
                  <div className="rounded-md p-1.5" style={{ background: 'rgba(20, 94, 50, 0.1)' }}>
                    {cuenta?.tipo === 'BANCO' ? <Landmark size={14} style={{ color: 'var(--brand-primary)' }} /> : <Wallet size={14} style={{ color: 'var(--brand-primary)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{cuenta?.nombre || 'Cuenta'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cuenta?.moneda || 'BOB'}</p>
                  </div>
                  <AmountCell amount={cuenta?.saldo ?? 0} currency={cuenta?.moneda || 'BOB'} forceColor="positive" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimas transacciones */}
      <div className="rounded-xl bg-white" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-warm)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Últimas transacciones
          </h2>
          <Link to="/app/cajas" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand-primary)' }}>
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loadingTxs ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: '#e2e8f0' }} />)}
            </div>
          ) : transaccionesList.length === 0 ? (
            <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>Sin transacciones</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-light)' }}>
                  {['Fecha', 'Descripción', 'Tipo', 'Monto'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transaccionesList.slice(0, 10).map((tx, i) => (
                  <tr key={tx?.id || i} style={{ borderTop: i > 0 ? '1px solid var(--border-warm)' : 'none' }}>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(getTransaccionFecha(tx))}</td>
                    <td className="px-5 py-3 text-xs font-medium max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>{tx?.descripcion || 'Sin descripción'}</td>
                    <td className="px-5 py-3"><StatusChip status={tx?.tipo || 'INGRESO'} /></td>
                    <td className="px-5 py-3"><AmountCell amount={tx?.monto ?? 0} currency={tx?.moneda || 'BOB'} forceColor={tx?.tipo === 'INGRESO' ? 'positive' : 'negative'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
