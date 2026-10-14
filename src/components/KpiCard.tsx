import React from 'react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  icon: React.ReactNode
  borderColor?: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  isLoading?: boolean
}

export function KpiCard({ title, value, icon, borderColor = '#E8610A', subtitle, trend, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm animate-pulse" style={{ borderTop: `4px solid ${borderColor}` }}>
        <div className="h-4 w-24 rounded" style={{ background: '#EDE0D4' }} />
        <div className="mt-3 h-8 w-32 rounded" style={{ background: '#EDE0D4' }} />
        <div className="mt-2 h-3 w-20 rounded" style={{ background: '#EDE0D4' }} />
      </div>
    )
  }

  return (
    <div
      className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderTop: `4px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(26,18,8,0.08)' }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <span className="rounded-lg p-2" style={{ background: 'var(--surface-light)' }}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      )}
    </div>
  )
}
