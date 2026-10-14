// Logo SVG del sistema ContaBeni
export function ContaBeniLogo({ size = 'md', collapsed = false }: { size?: 'sm' | 'md' | 'lg'; collapsed?: boolean }) {
  const sizes = { sm: 24, md: 32, lg: 48 }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2">
      {/* Ícono: libro con hoja del Beni */}
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Portada del libro */}
        <rect x="8" y="6" width="30" height="36" rx="3" fill="#E8610A" />
        {/* Lomo */}
        <rect x="8" y="6" width="6" height="36" rx="2" fill="#C94F0C" />
        {/* Páginas */}
        <rect x="14" y="10" width="20" height="28" rx="1" fill="#FDF6EE" />
        {/* Líneas de texto */}
        <rect x="17" y="15" width="14" height="2" rx="1" fill="#D1B49A" />
        <rect x="17" y="20" width="11" height="2" rx="1" fill="#D1B49A" />
        <rect x="17" y="25" width="14" height="2" rx="1" fill="#D1B49A" />
        {/* Hoja del Beni — referencia a la naturaleza */}
        <path
          d="M28 12 C32 8, 38 10, 36 16 C34 20, 28 20, 28 20 C28 20, 28 16, 28 12Z"
          fill="#2E7D32"
          opacity="0.85"
        />
        <line x1="28" y1="12" x2="28" y2="20" stroke="#1A4A20" strokeWidth="0.8" />
      </svg>

      {/* Texto */}
      {!collapsed && (
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: size === 'lg' ? 22 : size === 'md' ? 18 : 14 }}>
          <span style={{ color: '#FDF6EE', fontWeight: 700 }}>Conta</span>
          <span style={{ color: '#F4A535', fontWeight: 800 }}>Beni</span>
        </span>
      )}
    </div>
  )
}
