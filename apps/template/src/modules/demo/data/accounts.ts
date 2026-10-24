/**
 * Perfiles de la demo (DemoWorkflowSeeder). Fuente unica para las tarjetas
 * del login y el bloque de acceso de la landing.
 */
export interface DemoAccount {
  key: 'administrador' | 'vendedor' | 'cliente'
  role: string
  description: string
  email: string
  icon: string
  canTry: string[]
}

export const DEMO_PASSWORD = 'Demo2026!'

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: 'administrador',
    role: 'Administrador',
    description: 'Acceso completo al sistema y a la configuración.',
    email: 'admin@demo.mx',
    icon: 'bi-shield-lock',
    canTry: [
      'Inventario por almacén y lotes',
      'Facturación CFDI 4.0',
      'Contabilidad y reportes',
      'Usuarios, permisos y sucursales',
    ],
  },
  {
    key: 'vendedor',
    role: 'Vendedor',
    description: 'Consulta del día a día comercial.',
    email: 'vendedor@demo.mx',
    icon: 'bi-briefcase',
    canTry: [
      'Cotizaciones y su PDF',
      'Pedidos y remisiones',
      'Clientes y seguimiento (CRM)',
      'Inventario y existencias',
    ],
  },
  {
    key: 'cliente',
    role: 'Cliente',
    description: 'Lo que ve quien te compra.',
    email: 'cliente@demo.mx',
    icon: 'bi-person',
    canTry: [
      'Comprar en la tienda',
      'Mis pedidos',
      'Mis cotizaciones',
      'Carrito y checkout',
    ],
  },
]
