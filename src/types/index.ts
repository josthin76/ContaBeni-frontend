// Tipos globales para la app ContaBeni

export interface User {
  id: string
  correo?: string
  email: string
  nombreCompleto?: string | null
  nombre: string
  roles?: string[]
  activo?: boolean
  urlAvatar?: string | null
  telefono?: string | null
}

export interface Empresa {
  id: string
  nombre: string
  razonSocial?: string | null
  rif: string
  moneda: string
  monedaPrincipal?: string
  activo?: boolean
  activa?: boolean
  tipo?: string
  zonaHoraria?: string
  locale?: string
}

export interface CuentaFinanciera {
  id: string
  nombre: string
  tipo: 'EFECTIVO' | 'BANCO' | 'CAJA'
  saldo: number | string
  moneda: string
  cuentaContableId?: string
  activo?: boolean
}

export interface Transaccion {
  id: string
  tipo: 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'
  monto: number | string
  moneda?: string
  descripcion: string
  fecha?: string
  creadoEn?: string
  createdAt?: string
  cuentaFinancieraId?: string
  cuentaId?: string
  cuentaNombre?: string
  referencia?: string
  cuentaFinanciera?: CuentaFinanciera
  cuenta?: CuentaFinanciera
  cuentaOrigen?: CuentaFinanciera
  cuentaDestino?: CuentaFinanciera
  cuentaOrigenId?: string
  cuentaDestinoId?: string
}

export interface CuentaContable {
  id: string
  codigo: string
  nombre: string
  tipo?: string
  naturaleza?: 'DEUDORA' | 'ACREEDORA'
  esTransaccional: boolean
  cuentaPadreId?: string | null
  padreId?: string | null
  hijos?: CuentaContable[]
}

export interface LineaAsiento {
  id?: string
  cuentaId: string
  cuentaCodigo?: string
  cuentaNombre?: string
  debe: number | string
  haber: number | string
  cuenta?: {
    id: string
    codigo: string
    nombre: string
  }
}

export interface Asiento {
  id: string
  correlativo?: string
  numero?: number
  fecha: string
  concepto?: string
  glosa?: string
  referencia?: string
  estado: 'CONFIRMADO' | 'ANULADO'
  debe?: number | string
  haber?: number | string
  lineas?: LineaAsiento[]
  detalles?: LineaAsiento[]
}

export interface Proveedor {
  id: string
  nombre: string
  rif: string
  contacto?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  condicionesPago?: 'CONTADO' | 'CREDITO_30' | 'CREDITO_60' | 'CREDITO_90' | string
  notas?: string | null
  activo: boolean
}

export interface LineaCompra {
  id?: string
  productoId?: string
  varianteId?: string
  descripcion: string
  cantidad: number | string
  costoUnitario: number | string
  subtotal?: number | string
  precioUnitario?: number | string
}

export interface Compra {
  id: string
  proveedorId: string
  proveedor?: Proveedor
  proveedorNombre?: string
  numeroFactura: string
  estado: 'RECIBIDA' | 'PAGADA' | 'ANULADA'
  total: number | string
  moneda: string
  fecha: string
  fechaVencimiento?: string
  tipoPago: 'CONTADO' | 'CREDITO'
  cuentaFinancieraId?: string
  detalles?: LineaCompra[]
  lineas?: LineaCompra[]
  /** Foto de la factura en base64 (data URL); null si no se adjuntó */
  imagen?: string | null
}

export interface CategoriaGasto {
  id: string
  nombre: string
  cuentaContableId?: string
  cuentaContable?: CuentaContable
  activa?: boolean
  activo?: boolean
}

export interface Gasto {
  id: string
  categoriaId: string
  categoria?: CategoriaGasto
  categoriaNombre?: string
  cuentaFinancieraId: string
  cuentaFinanciera?: CuentaFinanciera
  descripcion: string
  monto: number | string
  moneda: string
  fecha: string
  estado: 'ACTIVO' | 'ANULADO'
  numeroComprobante?: string
  /** Foto del comprobante en base64 (data URL); null si no se adjuntó */
  imagen?: string | null
}

export interface Producto {
  id: string
  nombre: string
  sku: string
  descripcion?: string | null
  tipo: 'fisico' | 'digital' | 'servicio' | 'suscripcion' | string
  estado?: 'activo' | 'borrador' | 'archivado' | 'descontinuado' | string
  precio: number | string
  costo?: number | string | null
  stock: number | string
  stockMinimo?: number | null
  tieneVariantes?: boolean
  categoriaId?: string | null
  categoria?: any
}

export interface TipoCambio {
  id: string
  tasa: number | string
  monedaOrigen: string
  monedaDestino: string
  fecha: string
  fuente?: string
}

export interface EstadoResultados {
  rango?: { fechaDesde: string; fechaHasta: string }
  ingresos: number | { total: number; grupos?: any[] }
  costos: number | { total: number; grupos?: any[] }
  gastos: number | { total: number; grupos?: any[] }
  utilidad: number
  perdida?: number
  periodo?: { desde: string; hasta: string }
}
