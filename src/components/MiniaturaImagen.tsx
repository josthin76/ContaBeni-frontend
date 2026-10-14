import { useState } from 'react'

/**
 * Miniatura de la imagen adjunta para las listas de gastos y compras.
 *
 * Muestra un recuadro pequeño; al hacer clic abre la foto completa sobre un
 * fondo oscuro. Si el registro no tiene imagen no pinta nada, para no
 * ensuciar la tabla.
 */
export function MiniaturaImagen({ src, alt }: { src?: string | null; alt: string }) {
  const [abierto, setAbierto] = useState(false)

  if (!src) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        title="Ver imagen"
        className="block rounded-md overflow-hidden transition-transform hover:scale-105"
        style={{ border: '1px solid var(--border-warm)' }}
      >
        <img src={src} alt={alt} className="h-10 w-10 object-cover" />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(15,12,6,0.82)' }}
          onClick={() => setAbierto(false)}
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] rounded-xl bg-white"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}
            />
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full text-white text-sm font-bold flex items-center justify-center"
              style={{ background: 'var(--brand-primary)' }}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
