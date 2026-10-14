import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      const { user, tokens, access_token, refresh_token } = res.data
      // El backend puede devolver tokens.accessToken o access_token directamente
      const accessToken = tokens?.accessToken ?? access_token
      const refreshToken = tokens?.refreshToken ?? refresh_token
      login(accessToken, refreshToken, user)
      navigate('/empresas')
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (Array.isArray(msg)) {
        toast.error(msg.join(' · '))
      } else {
        toast.error(msg ?? 'Credenciales incorrectas')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-light)' }}>
      {/* Panel izquierdo — ilustración */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: 'var(--surface-dark)' }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice">
          {/* Formas geométricas abstractas — naturaleza del Beni */}
          <polygon points="0,700 250,300 500,700" fill="#145e32" opacity="0.25" />
          <polygon points="0,700 0,400 200,700" fill="#facc15" opacity="0.15" />
          <polygon points="500,700 300,350 500,400" fill="#0d4a27" opacity="0.2" />
          <circle cx="380" cy="180" r="120" fill="#facc15" opacity="0.1" />
          <circle cx="100" cy="550" r="80" fill="#145e32" opacity="0.1" />
          <rect x="200" y="0" width="2" height="700" fill="#facc15" opacity="0.08" />
          <rect x="350" y="0" width="1" height="700" fill="#145e32" opacity="0.08" />
        </svg>
        <div className="relative z-10 text-center px-8">
          <div className="flex justify-center mb-6">
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="6" width="30" height="36" rx="3" fill="#145e32" />
              <rect x="8" y="6" width="6" height="36" rx="2" fill="#0d4a27" />
              <rect x="14" y="10" width="20" height="28" rx="1" fill="rgba(248,250,252,0.15)" />
              <rect x="17" y="15" width="14" height="2" rx="1" fill="rgba(254,240,138,0.4)" />
              <rect x="17" y="20" width="11" height="2" rx="1" fill="rgba(254,240,138,0.4)" />
              <rect x="17" y="25" width="14" height="2" rx="1" fill="rgba(254,240,138,0.4)" />
              <path d="M28 12 C32 8, 38 10, 36 16 C34 20, 28 20, 28 20 C28 20, 28 16, 28 12Z" fill="#16a34a" opacity="0.9" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--text-on-dark)' }}>
            Conta<span style={{ color: 'var(--brand-secondary)' }}>Beni</span>
          </h1>
          <p className="mt-3 text-base max-w-xs mx-auto" style={{ color: 'rgba(245,222,179,0.6)' }}>
            Sistema de contabilidad diseñado para el empresario beniano. Simple, rápido, confiable.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:max-w-md lg:flex-none lg:px-12 xl:max-w-lg">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <BookOpen size={28} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800 }}>
              <span style={{ color: 'var(--text-primary)' }}>Conta</span>
              <span style={{ color: 'var(--brand-primary)' }}>Beni</span>
            </span>
          </div>

          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            Bienvenido de vuelta
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Correo electrónico
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="tu@correo.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{
                  border: `1px solid ${errors.email ? 'var(--red-err)' : 'var(--border-input)'}`,
                  background: 'white',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={e => e.target.style.borderColor = errors.email ? 'var(--red-err)' : 'var(--border-input)'}
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--red-err)' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${errors.password ? 'var(--red-err)' : 'var(--border-input)'}`,
                    background: 'white',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                  onBlur={e => e.target.style.borderColor = errors.password ? 'var(--red-err)' : 'var(--border-input)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs" style={{ color: 'var(--red-err)' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: loading ? 'var(--brand-accent)' : 'var(--brand-primary)' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
