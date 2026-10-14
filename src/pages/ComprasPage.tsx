import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Trash2, ShoppingCart } from 'lucide-react'
import { api } from '@/lib/api'
import { SlideOver } from '@/components/SlideOver'
import { AdjuntarImagen } from '@/components/AdjuntarImagen'
import { MiniaturaImagen } from '@/components/MiniaturaImagen'
import { StatusChip } from '@/components/StatusChip'
import { AmountCell } from '@/components/AmountCell'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Compra, Proveedor, Producto, CuentaFinanciera } from '@/types'

export default function ComprasPage() {
  const [openNueva, setOpenNueva] = useState(false)
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [anularId, setAnularId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: compras = [], isLoading } = useQuery<Compra[]>({
    queryKey: ['compras'],
    queryFn: () =>
      api.get('/compras').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: proveedores = [] } = useQuery<Proveedor[]>({
    queryKey: ['proveedores'],
    queryFn: () =>
      api.get('/proveedores').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () =>
      api.get('/productos').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
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

  const anular = useMutation({
    mutationFn: (id: string) => api.delete(`/compras/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Compra anulada')
      qc.invalidateQueries({ queryKey: ['compras'] })
      qc.invalidateQueries({ queryKey: ['cajas'] })
      qc.invalidateQueries({ queryKey: ['productos'] })
      setAnularId(null)
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'No se puede anular la compra'))
    },
  })

  const compraParaVer = compras.find(c => c.id === detalleId)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Compras
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Registro de compras a proveedores con actualización automática de stock y contabilidad
          </p>
        </div>
        <button
          onClick={() => setOpenNueva(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={16} /> Nueva compra
        </button>
      </div>

      <div className="rounded-xl bg-white overflow-x-auto" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
              {['Fecha', 'Proveedor', 'N° Factura', 'Tipo', 'Total', 'Estado', 'Foto', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Cargando compras...
                </td>
              </tr>
            ) : compras.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Sin compras registradas aún
                </td>
              </tr>
            ) : (
              compras.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border-warm)' }}>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(c.fecha)}
                  </td>
                  <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {c.proveedor?.nombre ?? c.proveedorNombre ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {c.numeroFactura ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-semibold"
                      style={{
                        background: c.tipoPago === 'CONTADO' ? 'rgba(46,125,50,0.1)' : 'rgba(21,101,192,0.1)',
                        color: c.tipoPago === 'CONTADO' ? '#2E7D32' : '#1565C0',
                      }}
                    >
                      {c.tipoPago}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <AmountCell amount={c.total} currency={c.moneda} forceColor="negative" />
                  </td>
                  <td className="px-5 py-3">
                    <StatusChip status={c.estado} />
                  </td>
                  <td className="px-5 py-3">
                    <MiniaturaImagen src={c.imagen} alt={`Factura ${c.numeroFactura ?? ''}`} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetalleId(c.id)}
                        className="text-xs rounded-md px-2.5 py-1 font-medium flex items-center gap-1 transition-colors hover:bg-emerald-100"
                        style={{ background: 'rgba(20,94,50,0.1)', color: 'var(--brand-primary)' }}
                        title="Ver detalle"
                      >
                        <Eye size={12} /> Ver
                      </button>
                      {c.estado === 'RECIBIDA' && (
                        <button
                          onClick={() => setAnularId(c.id)}
                          className="text-xs rounded-md px-2.5 py-1 font-medium flex items-center gap-1 transition-colors hover:bg-red-100"
                          style={{ background: 'rgba(198,40,40,0.1)', color: '#C62828' }}
                          title="Anular compra"
                        >
                          <Trash2 size={12} /> Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NuevaCompraSlideOver
        open={openNueva}
        proveedores={proveedores}
        productos={productos}
        cuentas={cuentas}
        onClose={() => {
          setOpenNueva(false)
          qc.invalidateQueries({ queryKey: ['compras'] })
          qc.invalidateQueries({ queryKey: ['productos'] })
          qc.invalidateQueries({ queryKey: ['cajas'] })
        }}
      />

      {compraParaVer && (
        <DetalleCompraSlideOver
          open={!!detalleId}
          compra={compraParaVer}
          onClose={() => setDetalleId(null)}
        />
      )}

      <ConfirmDialog
        open={!!anularId}
        onClose={() => setAnularId(null)}
        onConfirm={() => anularId && anular.mutate(anularId)}
        title="Anular compra"
        description="Se revertirá el stock de los productos comprados, se generará un contra-asiento contable y, si fue compra al contado, el monto volverá a la caja o banco."
        confirmLabel="Anular compra"
        isLoading={anular.isPending}
      />
    </div>
  )
}

function NuevaCompraSlideOver({
  open,
  onClose,
  proveedores,
  productos,
  cuentas,
}: {
  open: boolean
  onClose: () => void
  proveedores: Proveedor[]
  productos: Producto[]
  cuentas: CuentaFinanciera[]
}) {
  const [form, setForm] = useState({
    proveedorId: '',
    numeroFactura: '',
    numeroManual: false,
    tipoPago: 'CONTADO' as 'CONTADO' | 'CREDITO',
    cuentaFinancieraId: '',
    moneda: 'BOB',
    detalles: [{ productoId: '', descripcion: '', cantidad: 1, costoUnitario: '' }],
  })
  const [loading, setLoading] = useState(false)
  const [imagen, setImagen] = useState<string | null>(null)

  const total = form.detalles.reduce((s, d) => s + (Number(d.cantidad) || 0) * (Number(d.costoUnitario) || 0), 0)

  const addLinea = () =>
    setForm(f => ({
      ...f,
      detalles: [...f.detalles, { productoId: '', descripcion: '', cantidad: 1, costoUnitario: '' }],
    }))

  const removeLinea = (idx: number) => {
    if (form.detalles.length <= 1) return
    setForm(f => ({
      ...f,
      detalles: f.detalles.filter((_, i) => i !== idx),
    }))
  }

  const handleSelectProduct = (index: number, prodId: string) => {
    const prod = productos.find(p => p.id === prodId)
    const ds = [...form.detalles]
    ds[index].productoId = prodId
    if (prod) {
      if (!ds[index].descripcion) ds[index].descripcion = prod.nombre
      if (!ds[index].costoUnitario) {
        ds[index].costoUnitario = String(prod.costo ?? prod.precio ?? '')
      }
    }
    setForm(f => ({ ...f, detalles: ds }))
  }

  const submit = async () => {
    if (!form.proveedorId) {
      toast.error('Selecciona un proveedor')
      return
    }
    if (form.numeroManual && !form.numeroFactura.trim()) {
      toast.error('Ingresa el número de factura o desactiva "Escribir manualmente"')
      return
    }
    if (form.tipoPago === 'CONTADO' && !form.cuentaFinancieraId) {
      toast.error('Para pagos al contado debes seleccionar la caja o banco')
      return
    }

    const invalidDetail = form.detalles.some(
      d => !d.descripcion.trim() || Number(d.cantidad) <= 0 || Number(d.costoUnitario) < 0
    )
    if (invalidDetail) {
      toast.error('Revisa las líneas: cada ítem debe tener descripción, cantidad y costo unitario')
      return
    }

    setLoading(true)
    try {
      const payload = {
        proveedorId: form.proveedorId,
        // Vacío → el backend asigna el correlativo automático FC-000001
        numeroFactura: form.numeroManual ? form.numeroFactura.trim() : undefined,
        tipoPago: form.tipoPago,
        cuentaFinancieraId: form.tipoPago === 'CONTADO' ? form.cuentaFinancieraId : undefined,
        moneda: form.moneda,
        imagen: imagen ?? undefined,
        detalles: form.detalles.map(d => ({
          productoId: d.productoId || undefined,
          descripcion: d.descripcion.trim(),
          cantidad: Number(d.cantidad),
          costoUnitario: Number(d.costoUnitario),
        })),
      }

      await api.post('/compras', payload)
      toast.success('Compra registrada exitosamente')
      setForm({
        proveedorId: '',
        numeroFactura: '',
        numeroManual: false,
        tipoPago: 'CONTADO',
        cuentaFinancieraId: '',
        moneda: 'BOB',
        detalles: [{ productoId: '', descripcion: '', cantidad: 1, costoUnitario: '' }],
      })
      setImagen(null)
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al registrar compra'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nueva Compra" width="620px">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Proveedor *</label>
          <select
            value={form.proveedorId}
            onChange={e => setForm(f => ({ ...f, proveedorId: e.target.value }))}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
            style={{ border: '1px solid var(--border-input)' }}
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.rif ? `(${p.rif})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                N° Factura
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={form.numeroManual}
                  onChange={e => setForm(f => ({ ...f, numeroManual: e.target.checked }))}
                  className="accent-orange-600"
                />
                Escribir manualmente
              </label>
            </div>
            <input
              value={form.numeroManual ? form.numeroFactura : ''}
              onChange={e => setForm(f => ({ ...f, numeroFactura: e.target.value }))}
              placeholder={form.numeroManual ? 'Ej. FC-000007' : 'Automático (FC-000001)'}
              disabled={!form.numeroManual}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
              style={{ border: '1px solid var(--border-input)' }}
            />
            {!form.numeroManual && (
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Se asignará el siguiente correlativo del negocio al registrar la compra.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Tipo de pago *</label>
            <select
              value={form.tipoPago}
              onChange={e => setForm(f => ({ ...f, tipoPago: e.target.value as any }))}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
              style={{ border: '1px solid var(--border-input)' }}
            >
              <option value="CONTADO">Contado (paga de inmediato)</option>
              <option value="CREDITO">Crédito (cuenta por pagar)</option>
            </select>
          </div>
        </div>

        {form.tipoPago === 'CONTADO' && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Caja / Banco de donde sale el dinero *
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
        )}

        {/* Líneas de compra */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Detalle de productos o ítems</label>
            <button onClick={addLinea} className="text-xs font-semibold flex items-center gap-1 text-emerald-800 hover:text-emerald-900">
              <Plus size={13} /> Agregar ítem
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {form.detalles.map((d, i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Vincular Producto (opcional)</label>
                    <select
                      value={d.productoId}
                      onChange={e => handleSelectProduct(i, e.target.value)}
                      className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white border border-gray-300"
                    >
                      <option value="">Producto libre / no catalogado...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (SKU: {p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.detalles.length > 1 && (
                    <button
                      onClick={() => removeLinea(i)}
                      className="text-gray-400 hover:text-red-600 p-1 self-end mb-1"
                      title="Eliminar ítem"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <input
                      placeholder="Descripción del ítem *"
                      value={d.descripcion}
                      onChange={e => {
                        const ds = [...form.detalles]
                        ds[i].descripcion = e.target.value
                        setForm(f => ({ ...f, detalles: ds }))
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white border border-gray-300"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant. *"
                      value={d.cantidad}
                      onChange={e => {
                        const ds = [...form.detalles]
                        ds[i].cantidad = Number(e.target.value)
                        setForm(f => ({ ...f, detalles: ds }))
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white border border-gray-300"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Costo unit. *"
                      value={d.costoUnitario}
                      onChange={e => {
                        const ds = [...form.detalles]
                        ds[i].costoUnitario = e.target.value
                        setForm(f => ({ ...f, detalles: ds }))
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white border border-gray-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg p-3 flex justify-between items-center" style={{ background: 'var(--surface-light)', border: '1px solid var(--border-warm)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Total a pagar</span>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
            {formatCurrency(total, form.moneda)}
          </span>
        </div>

        <AdjuntarImagen valor={imagen} onChange={setImagen} etiqueta="Imagen de la factura" />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Registrando...' : 'Registrar Compra'}
        </button>
      </div>
    </SlideOver>
  )
}

function DetalleCompraSlideOver({
  open,
  compra,
  onClose,
}: {
  open: boolean
  compra: Compra
  onClose: () => void
}) {
  const { data: compraDetalle, isLoading } = useQuery({
    queryKey: ['compras', compra.id],
    queryFn: () => api.get(`/compras/${compra.id}`).then(r => r.data),
    enabled: open && !!compra.id,
  })

  const c = compraDetalle ?? compra
  const detalles = c.detalles ?? c.lineas ?? []

  return (
    <SlideOver open={open} onClose={onClose} title={`Detalle de Compra #${c.numeroFactura ?? ''}`} width="540px">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-xs">
          <div>
            <p className="text-gray-500">Proveedor:</p>
            <p className="font-semibold text-gray-800">{c.proveedor?.nombre ?? c.proveedorNombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Fecha:</p>
            <p className="font-semibold text-gray-800">{formatDate(c.fecha)}</p>
          </div>
          <div>
            <p className="text-gray-500">Tipo de Pago:</p>
            <p className="font-semibold text-gray-800">{c.tipoPago}</p>
          </div>
          <div>
            <p className="text-gray-500">Estado:</p>
            <StatusChip status={c.estado} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ítems comprados</h4>
          {isLoading ? (
            <p className="text-xs text-gray-400">Cargando ítems...</p>
          ) : detalles.length === 0 ? (
            <p className="text-xs text-gray-400">Sin líneas registradas</p>
          ) : (
            <div className="space-y-2">
              {detalles.map((d: any, idx: number) => (
                <div key={d.id ?? idx} className="flex justify-between items-center p-2.5 rounded border border-gray-100 text-xs">
                  <div>
                    <p className="font-semibold text-gray-800">{d.descripcion}</p>
                    <p className="text-gray-500">{d.cantidad} unid. × {formatCurrency(d.costoUnitario ?? d.precioUnitario, c.moneda)}</p>
                  </div>
                  <span className="font-bold">
                    {formatCurrency((Number(d.cantidad) || 0) * (Number(d.costoUnitario ?? d.precioUnitario) || 0), c.moneda)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t flex justify-between items-center text-sm">
          <span className="font-bold">Total Factura:</span>
          <span className="text-base font-bold text-red-700">{formatCurrency(c.total, c.moneda)}</span>
        </div>
      </div>
    </SlideOver>
  )
}
