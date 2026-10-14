import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, RefreshCw, ArrowLeftRight, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { TipoCambio } from '@/types'

export default function TipoCambioPage() {
  const [montoUsd, setMontoUsd] = useState('100')
  const [montoBob, setMontoBob] = useState('')
  const [modoConversion, setModoConversion] = useState<'USD_A_BOB' | 'BOB_A_USD'>('USD_A_BOB')

  const { data, isLoading, isError, refetch, isFetching } = useQuery<TipoCambio>({
    queryKey: ['tipo-cambio'],
    queryFn: () => api.get('/tipo-cambio').then(r => r.data),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  })

  // Tasa actual del API o fallback del mercado (11.70)
  const tasaActual = Number(data?.tasa) || 11.70
  const tasaOficialBcb = 6.96

  // Cálculos de conversión
  const resultadoBob = (Number(montoUsd) || 0) * tasaActual
  const resultadoUsd = tasaActual > 0 ? (Number(montoBob) || 0) / tasaActual : 0

  const handleActualizar = async () => {
    try {
      const res = await refetch()
      if (res.data) {
        toast.success(`Tipo de cambio actualizado: 1 USD = Bs ${Number(res.data.tasa).toFixed(2)}`)
      } else {
        toast.info('Tasa de cambio cargada correctamente')
      }
    } catch {
      toast.error('No se pudo conectar con el servidor de tipo de cambio')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
          Tipo de Cambio
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Cotización vigente USD ↔ BOB para transacciones y contabilidad
        </p>
      </div>

      {/* Grid de 2 columnas: Cotización actual + Calculadora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card Cotización Principal */}
        <div
          className="rounded-2xl bg-white p-8 flex flex-col items-center gap-4 relative overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(26,18,8,0.08)', border: '1px solid var(--border-warm)' }}
        >
          {/* Badge de estado de conexión */}
          <div className="w-full flex justify-between items-center text-xs">
            {isError ? (
              <span className="inline-flex items-center gap-1 font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-200">
                <AlertCircle size={12} /> Tasa referencial
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                <CheckCircle2 size={12} /> API en línea
              </span>
            )}
            <span className="text-gray-400">USD / BOB</span>
          </div>

          <div className="rounded-full p-4 mt-2" style={{ background: 'rgba(20,94,50,0.1)' }}>
            <TrendingUp size={36} style={{ color: 'var(--brand-primary)' }} />
          </div>

          {isLoading ? (
            <div className="animate-pulse h-20 w-44 rounded-xl bg-emerald-100/50" />
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                1 Dólar estadounidense (USD) =
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: 48,
                    fontWeight: 800,
                    color: 'var(--brand-primary)',
                    lineHeight: 1,
                  }}
                >
                  {tasaActual.toFixed(2)}
                </span>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  BOB
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Bolivianos por cada Dólar</p>
            </div>
          )}

          {data?.fecha && (
            <p className="text-xs text-gray-500">
              Fecha de cotización: <span className="font-semibold">{formatDate(data.fecha)}</span>
            </p>
          )}

          <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={handleActualizar}
              disabled={isFetching}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-60"
              style={{
                background: isFetching ? 'var(--surface-light)' : 'var(--brand-primary)',
                color: isFetching ? 'var(--text-muted)' : 'white',
              }}
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Consultando API...' : 'Actualizar cotización'}
            </button>
            <p className="text-[11px] text-center text-gray-400">
              Fuente: {data?.fuente ?? 'API Contabily (Cotización de Mercado)'}
            </p>
          </div>
        </div>

        {/* Card Calculadora Conversora */}
        <div
          className="rounded-2xl bg-white p-8 flex flex-col justify-between"
          style={{ boxShadow: '0 4px 24px rgba(26,18,8,0.08)', border: '1px solid var(--border-warm)' }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-800" />
                <h3 className="font-bold text-base" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Calculadora de Conversión
                </h3>
              </div>
              <button
                onClick={() =>
                  setModoConversion(m => (m === 'USD_A_BOB' ? 'BOB_A_USD' : 'USD_A_BOB'))
                }
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 p-1 rounded"
              >
                <ArrowLeftRight size={13} /> Invertir
              </button>
            </div>

            {modoConversion === 'USD_A_BOB' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Monto en Dólares (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      step="any"
                      value={montoUsd}
                      onChange={e => setMontoUsd(e.target.value)}
                      placeholder="100.00"
                      className="w-full rounded-lg pl-8 pr-3 py-2 text-base font-bold outline-none border border-gray-300 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <p className="text-xs text-emerald-900 font-medium">Equivalente en Bolivianos (BOB):</p>
                  <p className="text-2xl font-extrabold text-emerald-950 mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {formatCurrency(resultadoBob, 'BOB')}
                  </p>
                  <p className="text-[11px] text-emerald-800/80 mt-1">
                    Calculado a tasa: 1 USD = {tasaActual.toFixed(2)} BOB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Monto en Bolivianos (BOB)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">Bs</span>
                    <input
                      type="number"
                      step="any"
                      value={montoBob}
                      onChange={e => setMontoBob(e.target.value)}
                      placeholder="1000.00"
                      className="w-full rounded-lg pl-9 pr-3 py-2 text-base font-bold outline-none border border-gray-300 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60">
                  <p className="text-xs text-blue-900 font-medium">Equivalente en Dólares (USD):</p>
                  <p className="text-2xl font-extrabold text-blue-950 mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                    ${resultadoUsd.toFixed(2)} USD
                  </p>
                  <p className="text-[11px] text-blue-800/80 mt-1">
                    Calculado a tasa: 1 USD = {tasaActual.toFixed(2)} BOB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Comparativa de tasas */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs space-y-2">
            <div className="flex justify-between items-center text-gray-600">
              <span>Tasa Activa de Mercado:</span>
              <span className="font-bold text-gray-900">Bs {tasaActual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Tasa Oficial BCB (fija):</span>
              <span className="font-semibold text-gray-700">Bs {tasaOficialBcb.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
