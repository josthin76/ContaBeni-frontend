import { cn } from '@/lib/utils'

type Status = 'INGRESO' | 'EGRESO' | 'RECIBIDA' | 'PAGADA' | 'ANULADA' | 'CONFIRMADO' | 'ACTIVO' | 'TRANSFERENCIA' | string

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  INGRESO:      { label: 'Ingreso',      bg: 'rgba(46,125,50,0.1)',    color: '#2E7D32' },
  EGRESO:       { label: 'Egreso',       bg: 'rgba(198,40,40,0.1)',    color: '#C62828' },
  TRANSFERENCIA:{ label: 'Transferencia',bg: 'rgba(21,101,192,0.1)',   color: '#1565C0' },
  RECIBIDA:     { label: 'Recibida',     bg: 'rgba(244,165,53,0.15)',  color: '#B07D10' },
  PAGADA:       { label: 'Pagada',       bg: 'rgba(46,125,50,0.1)',    color: '#2E7D32' },
  ANULADA:      { label: 'Anulada',      bg: 'rgba(198,40,40,0.08)',   color: '#C62828' },
  CONFIRMADO:   { label: 'Confirmado',   bg: 'rgba(46,125,50,0.1)',    color: '#2E7D32' },
  ACTIVO:       { label: 'Activo',       bg: 'rgba(232,97,10,0.1)',    color: '#E8610A' },
}

export function StatusChip({ status }: { status?: any }) {
  const statusStr = typeof status === 'string' ? status : (status?.nombre || status?.codigo || String(status || ''))
  const cfg = statusConfig[statusStr] ?? { label: statusStr || '-', bg: '#EDE0D4', color: '#7A6352' }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
