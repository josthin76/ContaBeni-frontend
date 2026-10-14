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

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return '-'
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return '-'
  }
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
