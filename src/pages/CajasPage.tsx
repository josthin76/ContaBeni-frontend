import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Landmark, Wallet, ArrowLeftRight } from 'lucide-react'
import { api } from '@/lib/api'
import { SlideOver } from '@/components/SlideOver'
import { StatusChip } from '@/components/StatusChip'
import { AmountCell } from '@/components/AmountCell'
import { formatDate, formatCurrency, getTransaccionFecha, getTransaccionCuentaNombre } from '@/lib/utils'
import { toast } from 'sonner'
import type { CuentaFinanciera, Transaccion, CuentaContable } from '@/types'

type Tab = 'cuentas' | 'transacciones'

export default function CajasPage() {
  const [tab, setTab] = useState<Tab>('cuentas')
  const [openMovimiento, setOpenMovimiento] = useState<{ tipo: 'INGRESO' | 'EGRESO'; cuentaId: string } | null>(null)
  const [openTransferencia, setOpenTransferencia] = useState<{ origenId?: string } | null>(null)
  const [openNuevaCuenta, setOpenNuevaCuenta] = useState(false)
  const qc = useQueryClient()

  const { data: cuentas = [], isLoading: loadingCuentas } = useQuery<CuentaFinanciera[]>({
    queryKey: ['cajas', 'cuentas'],
    queryFn: () => api.get('/cajas/cuentas').then(r => Array.isArray(r.data) ? r.data : (r.data.data ?? [])),
  })

  const { data: transacciones = [], isLoading: loadingTxs } = useQuery<Transaccion[]>({
    queryKey: ['cajas', 'transacciones'],
    queryFn: () => api.get('/cajas/transacciones').then(r => Array.isArray(r.data) ? r.data : (r.data.data ?? [])),
  })

  const { data: planCuentas = [] } = useQuery<CuentaContable[]>({
    queryKey: ['contabilidad', 'plan-cuentas'],
    queryFn: () => api.get('/contabilidad/plan-cuentas').then(r => Array.isArray(r.data) ? r.data : (r.data.data ?? [])),
  })

  const cuentasTransaccionales = planCuentas.filter(c => c.esTransaccional)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Cajas y Bancos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Gestión de efectivo y cuentas bancarias
          </p>
        </div>
        {tab === 'cuentas' && (
          <div className="flex gap-2">
            <button
              onClick={() => setOpenTransferencia({})}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all hover:bg-orange-50"
              style={{ border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', background: 'white' }}
            >
              <ArrowLeftRight size={15} /> Transferir
            </button>
            <button
              onClick={() => setOpenNuevaCuenta(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ background: 'var(--brand-primary)' }}
            >
              <Plus size={16} /> Nueva cuenta
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1 w-fit" style={{ background: 'var(--border-warm)' }}>
        {(['cuentas', 'transacciones'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? 'var(--brand-primary)' : 'var(--text-muted)',
              boxShadow: tab === t ? '0 1px 3px rgba(26,18,8,0.12)' : 'none',
            }}
          >
            {t === 'cuentas' ? 'Cuentas' : 'Transacciones'}
          </button>
        ))}
      </div>

      {/* Tab Cuentas */}
      {tab === 'cuentas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loadingCuentas ? (
            [1, 2, 3].map(i => <div key={i} className="animate-pulse h-36 rounded-xl" style={{ background: '#EDE0D4' }} />)
          ) : cuentas.length === 0 ? (
            <div className="col-span-full rounded-xl bg-white p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
              <Wallet size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--brand-primary)' }} />
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No hay cuentas financieras creadas</p>
              <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Crea tu primera caja chica o cuenta de banco para registrar ingresos y egresos.</p>
              <button
                onClick={() => setOpenNuevaCuenta(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                style={{ background: 'var(--brand-primary)' }}
              >
                <Plus size={14} /> Crear Caja o Banco
              </button>
            </div>
          ) : (
            cuentas.map(cuenta => (
              <div
                key={cuenta.id}
                className="rounded-xl bg-white p-5 flex flex-col justify-between"
                style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)', border: '1px solid var(--border-warm)' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg p-2.5" style={{ background: 'rgba(232,97,10,0.1)' }}>
                      {cuenta.tipo === 'BANCO' ? (
                        <Landmark size={20} style={{ color: 'var(--brand-primary)' }} />
                      ) : (
                        <Wallet size={20} style={{ color: 'var(--brand-primary)' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
                        {cuenta.nombre}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {cuenta.tipo === 'BANCO' ? 'Banco' : 'Efectivo'} · {cuenta.moneda}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                    {formatCurrency(cuenta.saldo, cuenta.moneda)}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid var(--border-warm)' }}>
                  <button
                    onClick={() => setOpenMovimiento({ tipo: 'INGRESO', cuentaId: cuenta.id })}
                    className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                    style={{ background: '#2E7D32' }}
                  >
                    + Ingreso
                  </button>
                  <button
                    onClick={() => setOpenMovimiento({ tipo: 'EGRESO', cuentaId: cuenta.id })}
                    className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                    style={{ background: '#C62828' }}
                  >
                    − Egreso
                  </button>
                  <button
                    onClick={() => setOpenTransferencia({ origenId: cuenta.id })}
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-blue-50 active:scale-95"
                    style={{ background: 'rgba(21,101,192,0.1)', color: '#1565C0' }}
                  >
                    <ArrowLeftRight size={12} className="inline mr-1" />
                    Transferir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Transacciones */}
      {tab === 'transacciones' && (
        <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
                {['Fecha', 'Descripción', 'Cuenta', 'Tipo', 'Monto'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingTxs ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              ) : transacciones.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Sin transacciones registradas</td></tr>
              ) : (
                transacciones.map(tx => (
                  <tr key={tx.id} style={{ borderTop: '1px solid var(--border-warm)' }}>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(getTransaccionFecha(tx))}</td>
                    <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tx.descripcion}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{getTransaccionCuentaNombre(tx, cuentas)}</td>
                    <td className="px-5 py-3"><StatusChip status={tx.tipo} /></td>
                    <td className="px-5 py-3">
                      <AmountCell amount={tx.monto} currency={tx.moneda} forceColor={tx.tipo === 'INGRESO' ? 'positive' : 'negative'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SlideOver Movimiento */}
      <MovimientoSlideOver
        open={!!openMovimiento}
        tipo={openMovimiento?.tipo ?? 'INGRESO'}
        cuentaId={openMovimiento?.cuentaId ?? ''}
        cuentasTransaccionales={cuentasTransaccionales}
        onClose={() => { setOpenMovimiento(null); qc.invalidateQueries({ queryKey: ['cajas'] }) }}
      />

      {/* SlideOver Transferencia */}
      <TransferenciaSlideOver
        open={!!openTransferencia}
        origenId={openTransferencia?.origenId}
        cuentas={cuentas}
        onClose={() => { setOpenTransferencia(null); qc.invalidateQueries({ queryKey: ['cajas'] }) }}
      />

      {/* SlideOver Nueva cuenta */}
      <NuevaCuentaSlideOver
        open={openNuevaCuenta}
        cuentasTransaccionales={cuentasTransaccionales}
        onClose={() => { setOpenNuevaCuenta(false); qc.invalidateQueries({ queryKey: ['cajas'] }) }}
      />
    </div>
  )
}

function MovimientoSlideOver({
  open,
  tipo,
  cuentaId,
  cuentasTransaccionales,
  onClose,
}: {
  open: boolean
  tipo: 'INGRESO' | 'EGRESO'
  cuentaId: string
  cuentasTransaccionales: CuentaContable[]
  onClose: () => void
}) {
  const [form, setForm] = useState({
    monto: '',
    descripcion: '',
    cuentaContableId: '',
    referencia: '',
    fecha: new Date().toISOString().slice(0, 10),
  })
  const [loading, setLoading] = useState(false)

  // Filtrar sugerencias de cuentas según tipo (ingresos clase 4, gastos clase 5/costos clase 6)
  const cuentasSugeridas = cuentasTransaccionales.filter(c =>
    tipo === 'INGRESO' ? c.codigo.startsWith('4') : (c.codigo.startsWith('5') || c.codigo.startsWith('6'))
  )
  const listaCuentas = cuentasSugeridas.length > 0 ? cuentasSugeridas : cuentasTransaccionales

  const submit = async () => {
    if (!form.monto || Number(form.monto) <= 0) {
      toast.error('Ingresa un monto válido mayor a 0')
      return
    }
    if (!form.cuentaContableId) {
      toast.error('Selecciona la cuenta contable de contrapartida')
      return
    }

    setLoading(true)
    try {
      const endpoint = tipo === 'INGRESO' ? '/cajas/ingresos' : '/cajas/egresos'
      await api.post(endpoint, {
        cuentaFinancieraId: cuentaId,
        monto: Number(form.monto),
        cuentaContableId: form.cuentaContableId,
        descripcion: form.descripcion.trim() || (tipo === 'INGRESO' ? 'Ingreso a caja' : 'Egreso de caja'),
        referencia: form.referencia.trim() || undefined,
        fecha: form.fecha,
      })
      toast.success(`${tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado exitosamente`)
      setForm({ monto: '', descripcion: '', cuentaContableId: '', referencia: '', fecha: new Date().toISOString().slice(0, 10) })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al registrar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title={`Registrar ${tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Fecha *</label>
          <input
            type="date"
            value={form.fecha}
            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Monto *</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.monto}
            onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Cuenta contable de contrapartida *
          </label>
          <select
            value={form.cuentaContableId}
            onChange={e => setForm(f => ({ ...f, cuentaContableId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar cuenta contable...</option>
            {listaCuentas.map(c => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {tipo === 'INGRESO' ? 'Cuenta de ingresos que origina el dinero' : 'Cuenta de gastos/costos que recibe el pago'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Descripción</label>
          <input
            type="text"
            placeholder="Ej. Venta en mostrador / Pago de suministros"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Referencia / Recibo (opcional)</label>
          <input
            type="text"
            placeholder="Ej. REC-0012"
            value={form.referencia}
            onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: tipo === 'INGRESO' ? '#2E7D32' : '#C62828' }}
        >
          {loading ? 'Guardando...' : `Registrar ${tipo === 'INGRESO' ? 'ingreso' : 'egreso'}`}
        </button>
      </div>
    </SlideOver>
  )
}

function TransferenciaSlideOver({
  open,
  origenId,
  cuentas,
  onClose,
}: {
  open: boolean
  origenId?: string
  cuentas: CuentaFinanciera[]
  onClose: () => void
}) {
  const [form, setForm] = useState({
    cuentaOrigenId: origenId || '',
    cuentaDestinoId: '',
    monto: '',
    descripcion: '',
    referencia: '',
    fecha: new Date().toISOString().slice(0, 10),
  })
  const [loading, setLoading] = useState(false)

  // Actualizar origen si cambia la prop
  if (origenId && form.cuentaOrigenId !== origenId && !form.cuentaOrigenId) {
    setForm(f => ({ ...f, cuentaOrigenId: origenId }))
  }

  const submit = async () => {
    if (!form.cuentaOrigenId || !form.cuentaDestinoId) {
      toast.error('Selecciona la cuenta de origen y destino')
      return
    }
    if (form.cuentaOrigenId === form.cuentaDestinoId) {
      toast.error('La cuenta de origen y destino no pueden ser iguales')
      return
    }
    if (!form.monto || Number(form.monto) <= 0) {
      toast.error('Ingresa un monto válido a transferir')
      return
    }

    setLoading(true)
    try {
      await api.post('/cajas/transferencias', {
        cuentaOrigenId: form.cuentaOrigenId,
        cuentaDestinoId: form.cuentaDestinoId,
        monto: Number(form.monto),
        descripcion: form.descripcion.trim() || 'Transferencia entre cuentas',
        referencia: form.referencia.trim() || undefined,
        fecha: form.fecha,
      })
      toast.success('Transferencia realizada exitosamente')
      setForm({ cuentaOrigenId: '', cuentaDestinoId: '', monto: '', descripcion: '', referencia: '', fecha: new Date().toISOString().slice(0, 10) })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al transferir'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Transferencia entre cuentas">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Cuenta de origen *</label>
          <select
            value={form.cuentaOrigenId}
            onChange={e => setForm(f => ({ ...f, cuentaOrigenId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar cuenta de origen...</option>
            {cuentas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({formatCurrency(c.saldo, c.moneda)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Cuenta de destino *</label>
          <select
            value={form.cuentaDestinoId}
            onChange={e => setForm(f => ({ ...f, cuentaDestinoId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar cuenta de destino...</option>
            {cuentas
              .filter(c => c.id !== form.cuentaOrigenId)
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({formatCurrency(c.saldo, c.moneda)})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Fecha *</label>
          <input
            type="date"
            value={form.fecha}
            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Monto a transferir *</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.monto}
            onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Descripción (opcional)</label>
          <input
            type="text"
            placeholder="Ej. Depósito a banco / Fondo de caja chica"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Referencia / Comprobante (opcional)</label>
          <input
            type="text"
            placeholder="Ej. TRF-9901"
            value={form.referencia}
            onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: '#1565C0' }}
        >
          {loading ? 'Transfiriendo...' : 'Realizar transferencia'}
        </button>
      </div>
    </SlideOver>
  )
}

function NuevaCuentaSlideOver({
  open,
  cuentasTransaccionales,
  onClose,
}: {
  open: boolean
  cuentasTransaccionales: CuentaContable[]
  onClose: () => void
}) {
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'EFECTIVO' as 'EFECTIVO' | 'BANCO',
    moneda: 'BOB',
    cuentaContableId: '',
  })
  const [loading, setLoading] = useState(false)

  // Cuentas sugeridas de activo disponible (código 1.1)
  const cuentasDisponibles = cuentasTransaccionales.filter(c => c.codigo.startsWith('1.1') || c.codigo.startsWith('1'))
  const lista = cuentasDisponibles.length > 0 ? cuentasDisponibles : cuentasTransaccionales

  const submit = async () => {
    if (!form.nombre.trim()) {
      toast.error('Ingresa el nombre de la caja o banco')
      return
    }
    if (!form.cuentaContableId) {
      toast.error('Selecciona una cuenta contable vinculada')
      return
    }

    setLoading(true)
    try {
      await api.post('/cajas/cuentas', {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        moneda: form.moneda,
        cuentaContableId: form.cuentaContableId,
      })
      toast.success('Cuenta creada exitosamente')
      setForm({ nombre: '', tipo: 'EFECTIVO', moneda: 'BOB', cuentaContableId: '' })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al crear cuenta'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nueva caja o banco">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nombre *</label>
          <input
            type="text"
            placeholder="Ej. Caja Principal / Banco Unión Cta Cte"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Tipo *</label>
            <select
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
              style={{ border: '1px solid var(--border-input)' }}
            >
              <option value="EFECTIVO">Efectivo (Caja)</option>
              <option value="BANCO">Cuenta Bancaria</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Moneda *</label>
            <select
              value={form.moneda}
              onChange={e => setForm(f => ({ ...f, moneda: e.target.value }))}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
              style={{ border: '1px solid var(--border-input)' }}
            >
              <option value="BOB">BOB (Bolivianos)</option>
              <option value="USD">USD (Dólares)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Cuenta contable vinculada *
          </label>
          <select
            value={form.cuentaContableId}
            onChange={e => setForm(f => ({ ...f, cuentaContableId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar cuenta contable...</option>
            {lista.map(c => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Debe ser una cuenta transaccional de activo disponible (ej. 1.1.1.01 Caja General)
          </p>
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Guardando...' : 'Crear cuenta'}
        </button>
      </div>
    </SlideOver>
  )
}
