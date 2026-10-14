import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { SlideOver } from '@/components/SlideOver'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import type { Proveedor } from '@/types'

export default function ProveedoresPage() {
  const [openNuevo, setOpenNuevo] = useState(false)
  const [desactivarId, setDesactivarId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: proveedores = [], isLoading } = useQuery<Proveedor[]>({
    queryKey: ['proveedores'],
    queryFn: () =>
      api.get('/proveedores').then(r => {
        const raw = r.data
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      }),
  })

  const desactivar = useMutation({
    mutationFn: (id: string) => api.delete(`/proveedores/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Proveedor desactivado')
      qc.invalidateQueries({ queryKey: ['proveedores'] })
      setDesactivarId(null)
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al desactivar proveedor'))
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>Proveedores</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Directorio de proveedores del negocio</p>
        </div>
        <button onClick={() => setOpenNuevo(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: 'var(--brand-primary)' }}>
          <Plus size={16} /> Nuevo proveedor
        </button>
      </div>

      <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-light)', borderBottom: '1px solid var(--border-warm)' }}>
              {['Nombre', 'RIF / NIT', 'Contacto', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : proveedores.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Sin proveedores</td></tr>
            ) : proveedores.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border-warm)', opacity: p.activo ? 1 : 0.5 }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: 'rgba(20,94,50,0.1)' }}>
                      <Users size={13} style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.rif}</td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{p.contacto ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5"
                    style={{ background: p.activo ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.08)', color: p.activo ? '#2E7D32' : '#C62828' }}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {p.activo && (
                    <button onClick={() => setDesactivarId(p.id)}
                      className="text-xs rounded-md px-2 py-1 font-medium"
                      style={{ background: 'rgba(198,40,40,0.08)', color: '#C62828' }}>
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NuevoProveedorSlideOver open={openNuevo}
        onClose={() => { setOpenNuevo(false); qc.invalidateQueries({ queryKey: ['proveedores'] }) }} />

      <ConfirmDialog
        open={!!desactivarId}
        onClose={() => setDesactivarId(null)}
        onConfirm={() => desactivarId && desactivar.mutate(desactivarId)}
        title="Desactivar proveedor"
        description="El proveedor quedará inactivo pero su historial de compras se conservará."
        confirmLabel="Desactivar"
        isLoading={desactivar.isPending}
      />
    </div>
  )
}

function NuevoProveedorSlideOver({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ nombre: '', rif: '', contacto: '', direccion: '' })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.nombre.trim()) {
      toast.error('Ingresa el nombre del proveedor')
      return
    }
    if (!form.rif.trim()) {
      toast.error('Ingresa el RIF o NIT del proveedor')
      return
    }

    setLoading(true)
    try {
      await api.post('/proveedores', {
        nombre: form.nombre.trim(),
        rif: form.rif.trim(),
        contacto: form.contacto.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      })
      toast.success('Proveedor creado exitosamente')
      setForm({ nombre: '', rif: '', contacto: '', direccion: '' })
      onClose()
    } catch (e: any) {
      const msg = e.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'Error al crear proveedor'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Nuevo proveedor">
      <div className="space-y-4">
        {[
          { key: 'nombre', label: 'Nombre / Razón social', placeholder: 'Nombre del proveedor' },
          { key: 'rif', label: 'RIF / NIT', placeholder: '12345678' },
          { key: 'contacto', label: 'Contacto', placeholder: 'Teléfono o email' },
          { key: 'direccion', label: 'Dirección', placeholder: 'Dirección (opcional)' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
            <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border-input)' }} />
          </div>
        ))}
        <button onClick={submit} disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white mt-2"
          style={{ background: 'var(--brand-primary)' }}>
          {loading ? 'Guardando...' : 'Crear proveedor'}
        </button>
      </div>
    </SlideOver>
  )
}
