import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | undefined | null, currency = 'BOB'): string {
  const num = typeof amount === 'number' ? amount : Number(amount)
  const val = !isNaN(num) ? num : 0
  try {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: currency || 'BOB',
      minimumFractionDigits: 2,
    }).format(val)
  } catch {
    return `Bs ${val.toFixed(2)}`
  }
}

function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime())
}

function parseDateValue(value: unknown, depth = 0): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return isValidDate(value) ? value : null

  if (typeof value === 'number' && isFinite(value)) {
    const ms = Math.abs(value) < 1e12 ? value * 1000 : value
    const d = new Date(ms)
    return isValidDate(d) ? d : null
  }

  if (typeof value === 'string') {
    const t = value.trim()
    if (!t || t === '-' || t.toLowerCase() === 'invalid date') return null
    if (/^\d+$/.test(t)) return parseDateValue(Number(t), depth)

    const dmy = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T].*)?$/)
    if (dmy) {
      const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
      return isValidDate(d) ? d : null
    }

    const ymd = t.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
    if (ymd) {
      const d = new Date(t.includes('T') || t.includes(' ') ? t.replace(' ', 'T') : t)
      if (isValidDate(d)) return d
      const local = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
      return isValidDate(local) ? local : null
    }

    const d = new Date(t)
    return isValidDate(d) ? d : null
  }

  if (Array.isArray(value) && value.length >= 3 && typeof value[0] === 'number') {
    const d = new Date(value[0], value[1] - 1, value[2], value[3] ?? 0, value[4] ?? 0, value[5] ?? 0)
    return isValidDate(d) ? d : null
  }

  if (typeof value === 'object' && depth < 2) {
    const o = value as Record<string, unknown>
    for (const k of ['fecha', 'date', 'iso', 'value', 'creadoEn', 'createdAt']) {
      const inner = parseDateValue(o[k], depth + 1)
      if (inner) return inner
    }
  }

  return null
}

function looksLikeDateKey(key: string): boolean {
  const k = key.replace(/_/g, '').toLowerCase()
  return /^(fecha|date|fechahora|fechacreacion|fechamovimiento|fecharegistro|fechaoperacion|creadoen|createdat|createdon|timestamp)$/.test(k)
    || /(fecha|createdat|creadoen)/.test(k)
}

export function getTransaccionFecha(tx: unknown): Date | null {
  if (!tx || typeof tx !== 'object') return null
  const rec = tx as Record<string, unknown>

  const preferred = [
    rec.fecha,
    rec.creadoEn,
    rec.creado_en,
    rec.createdAt,
    rec.created_at,
    rec.fechaCreacion,
    rec.fecha_creacion,
    rec.fechaMovimiento,
    rec.fecha_movimiento,
    rec.fechaRegistro,
    rec.fechaOperacion,
    rec.fechaHora,
    (rec.asiento as Record<string, unknown> | undefined)?.fecha,
    (rec.asientoContable as Record<string, unknown> | undefined)?.fecha,
  ]

  for (const v of preferred) {
    const d = parseDateValue(v)
    if (d) return d
  }

  for (const [key, value] of Object.entries(rec)) {
    if (!looksLikeDateKey(key)) continue
    const d = parseDateValue(value)
    if (d) return d
  }

  return parseDateValue(rec.updatedAt ?? rec.actualizadoEn ?? rec.updated_at)
}

export function getTransaccionCuentaNombre(
  tx: {
    cuentaNombre?: string | null
    cuentaFinanciera?: { nombre?: string | null } | null
    cuenta?: { nombre?: string | null } | null
    cuentaOrigen?: { nombre?: string | null } | null
    cuentaDestino?: { nombre?: string | null } | null
    cuentaFinancieraId?: string | null
    cuentaId?: string | null
    cuentaOrigenId?: string | null
    cuentaDestinoId?: string | null
  } | null | undefined,
  cuentas: Array<{ id: string; nombre: string }> = [],
): string {
  if (!tx) return '—'

  const origen = tx.cuentaOrigen?.nombre
    ?? cuentas.find(c => c.id === tx.cuentaOrigenId)?.nombre
  const destino = tx.cuentaDestino?.nombre
    ?? cuentas.find(c => c.id === tx.cuentaDestinoId)?.nombre
  if (origen && destino) return `${origen} → ${destino}`

  const nombre =
    tx.cuentaNombre
    || tx.cuentaFinanciera?.nombre
    || tx.cuenta?.nombre
    || origen
    || destino
    || cuentas.find(c => c.id === tx.cuentaFinancieraId || c.id === tx.cuentaId)?.nombre

  return nombre || '—'
}

export function formatDate(value?: string | number | Date | null): string {
  const d = value instanceof Date ? (isValidDate(value) ? value : null) : parseDateValue(value)
  if (!d) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export function formatDateTime(value?: string | number | Date | null): string {
  const d = value instanceof Date ? (isValidDate(value) ? value : null) : parseDateValue(value)
  if (!d) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`
}

export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'CB'
  const trimmed = name.trim()
  if (!trimmed) return 'CB'
  return trimmed
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
