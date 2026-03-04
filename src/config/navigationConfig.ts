/**
 * Configuración centralizada de navegación del sidebar.
 *
 * Migrado de arrays hardcodeados en Sidebar.tsx.
 * Los permisos usan lógica OR - si el usuario tiene CUALQUIERA, ve el item.
 * Un array vacío de permissions = visible para todos en la audiencia.
 */

// ============================================
// Tipos
// ============================================

export interface NavigationItem {
  href: string
  label: string
  icon: string           // Bootstrap Icon class (bi-*)
  permissions: string[]  // OR logic - vacío = visible para todos en la audiencia
}

export interface NavigationGroup {
  key: string
  label: string
  icon: string
  activePathPrefixes: string[]
  items: NavigationItem[]
  permissions: string[]  // Permisos a nivel grupo (vacío = visible si tiene hijos visibles)
  badge?: { text: string; color: string }
}

export interface DisabledModule {
  key: string
  label: string
  icon: string
  tooltip: string
}

export interface NavigationSection {
  audience: 'admin' | 'customer'
  topLinks: NavigationItem[]
  groups: NavigationGroup[]
  disabledModules: DisabledModule[]
}

// ============================================
// Navegación ADMIN
// ============================================

export const adminNavigation: NavigationSection = {
  audience: 'admin',

  topLinks: [
    { href: '/dashboard', label: 'Panel Principal', icon: 'bi-house', permissions: [] },
    { href: '/dashboard/profile', label: 'Mi perfil', icon: 'bi-person-circle', permissions: [] },
    { href: '/dashboard/users', label: 'Usuarios', icon: 'bi-people', permissions: ['users.index'] },
  ],

  groups: [
    // Page Builder
    {
      key: 'pageBuilder',
      label: 'Page Builder',
      icon: 'bi-brush',
      activePathPrefixes: ['/dashboard/pages', '/dashboard/page-builder'],
      permissions: [],
      items: [
        { href: '/dashboard/pages', label: 'Gestión de Páginas', icon: 'bi-file-earmark-text', permissions: ['page.index'] },
        { href: '/dashboard/pages/templates', label: 'Galería de Templates', icon: 'bi-layout-text-window-reverse', permissions: ['page.index'] },
      ],
    },

    // Roles y Permisos
    {
      key: 'rcrud',
      label: 'Roles y Permisos',
      icon: 'bi-shield-fill-check',
      activePathPrefixes: ['/dashboard/permission-manager', '/dashboard/roles', '/dashboard/permissions'],
      permissions: [],
      items: [
        { href: '/dashboard/permission-manager', label: 'Permission Manager', icon: 'bi-layout-text-window-reverse', permissions: ['permissions.show'] },
        { href: '/dashboard/roles', label: 'Roles', icon: 'bi-person-badge', permissions: ['roles.show'] },
        { href: '/dashboard/permissions', label: 'Permisos', icon: 'bi-shield-lock', permissions: ['permissions.show'] },
      ],
    },

    // Productos
    {
      key: 'products',
      label: 'Productos',
      icon: 'bi-box-seam',
      activePathPrefixes: ['/dashboard/products'],
      permissions: [],
      items: [
        { href: '/dashboard/products', label: 'Productos', icon: 'bi-box-seam', permissions: ['products.index'] },
        { href: '/dashboard/products/categories', label: 'Categorías', icon: 'bi-tags', permissions: ['categories.index'] },
        { href: '/dashboard/products/brands', label: 'Marcas', icon: 'bi-award', permissions: ['brands.index'] },
        { href: '/dashboard/products/units', label: 'Unidades', icon: 'bi-rulers', permissions: ['units.index'] },
      ],
    },

    // Inventario
    {
      key: 'inventory',
      label: 'Inventario',
      icon: 'bi-archive',
      activePathPrefixes: ['/dashboard/inventory'],
      permissions: [],
      items: [
        { href: '/dashboard/inventory', label: 'Dashboard', icon: 'bi-speedometer2', permissions: ['stocks.index'] },
        { href: '/dashboard/inventory/warehouses', label: 'Almacenes', icon: 'bi-building', permissions: ['warehouses.index'] },
        { href: '/dashboard/inventory/locations', label: 'Ubicaciones', icon: 'bi-geo-alt', permissions: ['locations.index'] },
        { href: '/dashboard/inventory/stock', label: 'Control de Stock', icon: 'bi-boxes', permissions: ['stocks.index'] },
        { href: '/dashboard/inventory/movements', label: 'Movimientos', icon: 'bi-arrow-left-right', permissions: ['stock-movements.index'] },
        { href: '/dashboard/inventory/product-batch', label: 'Lotes de Productos', icon: 'bi-calendar-check', permissions: ['product-batches.index'] },
        { href: '/dashboard/inventory/product-conversions', label: 'Conversiones', icon: 'bi-arrow-repeat', permissions: ['product-conversions.index'] },
        { href: '/dashboard/inventory/fraccionamiento', label: 'Fraccionamiento', icon: 'bi-scissors', permissions: ['fractionations.index'] },
      ],
    },

    // Contactos
    {
      key: 'contacts',
      label: 'Contactos',
      icon: 'bi-person-rolodex',
      activePathPrefixes: ['/dashboard/contacts'],
      permissions: [],
      items: [
        { href: '/dashboard/contacts', label: 'Gestión', icon: 'bi-person-lines-fill', permissions: ['contacts.index'] },
        { href: '/dashboard/contacts/customers', label: 'Clientes', icon: 'bi-person-check', permissions: ['contacts.index'] },
        { href: '/dashboard/contacts/suppliers', label: 'Proveedores', icon: 'bi-building', permissions: ['contacts.index'] },
        { href: '/dashboard/contacts/prospects', label: 'Prospectos', icon: 'bi-person-dash', permissions: ['contacts.index'] },
        { href: '/dashboard/contacts/create', label: 'Crear Contacto', icon: 'bi-person-plus', permissions: ['contacts.store'] },
      ],
    },

    // Cotizaciones
    {
      key: 'quotes',
      label: 'Cotizaciones',
      icon: 'bi-file-earmark-text',
      activePathPrefixes: ['/dashboard/quotes'],
      permissions: [],
      items: [
        { href: '/dashboard/quotes', label: 'Lista Cotizaciones', icon: 'bi-list-ul', permissions: ['quotes.index'] },
        { href: '/dashboard/quotes/create', label: 'Nueva Cotización', icon: 'bi-plus-circle', permissions: ['quotes.store'] },
      ],
    },

    // Ventas
    {
      key: 'sales',
      label: 'Ventas',
      icon: 'bi-cart-check',
      activePathPrefixes: ['/dashboard/sales'],
      permissions: [],
      items: [
        { href: '/dashboard/sales', label: 'Órdenes de Venta', icon: 'bi-cart-check', permissions: ['sales-orders.index'] },
        { href: '/dashboard/sales/create', label: 'Nueva Orden', icon: 'bi-plus-circle', permissions: ['sales-orders.store'] },
        { href: '/dashboard/sales/reports', label: 'Reportes', icon: 'bi-graph-up', permissions: ['sales-orders.index'] },
        { href: '/dashboard/sales/customers', label: 'Clientes', icon: 'bi-person-heart', permissions: ['sales-orders.index'] },
      ],
    },

    // Compras
    {
      key: 'purchase',
      label: 'Compras',
      icon: 'bi-cart-plus',
      activePathPrefixes: ['/dashboard/purchase'],
      permissions: [],
      items: [
        { href: '/dashboard/purchase', label: 'Órdenes de Compra', icon: 'bi-cart-plus', permissions: ['purchase-orders.index'] },
        { href: '/dashboard/purchase/create', label: 'Nueva Orden', icon: 'bi-plus-circle', permissions: ['purchase-orders.store'] },
        { href: '/dashboard/purchase/reports', label: 'Reportes', icon: 'bi-graph-up', permissions: ['purchase-orders.index'] },
        { href: '/dashboard/purchase/suppliers', label: 'Proveedores', icon: 'bi-building', permissions: ['purchase-orders.index'] },
      ],
    },

    // Finanzas
    {
      key: 'finance',
      label: 'Finanzas',
      icon: 'bi-cash-stack',
      activePathPrefixes: ['/dashboard/finance'],
      permissions: [],
      items: [
        { href: '/dashboard/finance/ap-invoices', label: 'Facturas por Pagar', icon: 'bi-receipt', permissions: ['ap-invoices.index'] },
        { href: '/dashboard/finance/ar-invoices', label: 'Facturas por Cobrar', icon: 'bi-receipt-cutoff', permissions: ['ar-invoices.index'] },
        { href: '/dashboard/finance/ap-payments', label: 'Pagos AP', icon: 'bi-credit-card', permissions: ['ap-payments.index'] },
        { href: '/dashboard/finance/ar-receipts', label: 'Recibos de Clientes', icon: 'bi-cash-coin', permissions: ['ar-receipts.index'] },
        { href: '/dashboard/finance/bank-accounts', label: 'Cuentas Bancarias', icon: 'bi-bank', permissions: ['bank-accounts.index'] },
      ],
    },

    // Contabilidad
    {
      key: 'accounting',
      label: 'Contabilidad',
      icon: 'bi-calculator',
      activePathPrefixes: ['/dashboard/accounting'],
      permissions: [],
      items: [
        { href: '/dashboard/accounting/accounts', label: 'Plan Contable', icon: 'bi-list-ol', permissions: ['accounts.index'] },
        { href: '/dashboard/accounting/journal-entries', label: 'Asientos Contables', icon: 'bi-journal-text', permissions: ['journal-entries.index'] },
        { href: '/dashboard/accounting/fiscal-periods', label: 'Períodos Fiscales', icon: 'bi-calendar-range', permissions: ['fiscal-periods.index'] },
      ],
    },

    // Reportes
    {
      key: 'reports',
      label: 'Reportes',
      icon: 'bi-file-earmark-bar-graph',
      activePathPrefixes: ['/dashboard/reports'],
      permissions: [],
      items: [
        { href: '/dashboard/reports', label: 'Dashboard Reportes', icon: 'bi-speedometer2', permissions: ['reports.balance-sheets.index'] },
        { href: '/dashboard/reports/financial-statements', label: 'Estados Financieros', icon: 'bi-file-earmark-text', permissions: ['reports.balance-sheets.index'] },
        { href: '/dashboard/reports/aging-reports', label: 'Antigüedad AR/AP', icon: 'bi-clock-history', permissions: ['reports.aging.index'] },
        { href: '/dashboard/reports/management-reports', label: 'Reportes Gerenciales', icon: 'bi-graph-up', permissions: ['reports.balance-sheets.index'] },
      ],
    },

    // Facturación CFDI
    {
      key: 'billing',
      label: 'Facturación CFDI',
      icon: 'bi-receipt-cutoff',
      activePathPrefixes: ['/dashboard/billing'],
      permissions: [],
      items: [
        { href: '/dashboard/billing', label: 'Dashboard Facturación', icon: 'bi-speedometer2', permissions: ['cfdi-invoices.index'] },
        { href: '/dashboard/billing/invoices', label: 'Facturas CFDI', icon: 'bi-file-earmark-text', permissions: ['cfdi-invoices.index'] },
        { href: '/dashboard/billing/invoices/create', label: 'Nueva Factura', icon: 'bi-plus-circle', permissions: ['cfdi-invoices.store'] },
        { href: '/dashboard/billing/settings', label: 'Configuración Fiscal', icon: 'bi-gear-fill', permissions: ['company-settings.index'] },
        { href: '/dashboard/billing/payments', label: 'Pagos Stripe', icon: 'bi-credit-card', permissions: ['cfdi-invoices.index'] },
      ],
    },

    // CRM
    {
      key: 'crm',
      label: 'CRM',
      icon: 'bi-bar-chart-line',
      activePathPrefixes: ['/dashboard/crm'],
      permissions: [],
      items: [
        { href: '/dashboard/crm', label: 'Dashboard CRM', icon: 'bi-speedometer2', permissions: ['crm.leads.index'] },
        { href: '/dashboard/crm/pipeline-stages', label: 'Etapas de Pipeline', icon: 'bi-diagram-3', permissions: ['crm.pipeline-stages.index'] },
        { href: '/dashboard/crm/leads', label: 'Leads', icon: 'bi-person-plus-fill', permissions: ['crm.leads.index'] },
        { href: '/dashboard/crm/campaigns', label: 'Campañas', icon: 'bi-megaphone', permissions: ['crm.campaigns.index'] },
      ],
    },

    // Catálogo Público
    {
      key: 'catalog',
      label: 'Catálogo Público',
      icon: 'bi-grid-3x3-gap',
      activePathPrefixes: ['/dashboard/catalog'],
      permissions: [],
      items: [
        { href: '/dashboard/catalog', label: 'Gestión', icon: 'bi-grid-3x3-gap', permissions: ['products.index'] },
        { href: '/dashboard/catalog/featured', label: 'Productos Destacados', icon: 'bi-star', permissions: ['products.index'] },
        { href: '/dashboard/catalog/offers', label: 'Ofertas', icon: 'bi-percent', permissions: ['products.index'] },
        { href: '/dashboard/catalog/settings', label: 'Configuración', icon: 'bi-gear', permissions: ['products.index'] },
      ],
    },

    // E-commerce
    {
      key: 'ecommerce',
      label: 'E-commerce',
      icon: 'bi-shop',
      activePathPrefixes: ['/dashboard/ecommerce'],
      permissions: [],
      items: [
        { href: '/dashboard/ecommerce', label: 'Dashboard E-commerce', icon: 'bi-speedometer2', permissions: ['sales-orders.index'] },
        { href: '/dashboard/ecommerce/orders', label: 'Ordenes', icon: 'bi-bag-check', permissions: ['sales-orders.index'] },
        { href: '/dashboard/ecommerce/orders/create', label: 'Nueva Orden', icon: 'bi-plus-circle', permissions: ['sales-orders.store'] },
      ],
    },

    // Recursos Humanos
    {
      key: 'hr',
      label: 'Recursos Humanos',
      icon: 'bi-people-fill',
      activePathPrefixes: ['/dashboard/hr'],
      permissions: [],
      items: [
        { href: '/dashboard/hr', label: 'Dashboard HR', icon: 'bi-speedometer2', permissions: ['employees.index'] },
        { href: '/dashboard/hr/employees', label: 'Empleados', icon: 'bi-person-badge', permissions: ['employees.index'] },
        { href: '/dashboard/hr/attendances', label: 'Asistencia', icon: 'bi-clock-history', permissions: ['attendances.index'] },
        { href: '/dashboard/hr/leaves', label: 'Permisos y Vacaciones', icon: 'bi-calendar-check', permissions: ['leaves.index'] },
        { href: '/dashboard/hr/payroll', label: 'Nómina', icon: 'bi-cash-stack', permissions: ['payroll-periods.index'] },
        { href: '/dashboard/hr/organization', label: 'Organización', icon: 'bi-diagram-3', permissions: ['departments.index'] },
      ],
    },

    // Configuración
    {
      key: 'settings',
      label: 'Configuración',
      icon: 'bi-sliders',
      activePathPrefixes: ['/dashboard/settings'],
      permissions: [],
      items: [
        { href: '/dashboard/settings/app-config', label: 'Configuracion General', icon: 'bi-gear', permissions: [] },
        { href: '/dashboard/settings/folios', label: 'Folios y Consecutivos', icon: 'bi-123', permissions: ['folio-sequences.index'] },
        { href: '/dashboard/settings/invoice-series', label: 'Series de Facturación', icon: 'bi-collection', permissions: ['invoice-series.index'] },
      ],
    },

    // Sistema
    {
      key: 'system',
      label: 'Sistema',
      icon: 'bi-gear-wide-connected',
      activePathPrefixes: ['/dashboard/audit', '/dashboard/system-health', '/dashboard/diagnostic', '/dashboard/design-system'],
      permissions: [],
      items: [
        { href: '/dashboard/audit', label: 'Auditoría', icon: 'bi-journal-text', permissions: ['audits.index'] },
        { href: '/dashboard/system-health', label: 'Estado del Sistema', icon: 'bi-heart-pulse', permissions: ['system-health.index'] },
        { href: '/dashboard/diagnostic', label: 'Diagnóstico', icon: 'bi-bug', permissions: [] },
        { href: '/dashboard/design-system', label: 'Design System', icon: 'bi-palette', permissions: [] },
      ],
    },
  ],

  disabledModules: [
    { key: 'manufacturing', label: 'Manufactura', icon: 'bi-gear-wide-connected', tooltip: 'Próximamente: Control de producción, órdenes de trabajo, BOM' },
    { key: 'quality', label: 'Control de Calidad', icon: 'bi-clipboard-check', tooltip: 'Próximamente: Inspecciones, defectos, certificaciones' },
    { key: 'logistics', label: 'Logística', icon: 'bi-truck', tooltip: 'Próximamente: Envíos, rutas, tracking' },
    { key: 'projects', label: 'Proyectos', icon: 'bi-kanban', tooltip: 'Próximamente: Gestión de proyectos, tareas, Gantt' },
    { key: 'servicedesk', label: 'Service Desk', icon: 'bi-headset', tooltip: 'Próximamente: Tickets, atención al cliente, SLA' },
    { key: 'analytics', label: 'Analytics & BI', icon: 'bi-graph-up', tooltip: 'Próximamente: Dashboards, métricas, KPIs' },
  ],
}

// ============================================
// Navegación CUSTOMER
// ============================================

export const customerNavigation: NavigationSection = {
  audience: 'customer',

  topLinks: [
    { href: '/dashboard', label: 'Mi Panel', icon: 'bi-house', permissions: [] },
    { href: '/dashboard/profile', label: 'Mi Perfil', icon: 'bi-person-circle', permissions: [] },
  ],

  groups: [
    {
      key: 'myPortal',
      label: 'Mi Portal',
      icon: 'bi-person-badge',
      activePathPrefixes: ['/dashboard/my-quotes', '/dashboard/my-orders', '/dashboard/my-cart'],
      permissions: [],
      items: [
        { href: '/dashboard/my-quotes', label: 'Mis Cotizaciones', icon: 'bi-file-earmark-text', permissions: [] },
        { href: '/dashboard/my-orders', label: 'Mis Pedidos', icon: 'bi-bag-check', permissions: [] },
        { href: '/dashboard/my-cart', label: 'Mi Carrito', icon: 'bi-cart3', permissions: [] },
      ],
    },
  ],

  disabledModules: [],
}

// ============================================
// Link extra para customers (fuera de grupos)
// ============================================

export const customerExtraLinks: NavigationItem[] = [
  { href: '/productos', label: 'Ver Catálogo', icon: 'bi-grid-3x3-gap', permissions: [] },
]
