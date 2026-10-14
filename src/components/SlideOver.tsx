import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export function SlideOver({ open, onClose, title, children, width = '480px' }: SlideOverProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(26,18,8,0.45)' }}
        onClick={onClose}
      />

      {/* Panel — en móvil ocupa todo el ancho (evita que se salga de pantalla) */}
      <div
        className="relative flex h-full flex-col bg-white shadow-2xl overflow-y-auto"
        style={{ width, maxWidth: '100%', animation: 'slideIn 0.2s ease-out' }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-warm)' }}
        >
          <h2 className="text-lg font-bold pr-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 -mr-1.5 transition-colors hover:bg-gray-100 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
