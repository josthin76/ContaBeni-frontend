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

  // Cycle background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length)
    }, 5000)
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
      {/* Panel izquierdo — slideshow de imágenes */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
      >
        {/* Imágenes de fondo con crossfade */}
        {bgImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{ opacity: currentBg === i ? 1 : 0 }}
          />
        ))}

        {/* Overlay oscuro semitransparente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[1]" />

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 text-center px-8">
          <div className="flex justify-center mb-6">
            <img
              src={logotipo}
              alt="ContaBeni"
              className="h-24 sm:h-28 lg:h-32 w-auto object-contain rounded-lg shadow-lg"
              style={{ background: 'rgba(255,255,255,0.9)', padding: 12 }}
            />
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 36, fontWeight: 800, color: '#ffffff' }}>
            Conta<span style={{ color: '#facc15' }}>Beni</span>
          </h1>
          <p className="mt-3 text-base max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Sistema de contabilidad diseñado para el empresario beniano. Simple, rápido, confiable.
          </p>

          {/* Indicadores de slide */}
          <div className="flex justify-center gap-2 mt-6">
            {bgImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBg(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: currentBg === i ? 24 : 8,
                  height: 8,
                  background: currentBg === i ? '#facc15' : 'rgba(255,255,255,0.4)',
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
            <img src={logotipo} alt="ContaBeni" className="h-8 w-auto object-contain rounded" />
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
