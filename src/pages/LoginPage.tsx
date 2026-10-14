import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

import logotipo from '@/assets/logotipo.jpg'
import bg1 from '@/assets/1.webp'
import bg2 from '@/assets/2.jpg'
import bg3 from '@/assets/3.jpg'
import bg4 from '@/assets/4.jpg'

const bgImages = [bg1, bg2, bg3, bg4]

// Ken Burns directions — each image gets a different zoom+pan origin
const kenBurnsVariants = [
  { from: 'scale(1)   translate(0, 0)',     to: 'scale(1.15) translate(-2%, -1%)' },
  { from: 'scale(1.1) translate(2%, 1%)',   to: 'scale(1)    translate(0, 0)' },
  { from: 'scale(1)   translate(0, 0)',     to: 'scale(1.12) translate(1%, -2%)' },
  { from: 'scale(1.12) translate(-1%, 2%)', to: 'scale(1)    translate(0, 0)' },
]

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentBg, setCurrentBg] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      const { user, tokens, access_token, refresh_token } = res.data
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
      {/* Panel izquierdo — slideshow con Ken Burns */}
      <div className="hidden lg:flex flex-col items-end justify-end flex-1 relative overflow-hidden">
        {/* Imágenes con efecto Ken Burns */}
        {bgImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: currentBg === i ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              transform: currentBg === i ? kenBurnsVariants[i].to : kenBurnsVariants[i].from,
              transitionProperty: 'opacity, transform',
              transitionDuration: '1.5s, 6s',
              transitionTimingFunction: 'ease-in-out, ease-in-out',
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'linear-gradient(to top, rgba(5,46,22,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.15) 100%)',
        }} />

        {/* Texto en la parte inferior */}
        <div className="relative z-10 p-10 w-full">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 32, fontWeight: 800, color: '#ffffff' }}>
            Conta<span style={{ color: '#facc15' }}>Beni</span>
          </h1>
          <p className="mt-2 text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Plataforma contable digital para el empresario del Beni. Simple, rápido, confiable.
          </p>

          {/* Indicadores */}
          <div className="flex gap-2 mt-5">
            {bgImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBg(i)}
                className="rounded-full transition-all duration-500"
                style={{
                  width: currentBg === i ? 28 : 8,
                  height: 8,
                  background: currentBg === i ? '#facc15' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:max-w-md lg:flex-none lg:px-12 xl:max-w-lg">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="overflow-hidden rounded-full border-2 shadow-sm" style={{ width: 32, height: 32, borderColor: 'var(--brand-primary)' }}>
              <img src={logotipo} alt="ContaBeni" className="w-full h-full object-cover" />
            </div>
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
