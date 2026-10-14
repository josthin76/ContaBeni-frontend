import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Plus, Trash2, BookOpen, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { StatusChip } from '@/components/StatusChip'
import { AmountCell } from '@/components/AmountCell'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SlideOver } from '@/components/SlideOver'
import type { CuentaContable, Asiento } from '@/types'

type SubTab = 'plan' | 'diario' | 'mayor' | 'balance-comprobacion' | 'estado-resultados' | 'balance-general'

const subTabs: { key: SubTab; label: string }[] = [
  { key: 'plan', label: 'Plan de Cuentas' },
  { key: 'diario', label: 'Libro Diario' },
  { key: 'mayor', label: 'Libro Mayor' },
  { key: 'balance-comprobacion', label: 'Bal. Comprobación' },
  { key: 'estado-resultados', label: 'Estado Resultados' },
  { key: 'balance-general', label: 'Balance General' },
]

export default function ContabilidadPage() {
  const [tab, setTab] = useState<SubTab>('plan')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
          Contabilidad
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Plan de cuentas, asientos de partida doble y reportes financieros
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {subTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: tab === key ? 'var(--brand-primary)' : 'white',
              color: tab === key ? 'white' : 'var(--text-muted)',
              border: tab === key ? 'none' : '1px solid var(--border-warm)',
              boxShadow: tab === key ? '0 1px 4px rgba(20,94,50,0.3)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'plan' && <PlanCuentas />}
      {tab === 'diario' && <LibroDiario />}
      {tab === 'mayor' && <LibroMayor />}
      {tab === 'balance-comprobacion' && <ReporteBalance endpoint="/contabilidad/balance-comprobacion" titulo="Balance de Comprobación" tipo="comprobacion" />}
      {tab === 'estado-resultados' && <ReporteBalance endpoint="/contabilidad/estado-resultados" titulo="Estado de Resultados" tipo="resultados" />}
      {tab === 'balance-general' && <ReporteBalance endpoint="/contabilidad/balance-general" titulo="Balance General" tipo="general" />}
    </div>
  )
}

// ─── Plan de Cuentas ───────────────────────────────────────────────────────
function PlanCuentas() {
  const [openNueva, setOpenNueva] = useState(false)
  const qc = useQueryClient()

  const { data: cuentas = [], isLoading } = useQuery<CuentaContable[]>({
    queryKey: ['contabilidad', 'plan-cuentas'],
    queryFn: () => api.get('/contabilidad/plan-cuentas').then(r => Array.isArray(r.data) ? r.data : (r.data?.data ?? [])),
  })

  const raices = cuentas.filter(c => !(c.cuentaPadreId || c.padreId))

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-warm)' }}>
        <span className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Plan de Cuentas Contable</span>
        <button
          onClick={() => setOpenNueva(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={13} /> Nueva cuenta
        </button>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 rounded animate-pulse" style={{ background: '#e2e8f0' }} />
          ))}
        </div>
      ) : cuentas.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No hay cuentas en el plan</p>
        </div>
      ) : (
        <div className="p-3">
          {raices.map(c => (
            <CuentaRow key={c.id} cuenta={c} todas={cuentas} nivel={0} />
          ))}
        </div>
      )}

      <NuevaCuentaContableSlideOver
        open={openNueva}
        cuentas={cuentas}
        onClose={() => {
          setOpenNueva(false)
          qc.invalidateQueries({ queryKey: ['contabilidad', 'plan-cuentas'] })
        }}
      />
    </div>
  )
}

function CuentaRow({ cuenta, todas, nivel }: { key?: React.Key; cuenta: CuentaContable; todas: CuentaContable[]; nivel: number }) {
  const [open, setOpen] = useState(nivel < 1)
  const hijos = todas.filter(c => (c.cuentaPadreId || c.padreId) === cuenta.id)

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer group transition-colors hover:bg-emerald-50/50"
        style={{ paddingLeft: `${nivel * 20 + 12}px` }}
        onClick={() => hijos.length > 0 && setOpen(!open)}
      >
        {hijos.length > 0 ? (
          open ? (
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          )
        ) : (
          <span style={{ width: 14 }} />
        )}
        <span className="text-xs font-mono w-20 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
          {cuenta.codigo}
        </span>
        <span
          className={`text-sm flex-1 ${!cuenta.esTransaccional ? 'font-bold' : ''}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {cuenta.nombre}
        </span>
        {cuenta.esTransaccional ? (
          <span
            className="text-[11px] font-bold px-1.5 py-0.5 rounded"
            title="Cuenta transaccional (acepta movimientos directos)"
            style={{ background: 'rgba(20,94,50,0.12)', color: 'var(--brand-primary)' }}
          >
            T
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-medium">Mayor</span>
        )}
      </div>
      {nivel > 0 && (
        <div style={{ marginLeft: `${nivel * 20 + 12}px`, borderLeft: '1px dashed var(--border-input)', height: 0 }} />
      )}
      {open && hijos.map(h => <CuentaRow key={h.id} cuenta={h} todas={todas} nivel={nivel + 1} />)}
    </div>
  )
}

function NuevaCuentaContableSlideOver({
  open,
  cuentas,
  onClose,
}: {
  open: boolean
  cuentas: CuentaContable[]
  onClose: () => void
}) {
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    cuentaPadreId: '',
    esTransaccional: true,
  })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.codigo.trim() || !form.nombre.trim()) {
      toast.error('Ingresa el código y el nombre de la cuenta')
      return
    }

    setLoading(true)
    try {
      await api.post('/contabilidad/plan-cuentas', {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        cuentaPadreId: form.cuentaPadreId || undefined,
        esTransaccional: form.esTransaccional,
      })
      toast.success('Cuenta contable creada')
      setForm({ codigo: '', nombre: '', cuentaPadreId: '', esTransaccional: true })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al crear cuenta'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nueva cuenta contable">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Código *</label>
          <input
            placeholder="Ej. 1.1.1.03 o 5.2.01"
            value={form.codigo}
            onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nombre *</label>
          <input
            placeholder="Ej. Caja Moneda Extranjera"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Cuenta Padre (opcional)</label>
          <select
            value={form.cuentaPadreId}
            onChange={e => setForm(f => ({ ...f, cuentaPadreId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Sin padre (cuenta raíz)</option>
            {cuentas
              .filter(c => !c.esTransaccional)
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.nombre}
                </option>
              ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="esTransaccional"
            checked={form.esTransaccional}
            onChange={e => setForm(f => ({ ...f, esTransaccional: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="esTransaccional" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Cuenta transaccional (recibe asientos directos)
          </label>
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-4 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Guardando...' : 'Crear cuenta'}
        </button>
      </div>
    </SlideOver>
  )
}

// ─── Libro Diario ──────────────────────────────────────────────────────────
function LibroDiario() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [anularId, setAnularId] = useState<string | null>(null)
  const [openNuevoAsiento, setOpenNuevoAsiento] = useState(false)
  const qc = useQueryClient()

  const { data: asientos = [], isLoading } = useQuery<Asiento[]>({
    queryKey: ['contabilidad', 'asientos'],
    queryFn: () =>
      api.get('/contabilidad/asientos').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: planCuentas = [] } = useQuery<CuentaContable[]>({
    queryKey: ['contabilidad', 'plan-cuentas'],
    queryFn: () => api.get('/contabilidad/plan-cuentas').then(r => Array.isArray(r.data) ? r.data : (r.data?.data ?? [])),
  })

  const anular = useMutation({
    mutationFn: (id: string) => api.post(`/contabilidad/asientos/${id}/anular`).then(r => r.data),
    onSuccess: () => {
      toast.success('Asiento anulado')
      qc.invalidateQueries({ queryKey: ['contabilidad', 'asientos'] })
      setAnularId(null)
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al anular'))
    },
  })

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-warm)' }}>
        <div>
          <span className="text-sm font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Libro Diario</span>
          <p className="text-xs text-gray-500">Historial de asientos contables de partida doble</p>
        </div>
        <button
          onClick={() => setOpenNuevoAsiento(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={13} /> Asiento manual
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
            {['#', 'Fecha', 'Concepto / Glosa', 'Debe', 'Haber', 'Estado', ''].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Cargando asientos...
              </td>
            </tr>
          ) : asientos.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                No hay asientos registrados aún
              </td>
            </tr>
          ) : (
            asientos.map(a => {
              const lineas = a.detalles ?? a.lineas ?? []
              const totalDebe = a.debe ?? lineas.reduce((s, l) => s + (Number(l.debe) || 0), 0)
              const totalHaber = a.haber ?? lineas.reduce((s, l) => s + (Number(l.haber) || 0), 0)

              return (
                <React.Fragment key={a.id}>
                  <tr
                    style={{
                      borderTop: '1px solid var(--border-warm)',
                      background: a.estado === 'ANULADO' ? 'rgba(198,40,40,0.04)' : 'white',
                      cursor: 'pointer',
                      textDecoration: a.estado === 'ANULADO' ? 'line-through' : 'none',
                    }}
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  >
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {a.correlativo ?? (a.numero ? `#${a.numero}` : '—')}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(a.fecha)}
                    </td>
                    <td className="px-5 py-3 text-xs font-medium max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                      {a.concepto ?? a.glosa ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <AmountCell amount={totalDebe} forceColor="positive" />
                    </td>
                    <td className="px-5 py-3">
                      <AmountCell amount={totalHaber} forceColor="negative" />
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={a.estado} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {a.estado === 'CONFIRMADO' && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setAnularId(a.id)
                          }}
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                          title="Anular asiento"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>

                  {expanded === a.id &&
                    lineas.map((l, idx) => (
                      <tr key={l.id ?? idx} style={{ background: 'rgba(240,253,244,0.7)', borderTop: '1px dashed #e2e8f0' }}>
                        <td />
                        <td className="px-5 py-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {l.cuenta?.codigo ?? l.cuentaCodigo ?? '—'}
                        </td>
                        <td className="px-5 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                          {l.cuenta?.nombre ?? l.cuentaNombre ?? '—'}
                        </td>
                        <td className="px-5 py-2">
                          <AmountCell amount={l.debe} forceColor="positive" />
                        </td>
                        <td className="px-5 py-2">
                          <AmountCell amount={l.haber} forceColor="negative" />
                        </td>
                        <td colSpan={2} />
                      </tr>
                    ))}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>

      <NuevoAsientoSlideOver
        open={openNuevoAsiento}
        planCuentas={planCuentas.filter(c => c.esTransaccional)}
        onClose={() => {
          setOpenNuevoAsiento(false)
          qc.invalidateQueries({ queryKey: ['contabilidad', 'asientos'] })
        }}
      />

      <ConfirmDialog
        open={!!anularId}
        onClose={() => setAnularId(null)}
        onConfirm={() => anularId && anular.mutate(anularId)}
        title="Anular asiento"
        description="El asiento quedará anulado. No se puede revertir esta acción. Los saldos y reportes dejarán de considerar este asiento."
        confirmLabel="Anular asiento"
        isLoading={anular.isPending}
      />
    </div>
  )
}

function NuevoAsientoSlideOver({
  open,
  planCuentas,
  onClose,
}: {
  open: boolean
  planCuentas: CuentaContable[]
  onClose: () => void
}) {
  const [glosa, setGlosa] = useState('')
  const [referencia, setReferencia] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [detalles, setDetalles] = useState<Array<{ cuentaId: string; debe: string; haber: string }>>([
    { cuentaId: '', debe: '', haber: '' },
    { cuentaId: '', debe: '', haber: '' },
  ])
  const [loading, setLoading] = useState(false)

  const totalDebe = detalles.reduce((s, d) => s + (Number(d.debe) || 0), 0)
  const totalHaber = detalles.reduce((s, d) => s + (Number(d.haber) || 0), 0)
  const estaCuadrado = Math.abs(totalDebe - totalHaber) < 0.001 && totalDebe > 0

  const addLinea = () => {
    setDetalles(d => [...d, { cuentaId: '', debe: '', haber: '' }])
  }

  const removeLinea = (idx: number) => {
    if (detalles.length <= 2) return
    setDetalles(d => d.filter((_, i) => i !== idx))
  }

  const submit = async () => {
    if (!glosa.trim()) {
      toast.error('Ingresa la glosa o concepto del asiento')
      return
    }
    if (!estaCuadrado) {
      toast.error('El asiento no cumple la partida doble: el Debe debe ser igual al Haber y mayor a cero')
      return
    }
    const hasEmptyAccount = detalles.some(d => !d.cuentaId && ((Number(d.debe) || 0) > 0 || (Number(d.haber) || 0) > 0))
    if (hasEmptyAccount) {
      toast.error('Selecciona una cuenta contable en cada línea con monto')
      return
    }

    setLoading(true)
    try {
      const lineasFiltradas = detalles
        .filter(d => (Number(d.debe) || 0) > 0 || (Number(d.haber) || 0) > 0)
        .map(d => ({
          cuentaId: d.cuentaId,
          debe: Number(d.debe) || 0,
          haber: Number(d.haber) || 0,
        }))

      await api.post('/contabilidad/asientos/manual', {
        fecha,
        glosa: glosa.trim(),
        referencia: referencia.trim() || undefined,
        detalles: lineasFiltradas,
      })
      toast.success('Asiento contable registrado')
      setGlosa('')
      setReferencia('')
      setDetalles([
        { cuentaId: '', debe: '', haber: '' },
        { cuentaId: '', debe: '', haber: '' },
      ])
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al registrar asiento'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nuevo Asiento Manual" width="600px">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Glosa / Concepto *</label>
          <input
            placeholder="Ej. Ajuste de depreciación mensual"
            value={glosa}
            onChange={e => setGlosa(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Referencia (opcional)</label>
            <input
              placeholder="Ej. COMP-009"
              value={referencia}
              onChange={e => setReferencia(e.target.value)}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
        </div>

        {/* Líneas de asiento */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Partidas Contables (Debe / Haber)</label>
            <button onClick={addLinea} className="text-xs font-semibold flex items-center gap-1 text-emerald-800 hover:text-emerald-900">
              <Plus size={13} /> Agregar línea
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {detalles.map((d, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={d.cuentaId}
                  onChange={e => {
                    const ds = [...detalles]
                    ds[i].cuentaId = e.target.value
                    setDetalles(ds)
                  }}
                  className="flex-1 rounded-lg px-2.5 py-2 text-xs outline-none bg-white"
                  style={{ border: '1px solid var(--border-input)' }}
                >
                  <option value="">Seleccionar cuenta...</option>
                  {planCuentas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} — {c.nombre}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Debe"
                  value={d.debe}
                  onChange={e => {
                    const ds = [...detalles]
                    ds[i].debe = e.target.value
                    if (e.target.value) ds[i].haber = ''
                    setDetalles(ds)
                  }}
                  className="w-24 rounded-lg px-2.5 py-2 text-xs outline-none"
                  style={{ border: '1px solid var(--border-input)' }}
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Haber"
                  value={d.haber}
                  onChange={e => {
                    const ds = [...detalles]
                    ds[i].haber = e.target.value
                    if (e.target.value) ds[i].debe = ''
                    setDetalles(ds)
                  }}
                  className="w-24 rounded-lg px-2.5 py-2 text-xs outline-none"
                  style={{ border: '1px solid var(--border-input)' }}
                />

                {detalles.length > 2 && (
                  <button onClick={() => removeLinea(i)} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Sumatoria */}
          <div className="mt-3 p-3 rounded-lg flex justify-between items-center bg-gray-50 border border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Total Debe: <span className="font-bold text-gray-800">{formatCurrency(totalDebe)}</span></p>
              <p className="text-xs text-gray-500">Total Haber: <span className="font-bold text-gray-800">{formatCurrency(totalHaber)}</span></p>
            </div>
            <div>
              {estaCuadrado ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  <Check size={12} /> Partida Cuadrada
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">
                  Diferencia: {formatCurrency(Math.abs(totalDebe - totalHaber))}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !estaCuadrado}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-4 transition-opacity disabled:opacity-50"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Guardando...' : 'Crear Asiento'}
        </button>
      </div>
    </SlideOver>
  )
}

// ─── Libro Mayor ──────────────────────────────────────────────────────────
function LibroMayor() {
  const [cuentaId, setCuentaId] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const { data: planCuentas = [] } = useQuery<CuentaContable[]>({
    queryKey: ['contabilidad', 'plan-cuentas'],
    queryFn: () => api.get('/contabilidad/plan-cuentas').then(r => Array.isArray(r.data) ? r.data : (r.data?.data ?? [])),
  })

  const { data: mayor, isLoading, refetch } = useQuery({
    queryKey: ['contabilidad', 'libro-mayor', cuentaId, desde, hasta],
    queryFn: () =>
      api
        .get(
          `/contabilidad/libro-mayor?cuentaId=${cuentaId}${desde ? `&fechaDesde=${desde}` : ''}${hasta ? `&fechaHasta=${hasta}` : ''}`
        )
        .then(r => r.data),
    enabled: !!cuentaId,
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 flex gap-3 flex-wrap items-end" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Cuenta Contable *</label>
          <select
            value={cuentaId}
            onChange={e => setCuentaId(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar cuenta para ver su mayor...</option>
            {planCuentas
              .filter(c => c.esTransaccional)
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.nombre}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <button
          onClick={() => refetch()}
          disabled={!cuentaId || isLoading}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {mayor && (
        <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
          <div className="px-5 py-3 flex gap-6" style={{ borderBottom: '1px solid var(--border-warm)', background: 'var(--surface-light)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saldo inicial</p>
              <AmountCell amount={mayor.saldoInicial ?? 0} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saldo final corrido</p>
              <AmountCell amount={mayor.saldoFinal ?? 0} />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
                {['Fecha', 'Concepto / Glosa', 'Debe', 'Haber', 'Saldo'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mayor.movimientos?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Sin movimientos en el período seleccionado
                  </td>
                </tr>
              ) : (
                mayor.movimientos?.map((m: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border-warm)' }}>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(m.fecha)}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-primary)' }}>
                      {m.concepto ?? m.glosa ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <AmountCell amount={m.debe} forceColor="positive" />
                    </td>
                    <td className="px-5 py-3">
                      <AmountCell amount={m.haber} forceColor="negative" />
                    </td>
                    <td className="px-5 py-3">
                      <AmountCell amount={m.saldo} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Reportes ──────────────────────────────────────────────────────────────
function toNumber(value: unknown): number {
  if (value == null || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const n = Number(value.replace(/,/g, ''))
    return Number.isFinite(n) ? n : 0
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    return toNumber(o.total ?? o.saldo ?? o.monto ?? o.importe ?? o.amount)
  }
  return 0
}

function unwrapReport(raw: unknown): any {
  if (!raw || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  if (o.data && typeof o.data === 'object' && !o.cuentas && !o.activo && !o.activos && !o.ingresos && !Array.isArray(raw)) {
    return o.data
  }
  return raw
}

const META_KEYS = new Set([
  'id', 'empresaId', 'periodo', 'rango', 'fechaDesde', 'fechaHasta', 'desde', 'hasta',
  'moneda', 'ok', 'success', 'message', 'statusCode', 'totales', 'total',
])

function asLineas(source: unknown): any[] {
  if (!source) return []
  if (Array.isArray(source)) return source
  if (typeof source !== 'object') return []
  const o = source as Record<string, unknown>
  for (const k of ['cuentas', 'lineas', 'items', 'detalle', 'movimientos', 'filas', 'rows', 'accounts', 'grupos']) {
    if (Array.isArray(o[k])) return o[k] as any[]
  }
  const entries = Object.entries(o).filter(([k, v]) => !META_KEYS.has(k) && v && typeof v === 'object')
  if (entries.length) {
    return entries.map(([k, v]) => {
      const row = v as Record<string, unknown>
      if (Array.isArray(v)) return { codigo: k, nombre: labelFromKey(k), cuentas: v }
      return {
        ...row,
        codigo: row.codigo ?? k,
        nombre: row.nombre ?? row.name ?? labelFromKey(k),
      }
    })
  }
  return []
}

function labelFromKey(key: string): string {
  const map: Record<string, string> = {
    activo: 'Activo',
    activos: 'Activos',
    pasivo: 'Pasivo',
    pasivos: 'Pasivos',
    patrimonio: 'Patrimonio',
    patrimonioNeto: 'Patrimonio neto',
    capital: 'Capital',
    ingresos: 'Ingresos',
    gastos: 'Gastos',
    costos: 'Costos',
    utilidad: 'Utilidad',
    perdida: 'Pérdida',
    debe: 'Debe',
    haber: 'Haber',
    saldo: 'Saldo',
    totalDebe: 'Total debe',
    totalHaber: 'Total haber',
  }
  if (map[key]) return map[key]
  if (/^\d+(\.\d+)*$/.test(key)) return key
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, c => c.toUpperCase())
}

function lineaNombre(row: any): string {
  const n = row?.nombre ?? row?.cuentaNombre ?? row?.cuenta?.nombre ?? row?.descripcion ?? row?.glosa ?? row?.name
  if (typeof n === 'string' && n.trim()) return n.trim()
  const codigo = lineaCodigo(row)
  return codigo || '—'
}

function lineaCodigo(row: any): string {
  const c = row?.codigo ?? row?.cuentaCodigo ?? row?.cuenta?.codigo ?? ''
  return c == null ? '' : String(c)
}

function lineaDebe(row: any): number {
  return toNumber(row?.debe ?? row?.totalDebe ?? row?.debitos ?? row?.movimientoDebe)
}

function lineaHaber(row: any): number {
  return toNumber(row?.haber ?? row?.totalHaber ?? row?.creditos ?? row?.movimientoHaber)
}

function lineaSaldo(row: any): number {
  return toNumber(row?.saldo ?? row?.saldoActual ?? row?.saldoFinal ?? row?.monto ?? row?.importe ?? row?.total)
}

function lineaSaldoDeudor(row: any): number {
  const explicit = row?.saldoDeudor ?? row?.deudor
  if (explicit != null && explicit !== '') return toNumber(explicit)
  const saldo = lineaSaldo(row)
  const naturaleza = String(row?.naturaleza ?? row?.tipo ?? '').toUpperCase()
  if (naturaleza.includes('DEUD')) return Math.abs(saldo)
  if (naturaleza.includes('ACRE')) return 0
  return saldo > 0 ? saldo : 0
}

function lineaSaldoAcreedor(row: any): number {
  const explicit = row?.saldoAcreedor ?? row?.acreedor
  if (explicit != null && explicit !== '') return toNumber(explicit)
  const saldo = lineaSaldo(row)
  const naturaleza = String(row?.naturaleza ?? row?.tipo ?? '').toUpperCase()
  if (naturaleza.includes('ACRE')) return Math.abs(saldo)
  if (naturaleza.includes('DEUD')) return 0
  return saldo < 0 ? Math.abs(saldo) : 0
}

function Money({ amount, emptyZero = false }: { amount: number; emptyZero?: boolean }) {
  if (emptyZero && !amount) {
    return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
  }
  return <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(amount)}</span>
}

function CuentaCell({ row }: { row: any }) {
  const nombre = lineaNombre(row)
  const codigo = lineaCodigo(row)
  const codigoEsNombre = codigo && (nombre === codigo || /^\d+(\.\d+)*$/.test(nombre))
  return (
    <div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {codigoEsNombre ? (row.cuenta?.nombre ?? nombre) : nombre}
      </p>
      {codigo && !codigoEsNombre && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{codigo}</p>
      )}
    </div>
  )
}

function ReporteBalance({ endpoint, titulo, tipo }: { endpoint: string; titulo: string; tipo: 'comprobacion' | 'resultados' | 'general' }) {
  const [desde, setDesde] = useState(() => `${new Date().getFullYear()}-01-01`)
  const [hasta, setHasta] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [consultar, setConsultar] = useState(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [endpoint, desde, hasta],
    queryFn: () =>
      api.get(`${endpoint}?fechaDesde=${desde}&fechaHasta=${hasta}`).then(r => unwrapReport(r.data)),
    enabled: consultar,
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 flex gap-3 flex-wrap items-end" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
        <div>
          <p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Desde</p>
          <input
            type="date"
            value={desde}
            onChange={e => { setDesde(e.target.value); setConsultar(false) }}
            className="rounded-lg px-3 py-2 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Hasta</p>
          <input
            type="date"
            value={hasta}
            onChange={e => { setHasta(e.target.value); setConsultar(false) }}
            className="rounded-lg px-3 py-2 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <button
          onClick={() => setConsultar(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          Generar Reporte
        </button>
        {data && (
          <button
            onClick={() => window.print()}
            className="rounded-lg px-4 py-2 text-sm font-medium no-print transition-colors hover:bg-gray-100"
            style={{ border: '1px solid var(--border-warm)', color: 'var(--text-muted)' }}
          >
            Imprimir / Exportar
          </button>
        )}
      </div>

      {(isLoading || isFetching) && <div className="animate-pulse h-40 rounded-xl" style={{ background: '#e2e8f0' }} />}

      {data && !isFetching && (
        <div className="rounded-xl bg-white p-6 sm:p-8 report-content" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
          <div className="text-center mb-6 print-header">
            <p className="text-xs mb-1 font-semibold uppercase tracking-wider text-emerald-800">ContaBeni</p>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              {titulo}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Período: {desde || 'Inicio de actividades'} al {hasta}
            </p>
          </div>

          {tipo === 'resultados' && <EstadoResultadosView data={data} />}
          {tipo === 'comprobacion' && <BalanceComprobacionView data={data} />}
          {tipo === 'general' && <BalanceGeneralView data={data} />}
        </div>
      )}
    </div>
  )
}

function GrupoResultados({ titulo, bloque, color }: { titulo: string; bloque: any; color: string }) {
  const total = toNumber(bloque)
  const lineas = asLineas(bloque)
  return (
    <div>
      <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-warm)' }}>
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{titulo}</span>
        <span className="font-bold text-sm" style={{ color }}>{formatCurrency(total)}</span>
      </div>
      {lineas.length > 0 && (
        <div className="pl-3 mb-2">
          {lineas.map((row, i) => (
            <div key={i} className="flex justify-between items-start py-1.5 gap-4">
              <CuentaCell row={row} />
              <Money amount={lineaSaldo(row) || toNumber(row)} emptyZero />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EstadoResultadosView({ data }: { data: any }) {
  const ingresos = data.ingresos ?? data.ingreso
  const costos = data.costos ?? data.costo
  const gastos = data.gastos ?? data.gasto
  const utilidad = toNumber(data.utilidad ?? data.resultado ?? data.resultadoNeto)
  const perdida = toNumber(data.perdida)
  const neto = utilidad || (perdida ? -perdida : toNumber(ingresos) - toNumber(costos) - toNumber(gastos))

  if (ingresos == null && gastos == null) {
    return <BalanceComprobacionView data={data} />
  }

  return (
    <div className="space-y-1 max-w-2xl mx-auto">
      <GrupoResultados titulo="Ingresos" bloque={ingresos} color="#2E7D32" />
      {costos != null && <GrupoResultados titulo="Costos" bloque={costos} color="#C62828" />}
      <GrupoResultados titulo="Gastos" bloque={gastos} color="#C62828" />
      <div className="flex justify-between items-center py-3 mt-2" style={{ borderTop: '2px solid #1A1208' }}>
        <span className="font-bold text-sm">{neto >= 0 ? 'Utilidad neta' : 'Pérdida neta'}</span>
        <span className="font-bold text-base" style={{ color: neto >= 0 ? '#2E7D32' : '#C62828' }}>
          {formatCurrency(neto)}
        </span>
      </div>
    </div>
  )
}

function BalanceComprobacionView({ data }: { data: any }) {
  const lineas = asLineas(data.cuentas ?? data.lineas ?? data.detalle ?? data.items ?? data)
  const totales = data.totales ?? data.total ?? {}
  const totalDebe = toNumber(totales.debe ?? totales.totalDebe ?? data.totalDebe) || lineas.reduce((s, r) => s + lineaDebe(r), 0)
  const totalHaber = toNumber(totales.haber ?? totales.totalHaber ?? data.totalHaber) || lineas.reduce((s, r) => s + lineaHaber(r), 0)
  const totalDeudor = toNumber(totales.saldoDeudor ?? data.totalSaldoDeudor) || lineas.reduce((s, r) => s + lineaSaldoDeudor(r), 0)
  const totalAcreedor = toNumber(totales.saldoAcreedor ?? data.totalSaldoAcreedor) || lineas.reduce((s, r) => s + lineaSaldoAcreedor(r), 0)
  const tieneMovimientos = lineas.some(r => lineaDebe(r) || lineaHaber(r))
  const tieneSaldos = lineas.some(r => lineaSaldoDeudor(r) || lineaSaldoAcreedor(r) || lineaSaldo(r))

  if (lineas.length === 0) {
    return <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin movimientos para el período seleccionado</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
            <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Cuenta</th>
            {tieneMovimientos && (
              <>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Debe</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Haber</th>
              </>
            )}
            {tieneSaldos && (
              <>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Saldo deudor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Saldo acreedor</th>
              </>
            )}
            {!tieneMovimientos && !tieneSaldos && (
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Saldo</th>
            )}
          </tr>
        </thead>
        <tbody>
          {lineas.map((row, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border-warm)' }}>
              <td className="px-4 py-3"><CuentaCell row={row} /></td>
              {tieneMovimientos && (
                <>
                  <td className="px-4 py-3 text-right"><Money amount={lineaDebe(row)} emptyZero /></td>
                  <td className="px-4 py-3 text-right"><Money amount={lineaHaber(row)} emptyZero /></td>
                </>
              )}
              {tieneSaldos && (
                <>
                  <td className="px-4 py-3 text-right"><Money amount={lineaSaldoDeudor(row)} emptyZero /></td>
                  <td className="px-4 py-3 text-right"><Money amount={lineaSaldoAcreedor(row)} emptyZero /></td>
                </>
              )}
              {!tieneMovimientos && !tieneSaldos && (
                <td className="px-4 py-3 text-right"><Money amount={lineaSaldo(row)} /></td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #1A1208', background: 'var(--surface-light)' }}>
            <td className="px-4 py-3 text-sm font-bold">Totales</td>
            {tieneMovimientos && (
              <>
                <td className="px-4 py-3 text-right"><Money amount={totalDebe} /></td>
                <td className="px-4 py-3 text-right"><Money amount={totalHaber} /></td>
              </>
            )}
            {tieneSaldos && (
              <>
                <td className="px-4 py-3 text-right"><Money amount={totalDeudor} /></td>
                <td className="px-4 py-3 text-right"><Money amount={totalAcreedor} /></td>
              </>
            )}
            {!tieneMovimientos && !tieneSaldos && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function pickSeccion(data: any, keys: string[]): any {
  for (const k of keys) {
    if (data?.[k] != null) return data[k]
  }
  return null
}

function SeccionBalance({ titulo, bloque }: { titulo: string; bloque: any }) {
  const lineas = asLineas(bloque)
  const total = toNumber(bloque?.total ?? bloque?.saldo) || lineas.reduce((s, r) => s + (lineaSaldo(r) || lineaDebe(r) - lineaHaber(r)), 0)

  return (
    <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-warm)' }}>
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--brand-primary)' }}>
        {titulo}
      </h3>
      {lineas.length === 0 ? (
        <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>Sin cuentas</p>
      ) : (
        <div className="space-y-1">
          {lineas.map((row, i) => {
            const hijas = asLineas(row.cuentas ?? row.lineas ?? row.grupos)
            const monto = lineaSaldo(row) || toNumber(row.total) || hijas.reduce((s, h) => s + lineaSaldo(h), 0)
            return (
              <div key={i}>
                <div className="flex justify-between items-start gap-3 py-1.5">
                  <CuentaCell row={row} />
                  <Money amount={monto} emptyZero />
                </div>
                {hijas.length > 0 && (
                  <div className="pl-4 mb-1">
                    {hijas.map((h, j) => (
                      <div key={j} className="flex justify-between items-start gap-3 py-1">
                        <CuentaCell row={h} />
                        <Money amount={lineaSaldo(h) || toNumber(h.total)} emptyZero />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="flex justify-between items-center pt-3 mt-2" style={{ borderTop: '1px solid var(--border-warm)' }}>
        <span className="text-sm font-bold">Total {titulo.toLowerCase()}</span>
        <span className="text-sm font-bold tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

function BalanceGeneralView({ data }: { data: any }) {
  let activo = pickSeccion(data, ['activo', 'activos', 'assets'])
  let pasivo = pickSeccion(data, ['pasivo', 'pasivos', 'liabilities'])
  let patrimonio = pickSeccion(data, ['patrimonio', 'patrimonioNeto', 'capital', 'equity'])

  if (!activo && !pasivo && !patrimonio) {
    const lineas = asLineas(data.cuentas ?? data.lineas ?? data)
    if (lineas.length) {
      activo = lineas.filter(r => String(lineaCodigo(r)).startsWith('1') || String(r.tipo ?? r.clase ?? '').toUpperCase().includes('ACTIV'))
      pasivo = lineas.filter(r => String(lineaCodigo(r)).startsWith('2') || String(r.tipo ?? r.clase ?? '').toUpperCase().includes('PASIV'))
      patrimonio = lineas.filter(r => String(lineaCodigo(r)).startsWith('3') || String(r.tipo ?? r.clase ?? '').toUpperCase().includes('PATRIM'))
    }
  }

  if (!activo && !pasivo && !patrimonio) {
    return <BalanceComprobacionView data={data} />
  }

  const totalActivo = toNumber(activo?.total ?? data.totalActivo ?? data.totalActivos) || asLineas(activo).reduce((s, r) => s + (lineaSaldo(r) || toNumber(r.total)), 0)
  const totalPasivo = toNumber(pasivo?.total ?? data.totalPasivo ?? data.totalPasivos) || asLineas(pasivo).reduce((s, r) => s + (lineaSaldo(r) || toNumber(r.total)), 0)
  const totalPatrimonio = toNumber(patrimonio?.total ?? data.totalPatrimonio) || asLineas(patrimonio).reduce((s, r) => s + (lineaSaldo(r) || toNumber(r.total)), 0)
  const totalPasPat = totalPasivo + totalPatrimonio
  const cuadrado = Math.abs(totalActivo - totalPasPat) < 0.01

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SeccionBalance titulo="Activo" bloque={activo} />
        <div className="space-y-4">
          <SeccionBalance titulo="Pasivo" bloque={pasivo} />
          <SeccionBalance titulo="Patrimonio" bloque={patrimonio} />
        </div>
      </div>
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3"
        style={{ background: cuadrado ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)', border: `1px solid ${cuadrado ? '#2E7D32' : '#C62828'}` }}
      >
        <div className="text-sm">
          <span className="font-semibold">Activo: </span>{formatCurrency(totalActivo)}
          <span className="mx-2" style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="font-semibold">Pasivo + Patrimonio: </span>{formatCurrency(totalPasPat)}
        </div>
        <span className="text-xs font-bold" style={{ color: cuadrado ? '#2E7D32' : '#C62828' }}>
          {cuadrado ? 'Balance cuadrado' : `Diferencia ${formatCurrency(Math.abs(totalActivo - totalPasPat))}`}
        </span>
      </div>
    </div>
  )
}
