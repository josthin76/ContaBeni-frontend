import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { SlideOver } from '@/components/SlideOver'
import { StatusChip } from '@/components/StatusChip'
import { AmountCell } from '@/components/AmountCell'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Gasto, CategoriaGasto, CuentaFinanciera, CuentaContable } from '@/types'

export default function GastosPage() {
  const [openNuevo, setOpenNuevo] = useState(false)
  const [openNuevaCat, setOpenNuevaCat] = useState(false)
  const [anularId, setAnularId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: gastos = [], isLoading } = useQuery<Gasto[]>({
    queryKey: ['gastos'],
    queryFn: () =>
      api.get('/gastos').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: categorias = [] } = useQuery<CategoriaGasto[]>({
    queryKey: ['categorias-gasto'],
    queryFn: () =>
      api
        .get('/gastos/categorias')
        .then(r => {
          const raw = r.data
          if (Array.isArray(raw)) return raw
          if (Array.isArray(raw?.data)) return raw.data
          return []
        })
        .catch(() => []),
  })

  const { data: cuentas = [] } = useQuery<CuentaFinanciera[]>({
    queryKey: ['cajas', 'cuentas'],
    queryFn: () =>
      api.get('/cajas/cuentas').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: planCuentas = [] } = useQuery<CuentaContable[]>({
    queryKey: ['contabilidad', 'plan-cuentas'],
    queryFn: () =>
      api.get('/contabilidad/plan-cuentas').then(r => (Array.isArray(r.data) ? r.data : (r.data?.data ?? []))),
  })

  const anular = useMutation({
    mutationFn: (id: string) => api.delete(`/gastos/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Gasto anulado')
      qc.invalidateQueries({ queryKey: ['gastos'] })
      qc.invalidateQueries({ queryKey: ['cajas'] })
      setAnularId(null)
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'No se puede anular el gasto'))
    },
  })

  const gastoSeleccionado = gastos.find(g => g.id === anularId)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Gastos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Registro de gastos operativos con descuento de caja y asiento automático
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenNuevaCat(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:bg-orange-50"
            style={{ border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', background: 'white' }}
          >
            <Tag size={14} /> Nueva categoría
          </button>
          <button
            onClick={() => setOpenNuevo(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={16} /> Nuevo gasto
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
              {['Fecha', 'Categoría', 'Descripción', 'Monto', 'Estado', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Cargando gastos...
                </td>
              </tr>
            ) : gastos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Sin gastos registrados aún
                </td>
              </tr>
            ) : (
              gastos.map(g => (
                <tr key={g.id} style={{ borderTop: '1px solid var(--border-warm)' }}>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(g.fecha)}
                  </td>
                  <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {g.categoria?.nombre ?? g.categoriaNombre ?? 'Gasto General'}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {g.descripcion}
                  </td>
                  <td className="px-5 py-3">
                    <AmountCell amount={g.monto} currency={g.moneda} forceColor="negative" />
                  </td>
                  <td className="px-5 py-3">
                    <StatusChip status={g.estado} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {g.estado === 'ACTIVO' && (
                      <button
                        onClick={() => setAnularId(g.id)}
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                        title="Anular gasto"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SlideOver nuevo gasto */}
      <NuevoGastoSlideOver
        open={openNuevo}
        categorias={categorias}
        cuentas={cuentas}
        onAbrirNuevaCat={() => {
          setOpenNuevo(false)
          setOpenNuevaCat(true)
        }}
        onClose={() => {
          setOpenNuevo(false)
          qc.invalidateQueries({ queryKey: ['gastos'] })
          qc.invalidateQueries({ queryKey: ['cajas'] })
        }}
      />

      {/* SlideOver nueva categoría */}
      <NuevaCategoriaSlideOver
        open={openNuevaCat}
        planCuentas={planCuentas.filter(c => c.esTransaccional)}
        onClose={() => {
          setOpenNuevaCat(false)
          qc.invalidateQueries({ queryKey: ['categorias-gasto'] })
        }}
      />

      <ConfirmDialog
        open={!!anularId}
        onClose={() => setAnularId(null)}
        onConfirm={() => anularId && anular.mutate(anularId)}
        title="Anular gasto"
        description={`El monto de ${
          gastoSeleccionado ? formatCurrency(gastoSeleccionado.monto, gastoSeleccionado.moneda) : ''
        } volverá a la caja o banco correspondiente y se generará un contra-asiento contable.`}
        confirmLabel="Anular gasto"
        isLoading={anular.isPending}
      />
    </div>
  )
}

function NuevoGastoSlideOver({
  open,
  onClose,
  categorias,
  cuentas,
  onAbrirNuevaCat,
}: {
  open: boolean
  onClose: () => void
  categorias: CategoriaGasto[]
  cuentas: CuentaFinanciera[]
  onAbrirNuevaCat: () => void
}) {
  const [form, setForm] = useState({
    categoriaId: '',
    descripcion: '',
    monto: '',
    moneda: 'BOB',
    cuentaFinancieraId: '',
    numeroComprobante: '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.categoriaId) {
      toast.error('Selecciona una categoría de gasto')
      return
    }
    if (!form.cuentaFinancieraId) {
      toast.error('Selecciona la caja o banco que paga el gasto')
      return
    }
    if (!form.descripcion.trim()) {
      toast.error('Ingresa una descripción del gasto')
      return
    }
    if (!form.monto || Number(form.monto) <= 0) {
      toast.error('Ingresa un monto válido mayor a 0')
      return
    }

    setLoading(true)
    try {
      await api.post('/gastos', {
        categoriaId: form.categoriaId,
        cuentaFinancieraId: form.cuentaFinancieraId,
        descripcion: form.descripcion.trim(),
        monto: Number(form.monto),
        moneda: form.moneda,
        numeroComprobante: form.numeroComprobante.trim() || undefined,
      })
      toast.success('Gasto registrado exitosamente')
      setForm({ categoriaId: '', descripcion: '', monto: '', moneda: 'BOB', cuentaFinancieraId: '', numeroComprobante: '' })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al registrar gasto'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nuevo Gasto">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Categoría de gasto *</label>
            <button
              type="button"
              onClick={onAbrirNuevaCat}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              + Crear categoría
            </button>
          </div>
          <select
            value={form.categoriaId}
            onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar categoría...</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Caja / Banco de pago *
          </label>
          <select
            value={form.cuentaFinancieraId}
            onChange={e => setForm(f => ({ ...f, cuentaFinancieraId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar caja o banco...</option>
            {cuentas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} (Disponible: {formatCurrency(c.saldo, c.moneda)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Descripción *</label>
          <input
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            placeholder="Ej. Pago de factura eléctrica / Compra de útiles de limpieza"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Monto *</label>
            <input
              type="number"
              step="0.01"
              value={form.monto}
              onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
              placeholder="0.00"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Moneda</label>
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
            N° Comprobante / Recibo (opcional)
          </label>
          <input
            value={form.numeroComprobante}
            onChange={e => setForm(f => ({ ...f, numeroComprobante: e.target.value }))}
            placeholder="Ej. REC-4412"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Registrando...' : 'Registrar Gasto'}
        </button>
      </div>
    </SlideOver>
  )
}

function NuevaCategoriaSlideOver({
  open,
  planCuentas,
  onClose,
}: {
  open: boolean
  planCuentas: CuentaContable[]
  onClose: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [cuentaContableId, setCuentaContableId] = useState('')
  const [loading, setLoading] = useState(false)

  // Cuentas sugeridas de gasto (clase 5 o 6)
  const cuentasGastos = planCuentas.filter(c => c.codigo.startsWith('5') || c.codigo.startsWith('6'))
  const listaCuentas = cuentasGastos.length > 0 ? cuentasGastos : planCuentas

  const submit = async () => {
    if (!nombre.trim()) {
      toast.error('Ingresa el nombre de la categoría')
      return
    }
    if (!cuentaContableId) {
      toast.error('Selecciona la cuenta contable asociada')
      return
    }

    setLoading(true)
    try {
      await api.post('/gastos/categorias', {
        nombre: nombre.trim(),
        cuentaContableId,
      })
      toast.success('Categoría creada exitosamente')
      setNombre('')
      setCuentaContableId('')
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al crear categoría'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nueva Categoría de Gasto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Nombre de la categoría *
          </label>
          <input
            placeholder="Ej. Alquileres / Servicios Básicos / Publicidad"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Cuenta contable de gasto vinculada *
          </label>
          <select
            value={cuentaContableId}
            onChange={e => setCuentaContableId(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar cuenta contable (clase 5 / 6)...</option>
            {listaCuentas.map(c => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            El sistema generará el asiento cargando a esta cuenta cuando se registre el gasto.
          </p>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Guardando...' : 'Crear Categoría'}
        </button>
      </div>
    </SlideOver>
  )
}
