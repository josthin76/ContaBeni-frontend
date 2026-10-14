import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends (React.Component as any) {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.props = props
    this.state = {
      hasError: false,
      error: null,
    }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {this.props.fallbackTitle || 'Ocurrió un error inesperado al cargar esta sección'}
          </h2>
          <p className="text-xs text-gray-500 max-w-md mb-6 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 text-left overflow-auto">
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
            <button
              onClick={() => (window.location.href = '/empresas')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              <Home size={14} />
              Ir a Empresas
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
