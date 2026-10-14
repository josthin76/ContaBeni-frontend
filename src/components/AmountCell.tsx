import { cn, formatCurrency } from '@/lib/utils'

interface AmountCellProps {
  amount: number | string
  currency?: string
  forceColor?: 'positive' | 'negative' | 'auto'
}

export function AmountCell({ amount, currency = 'BOB', forceColor = 'auto' }: AmountCellProps) {
  const num = typeof amount === 'number' ? amount : Number(amount)
  const isPositive = (isNaN(num) ? 0 : num) >= 0
  const color =
    forceColor === 'positive' ? 'var(--green-ok)' :
    forceColor === 'negative' ? 'var(--red-err)' :
    isPositive ? 'var(--green-ok)' : 'var(--red-err)'

  return (
    <span className="font-semibold tabular-nums" style={{ color }}>
      {formatCurrency(amount, currency)}
    </span>
  )
}
