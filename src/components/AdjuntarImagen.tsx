import { useRef, useState } from 'react'
import { comprimirImagen, formatearTamanoImagen, IMAGEN_MAX_BYTES } from '@/lib/imagen'

/**
 * Campo "Adjuntar imagen" para los formularios de gasto y compra.
 *
 * Comprime la foto en el navegador (máx. 1200 px, JPEG) y entrega el data
 * URL al padre a través de `onChange`. En celular el atributo `capture`
 * abre la cámara directamente.
 */
export function AdjuntarImagen({
  valor,
  onChange,
  etiqueta = 'Imagen del comprobante',
}: {
  valor: string | null
  onChange: (imagen: string | null) => void
  etiqueta?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cargando, setCargando] = useState(false)

  const manejarArchivo = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen')
      return
    }
    setCargando(true)
    try {
      const comprimida = await comprimirImagen(file)
      if (comprimida.length > IMAGEN_MAX_BYTES) {
        alert('La imagen sigue siendo muy pesada después de comprimir; elige una menor.')
        return
      }
      onChange(comprimida)
    } catch {
      alert('No se pudo procesar la imagen')
    } finally {
      setCargando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
        {etiqueta}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => manejarArchivo(e.target.files?.[0])}
      />

      {valor ? (
        <div className="flex items-center gap-3 rounded-lg p-2" style={{ border: '1px solid var(--border-input)' }}>
          <img
            src={valor}
            alt="Vista previa del comprobante"
            className="h-16 w-16 rounded-md object-cover"
            style={{ border: '1px solid var(--border-warm)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
              Imagen adjunta ({formatearTamanoImagen(valor)})
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              Cambiar imagen
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold px-2 py-1 rounded-md"
            style={{ color: '#C62828', border: '1px solid var(--border-warm)' }}
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
          className="w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60"
          style={{ border: '1px dashed var(--border-input)', color: 'var(--text-muted)' }}
        >
          {cargando ? 'Comprimiendo...' : '📷 Adjuntar imagen (opcional)'}
        </button>
      )}
    </div>
  )
}
