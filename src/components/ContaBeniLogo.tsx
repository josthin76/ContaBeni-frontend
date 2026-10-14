// Logo del sistema ContaBeni — usa la imagen logotipo.jpg
import logotipo from '@/assets/logotipo.jpg'

export function ContaBeniLogo({ size = 'md', collapsed = false }: { size?: 'sm' | 'md' | 'lg'; collapsed?: boolean }) {
  const heights = { sm: 28, md: 36, lg: 52 }
  const h = heights[size]

  return (
    <div className="flex items-center gap-2">
      <img
        src={logotipo}
        alt="ContaBeni"
        style={{ height: h, width: 'auto', objectFit: 'contain' }}
        className="rounded"
      />
      {!collapsed && (
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: size === 'lg' ? 22 : size === 'md' ? 18 : 14 }}>
          <span style={{ color: '#f8fafc', fontWeight: 700 }}>Conta</span>
          <span style={{ color: '#facc15', fontWeight: 800 }}>Beni</span>
        </span>
      )}
    </div>
  )
}
