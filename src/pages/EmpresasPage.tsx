import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle2, Building2, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import type { Empresa } from '@/types'

export default function EmpresasPage() {
  const { empresa, setEmpresa, logout } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', rif: '', moneda: 'BOB' })
  const [formErrors, setFormErrors] = useState<{ nombre?: string; rif?: string }>({})

  const { data: empresas = [], isLoading } = useQuery<Empresa[]>({
    queryKey: ['empresas'],
    queryFn: () => api.get('/empresas').then(r => r.data),
  })

  const seleccionar = async (emp: Empresa) => {
    try {
      await api.put(`/empresas/${emp.id}/activar`).catch((e) => console.warn('Aviso al activar empresa:', e))
    } finally {
      setEmpresa(emp)
      navigate('/app/dashboard')
    }
  }

  const crear = useMutation({
    mutationFn: (data: typeof form) => api.post('/empresas', data).then(r => r.data),
    onSuccess: async (nueva: Empresa) => {
      qc.invalidateQueries({ queryKey: ['empresas'] })
      setShowForm(false)
      setForm({ nombre: '', rif: '', moneda: 'BOB' })
      setFormErrors({})
      toast.success('Empresa creada exitosamente')
      if (nueva?.id) {
        await seleccionar(nueva)
      }
    },
    onError: (e: any) => {
      const data = e.response?.data
      let msg = 'Error al crear la empresa'
      if (Array.isArray(data?.message)) {
        msg = data.message.join(' · ')
      } else if (typeof data?.message === 'string') {
        msg = data.message
      }
      toast.error(msg)
    },
  })

  const handleCrear = () => {
    const errs: { nombre?: string; rif?: string } = {}
    if (!form.nombre.trim()) errs.nombre = 'Ingresa el nombre de la empresa'
    if (!form.rif.trim()) errs.rif = 'Ingresa el RIF o NIT'
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    crear.mutate({
      nombre: form.nombre.trim(),
      rif: form.rif.trim(),
      moneda: form.moneda,
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--surface-light)' }}>
      <div className="w-full max-w-2xl">
        {empresa && (
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-emerald-100/50"
              style={{ color: 'var(--brand-primary)', border: '1px solid rgba(20,94,50,0.2)' }}
            >
              <ArrowLeft size={14} />
              <span>Volver al Dashboard ({empresa.nombre})</span>
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            Conta<span style={{ color: 'var(--brand-primary)' }}>Beni</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Selecciona o crea una empresa para continuar
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse rounded-xl bg-white h-28" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {empresas.map(emp => (
              <button
                key={emp.id}
                onClick={() => seleccionar(emp)}
                className="text-left rounded-xl bg-white p-5 transition-all hover:shadow-md group"
                style={{
                  boxShadow: '0 2px 8px rgba(26,18,8,0.08)',
                  border: (emp.activo ?? emp.activa) ? '2px solid var(--brand-primary)' : '2px solid transparent',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{ width: 40, height: 40, background: 'rgba(20,94,50,0.1)' }}
                  >
                    <Building2 size={20} style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  {(emp.activo ?? emp.activa) && (
                    <span className="ml-auto text-xs font-semibold rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(20,94,50,0.1)', color: 'var(--brand-primary)' }}>
                      Activa
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>{emp.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>RIF: {emp.rif} · {(emp as any).moneda ?? (emp as any).monedaPrincipal ?? 'BOB'}</p>
              </button>
            ))}

            {/* Nueva empresa */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-sm font-medium transition-colors hover:border-orange-400"
                style={{ borderColor: 'var(--border-input)', color: 'var(--text-muted)', minHeight: 112 }}
              >
                <Plus size={18} />
                Nueva empresa
              </button>
            ) : (
              <div className="rounded-xl bg-white p-5 col-span-full" style={{ boxShadow: '0 2px 8px rgba(26,18,8,0.08)', border: '2px solid var(--border-warm)' }}>
                <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Nueva empresa</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Nombre de la empresa *
                    </label>
                    <input
                      placeholder="Ej. Distribuidora Beni S.R.L."
                      value={form.nombre}
                      onChange={e => {
                        setForm(f => ({ ...f, nombre: e.target.value }))
                        if (formErrors.nombre) setFormErrors(err => ({ ...err, nombre: undefined }))
                      }}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                      style={{
                        border: `1px solid ${formErrors.nombre ? 'var(--red-err)' : 'var(--border-input)'}`,
                      }}
                    />
                    {formErrors.nombre && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--red-err)' }}>{formErrors.nombre}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        RIF / NIT *
                      </label>
                      <input
                        placeholder="Ej. NIT-987654321"
                        value={form.rif}
                        onChange={e => {
                          setForm(f => ({ ...f, rif: e.target.value }))
                          if (formErrors.rif) setFormErrors(err => ({ ...err, rif: undefined }))
                        }}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                        style={{
                          border: `1px solid ${formErrors.rif ? 'var(--red-err)' : 'var(--border-input)'}`,
                        }}
                      />
                      {formErrors.rif && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--red-err)' }}>{formErrors.rif}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Moneda principal
                      </label>
                      <select
                        value={form.moneda}
                        onChange={e => setForm(f => ({ ...f, moneda: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-white"
                        style={{ border: '1px solid var(--border-input)' }}
                      >
                        <option value="BOB">BOB - Boliviano</option>
                        <option value="USD">USD - Dólar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-2" style={{ borderTop: '1px solid var(--border-warm)' }}>
                  <button
                    onClick={handleCrear}
                    disabled={crear.isPending}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    {crear.isPending ? 'Guardando...' : 'Crear y Continuar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setFormErrors({})
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <button onClick={logout} className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
