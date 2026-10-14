import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import EmpresasPage from '@/pages/EmpresasPage'
import DashboardPage from '@/pages/DashboardPage'
import CajasPage from '@/pages/CajasPage'
import ContabilidadPage from '@/pages/ContabilidadPage'
import ComprasPage from '@/pages/ComprasPage'
import GastosPage from '@/pages/GastosPage'
import ProductosPage from '@/pages/ProductosPage'
import ProveedoresPage from '@/pages/ProveedoresPage'
import TipoCambioPage from '@/pages/TipoCambioPage'

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Error al iniciar la aplicación">
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="cajas" element={<CajasPage />} />
                <Route path="contabilidad" element={<ContabilidadPage />} />
                <Route path="compras" element={<ComprasPage />} />
                <Route path="gastos" element={<GastosPage />} />
                <Route path="productos" element={<ProductosPage />} />
                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="tipo-cambio" element={<TipoCambioPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                borderRadius: 10,
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
