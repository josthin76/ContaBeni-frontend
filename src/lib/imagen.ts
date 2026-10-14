/**
 * Compresión de imágenes adjuntas (foto del ticket/factura).
 *
 * La imagen viaja en base64 dentro del JSON hacia el backend, que la guarda
 * en una columna TEXT. Sin comprimir, una foto de celular (3-8 MB) reventaría
 * tanto el límite del body como la base de datos, así que siempre se reduce
 * antes de enviarla.
 */

/** Lado máximo del lado mayor; por encima se redimensiona conservando proporción. */
const LADO_MAXIMO = 1200;

/** Calidad JPEG (~72%) — buen equilibrio entre legibilidad del ticket y tamaño. */
const CALIDAD = 0.72;

export const IMAGEN_MAX_BYTES = 2_000_000;

/**
 * Redimensiona y comprime un archivo de imagen a un data URL JPEG.
 *
 * Devuelve un string tipo `data:image/jpeg;base64,...` listo para guardarse
 * tal cual en el campo `imagen` del gasto o la compra.
 */
export async function comprimirImagen(file: File): Promise<string> {
  const bitmap = await cargarImagen(file);

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));

  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('El navegador no puede procesar la imagen');
  // Fondo blanco: evita que los PNG transparentes salgan negros en el JPEG.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(bitmap, 0, 0, ancho, alto);

  if ('close' in bitmap) bitmap.close();

  return lienzo.toDataURL('image/jpeg', CALIDAD);
}

async function cargarImagen(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Formatos que createImageBitmap no soporta (p. ej. HEIC): seguimos con <img>.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Tamaño legible para mostrar junto a la vista previa (p. ej. "182 KB"). */
export function formatearTamanoImagen(dataUrl: string): string {
  // base64 ocupa ~4/3 su contenido binario.
  const bytes = Math.round((dataUrl.length * 3) / 4);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
