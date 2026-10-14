// Logo del sistema ContaBeni — usa la imagen logotipo.jpg
import logotipo from '@/assets/logotipo.jpg'

export function ContaBeniLogo({ size = 'md', collapsed = false }: { size?: 'sm' | 'md' | 'lg'; collapsed?: boolean }) {
  const dimensions = { sm: 28, md: 34, lg: 48 }
  const d = dimensions[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo con forma circular y borde verde + sombra */}
      <div
        className="flex-shrink-0 overflow-hidden shadow-md"
        style={{
          width: d,
          height: d,
          borderRadius: '50%',
          border: '2px solid var(--brand-primary)',
          background: '#ffffff',
        }}
      >
        <img
          src={logotipo}
          alt="ContaBeni"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {!collapsed && (
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: size === 'lg' ? 22 : size === 'md' ? 18 : 14 }}>
          <span style={{ color: '#f8fafc', fontWeight: 700 }}>Conta</span>
          <span style={{ color: '#facc15', fontWeight: 800 }}>Beni</span>
        </span>
      )}
    </div>
  )
}
