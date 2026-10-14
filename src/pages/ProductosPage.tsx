import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertTriangle, Package, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { SlideOver } from '@/components/SlideOver'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Producto } from '@/types'

type Tab = 'catalogo' | 'inventario'

export default function ProductosPage() {
  const [tab, setTab] = useState<Tab>('catalogo')
  const [openNuevo, setOpenNuevo] = useState(false)
  const [eliminarId, setEliminarId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: productos = [], isLoading } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: () =>
      api.get('/productos').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const eliminar = useMutation({
    mutationFn: (id: string) => api.delete(`/productos/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Producto eliminado')
      qc.invalidateQueries({ queryKey: ['productos'] })
      setEliminarId(null)
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al eliminar producto'))
    },
  })

  const { data: resumen } = useQuery({
    queryKey: ['productos', 'resumen'],
    queryFn: () => api.get('/productos/resumen-inventario').then(r => r.data).catch(() => null),
  })

  const totalSkus = resumen?.total ?? resumen?.totalSkus ?? productos.length
  const totalUnidades =
    resumen?.totalUnidades ?? productos.reduce((s, p) => s + (Number(p.stock) || 0), 0)
  const valorTotal =
    resumen?.valorTotal ??
    productos.reduce((s, p) => s + (Number(p.stock) || 0) * (Number(p.costo ?? p.precio) || 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Productos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Catálogo e inventario de productos y servicios
          </p>
        </div>
        <button
          onClick={() => setOpenNuevo(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1 w-fit" style={{ background: 'var(--border-warm)' }}>
        {(['catalogo', 'inventario'] as Tab[]).map(t => (
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
            {t === 'catalogo' ? 'Catálogo' : 'Inventario'}
          </button>
        ))}
      </div>

      {/* Tab Catálogo */}
      {tab === 'catalogo' &&
        (isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse h-36 rounded-xl" style={{ background: '#e2e8f0' }} />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
            <Package size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--brand-primary)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Sin productos en el catálogo</p>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Registra tu primer producto para controlar ventas e inventario.</p>
            <button
              onClick={() => setOpenNuevo(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
              style={{ background: 'var(--brand-primary)' }}
            >
              <Plus size={14} /> Crear Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {productos.map(p => {
              const stockNum = Number(p.stock) || 0
              return (
                <div
                  key={p.id}
                  className="rounded-xl bg-white p-5 relative flex flex-col justify-between"
                  style={{
                    boxShadow: '0 2px 8px rgba(26,18,8,0.08)',
                    borderLeft: stockNum < 10 ? '3px solid #eab308' : '3px solid transparent',
                  }}
                >
                  {stockNum < 10 && (
                    <div
                      className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium"
                      style={{ color: '#b45309' }}
                    >
                      <AlertTriangle size={12} /> Stock bajo
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-lg p-2" style={{ background: 'rgba(20, 94, 50, 0.1)' }}>
                        <Package size={18} style={{ color: 'var(--brand-primary)' }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
                          {p.nombre}
                        </p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          SKU: {p.sku} {p.tipo ? `· ${p.tipo}` : ''}
                        </p>
                      </div>
                    </div>
                    {p.descripcion && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.descripcion}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Stock</p>
                        <p
                          className="text-lg font-bold"
                          style={{
                            color: stockNum < 10 ? '#B07D10' : 'var(--text-primary)',
                            fontFamily: 'Sora, sans-serif',
                          }}
                        >
                          {stockNum} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>unid.</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Precio</p>
                        <p className="text-base font-bold" style={{ color: 'var(--brand-primary)', fontFamily: 'Sora, sans-serif' }}>
                          {formatCurrency(p.precio)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setEliminarId(p.id)}
                        className="text-xs rounded-md px-2.5 py-1 font-medium text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* Tab Inventario */}
      {tab === 'inventario' && (
        <div className="space-y-4">
          {/* Resumen cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total SKUs en Catálogo', value: totalSkus },
              { label: 'Total Unidades en Stock', value: totalUnidades },
              { label: 'Valorización Total de Inventario', value: formatCurrency(valorTotal) },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-white p-5 text-center"
                style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)', borderTop: '4px solid var(--brand-primary)' }}
              >
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Tabla productos */}
          <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
                  {['Nombre', 'SKU', 'Tipo', 'Precio', 'Stock', 'Estado'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-gray-500">
                      Sin productos para mostrar en inventario
                    </td>
                  </tr>
                ) : (
                  productos.map(p => {
                    const stockNum = Number(p.stock) || 0
                    return (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--border-warm)' }}>
                        <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {p.nombre}
                        </td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {p.sku}
                        </td>
                        <td className="px-5 py-3 text-xs capitalize text-gray-500">
                          {p.tipo ?? 'Físico'}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>
                          {formatCurrency(p.precio)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold" style={{ color: stockNum < 10 ? '#B07D10' : 'var(--green-ok)' }}>
                            {stockNum}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {stockNum < 10 ? (
                            <span className="text-xs text-yellow-700 flex items-center gap-1 font-medium">
                              <AlertTriangle size={11} /> Stock bajo
                            </span>
                          ) : (
                            <span className="text-xs font-semibold" style={{ color: 'var(--green-ok)' }}>
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NuevoProductoSlideOver
        open={openNuevo}
        onClose={() => {
          setOpenNuevo(false)
          qc.invalidateQueries({ queryKey: ['productos'] })
        }}
      />

      <ConfirmDialog
        open={!!eliminarId}
        onClose={() => setEliminarId(null)}
        onConfirm={() => eliminarId && eliminar.mutate(eliminarId)}
        title="Eliminar producto"
        description="El producto será desactivado del catálogo. El historial de compras y movimientos previos se conservará."
        confirmLabel="Eliminar producto"
        isLoading={eliminar.isPending}
      />
    </div>
  )
}

function NuevoProductoSlideOver({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    nombre: '',
    sku: '',
    descripcion: '',
    tipo: 'fisico',
    precio: '',
    costo: '',
    stock: '0',
  })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.nombre.trim()) {
      toast.error('Ingresa el nombre del producto')
      return
    }
    if (!form.sku.trim()) {
      toast.error('Ingresa el código SKU del producto')
      return
    }
    if (!form.precio || Number(form.precio) < 0) {
      toast.error('Ingresa un precio de venta válido')
      return
    }

    setLoading(true)
    try {
      await api.post('/productos', {
        sku: form.sku.trim(),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        tipo: form.tipo,
        precio: Number(form.precio),
        costo: form.costo ? Number(form.costo) : undefined,
        stock: form.stock ? Number(form.stock) : 0,
      })
      toast.success('Producto creado exitosamente')
      setForm({ nombre: '', sku: '', descripcion: '', tipo: 'fisico', precio: '', costo: '', stock: '0' })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al crear producto'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nuevo Producto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nombre *</label>
          <input
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej. Arroz Grano de Oro 1kg"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>SKU *</label>
            <input
              value={form.sku}
              onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
              placeholder="Ej. ARR-001"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none uppercase"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Tipo de producto *</label>
            <select
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
              style={{ border: '1px solid var(--border-input)' }}
            >
              <option value="fisico">Físico (con inventario)</option>
              <option value="servicio">Servicio</option>
              <option value="digital">Digital</option>
              <option value="suscripcion">Suscripción</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Descripción (opcional)</label>
          <input
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            placeholder="Detalles adicionales del producto"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--border-input)' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Precio venta *</label>
            <input
              type="number"
              step="0.01"
              value={form.precio}
              onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
              placeholder="0.00"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Costo unitario</label>
            <input
              type="number"
              step="0.01"
              value={form.costo}
              onChange={e => setForm(f => ({ ...f, costo: e.target.value }))}
              placeholder="Opcional"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Stock inicial</label>
            <input
              type="number"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              placeholder="0"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--border-input)' }}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? 'Guardando...' : 'Crear Producto'}
        </button>
      </div>
    </SlideOver>
  )
}
