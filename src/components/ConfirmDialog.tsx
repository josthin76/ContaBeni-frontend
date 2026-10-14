import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
  danger?: boolean
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirmar', isLoading, danger = true,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(26,18,8,0.45)' }} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" style={{ boxShadow: '0 8px 32px rgba(26,18,8,0.18)' }}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full p-2" style={{ background: danger ? 'rgba(198,40,40,0.1)' : 'rgba(232,97,10,0.1)' }}>
            <AlertTriangle size={20} style={{ color: danger ? '#C62828' : '#E8610A' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: 'var(--surface-light)', color: 'var(--text-muted)', border: '1px solid var(--border-warm)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: danger ? '#C62828' : 'var(--brand-primary)' }}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
