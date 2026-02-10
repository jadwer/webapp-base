'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import NavigationProgress from './NavigationProgress'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useAuth } from '@/modules/auth'
import { isAdmin, hasAnyRole } from '@/lib/permissions'
import styles from '@/ui/styles/modules/Sidebar.module.scss'

// ============================================
// Enlaces para ADMIN
// ============================================

// Enlaces simples para ADMIN (siempre visibles para admins)
const adminBaseLinks = [
  { href: '/dashboard', label: 'Panel Principal', icon: 'bi-house' },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: 'bi-person-circle' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'bi-people' }
]

// Sistema y Diagnóstico
const systemLinks = [
  { href: '/dashboard/audit', label: 'Auditoría', icon: 'bi-journal-text' },
  { href: '/dashboard/system-health', label: 'Estado del Sistema', icon: 'bi-heart-pulse' },
  { href: '/dashboard/diagnostic', label: 'Diagnóstico', icon: 'bi-bug' },
  { href: '/dashboard/design-system', label: 'Design System', icon: 'bi-palette' }
]

// Page Builder
const pageBuilderLinks = [
  { href: '/dashboard/pages', label: 'Gestión de Páginas', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/pages/templates', label: 'Galería de Templates', icon: 'bi-layout-text-window-reverse' }
]

// Roles y Permisos
const rcrudLinks = [
  { href: '/dashboard/permission-manager', label: 'Permission Manager', icon: 'bi-layout-text-window-reverse' },
  { href: '/dashboard/roles', label: 'Roles', icon: 'bi-person-badge' },
  { href: '/dashboard/permissions', label: 'Permisos', icon: 'bi-shield-lock' }
]

// Productos
const productsLinks = [
  { href: '/dashboard/products', label: 'Productos', icon: 'bi-box-seam' },
  { href: '/dashboard/products/categories', label: 'Categorías', icon: 'bi-tags' },
  { href: '/dashboard/products/brands', label: 'Marcas', icon: 'bi-award' },
  { href: '/dashboard/products/units', label: 'Unidades', icon: 'bi-rulers' }
]

// Contactos
const contactsLinks = [
  { href: '/dashboard/contacts', label: 'Gestión', icon: 'bi-person-lines-fill' },
  { href: '/dashboard/contacts/customers', label: 'Clientes', icon: 'bi-person-check' },
  { href: '/dashboard/contacts/suppliers', label: 'Proveedores', icon: 'bi-building' },
  { href: '/dashboard/contacts/create', label: 'Crear Contacto', icon: 'bi-person-plus' }
]

// Inventario
const inventoryLinks = [
  { href: '/dashboard/inventory', label: 'Dashboard', icon: 'bi-speedometer2' },
  { href: '/dashboard/inventory/warehouses', label: 'Almacenes', icon: 'bi-building' },
  { href: '/dashboard/inventory/locations', label: 'Ubicaciones', icon: 'bi-geo-alt' },
  { href: '/dashboard/inventory/stock', label: 'Control de Stock', icon: 'bi-boxes' },
  { href: '/dashboard/inventory/movements', label: 'Movimientos', icon: 'bi-arrow-left-right' },
  { href: '/dashboard/inventory/product-batch', label: 'Lotes de Productos', icon: 'bi-calendar-check' }
]

// Cotizaciones (Admin)
const quotesLinks = [
  { href: '/dashboard/quotes', label: 'Lista Cotizaciones', icon: 'bi-list-ul' },
  { href: '/dashboard/quotes/create', label: 'Nueva Cotización', icon: 'bi-plus-circle' }
]

// Ventas
const salesLinks = [
  { href: '/dashboard/sales', label: 'Órdenes de Venta', icon: 'bi-cart-check' },
  { href: '/dashboard/sales/create', label: 'Nueva Orden', icon: 'bi-plus-circle' },
  { href: '/dashboard/sales/reports', label: 'Reportes', icon: 'bi-graph-up' },
  { href: '/dashboard/sales/customers', label: 'Clientes', icon: 'bi-person-heart' }
]

// Compras
const purchaseLinks = [
  { href: '/dashboard/purchase', label: 'Órdenes de Compra', icon: 'bi-cart-plus' },
  { href: '/dashboard/purchase/create', label: 'Nueva Orden', icon: 'bi-plus-circle' },
  { href: '/dashboard/purchase/reports', label: 'Reportes', icon: 'bi-graph-up' },
  { href: '/dashboard/purchase/suppliers', label: 'Proveedores', icon: 'bi-building' }
]

// Finanzas
const financeLinks = [
  { href: '/dashboard/finance/ap-invoices', label: 'Facturas por Pagar', icon: 'bi-receipt' },
  { href: '/dashboard/finance/ar-invoices', label: 'Facturas por Cobrar', icon: 'bi-receipt-cutoff' },
  { href: '/dashboard/finance/ap-payments', label: 'Pagos AP', icon: 'bi-credit-card' },
  { href: '/dashboard/finance/ar-receipts', label: 'Recibos de Clientes', icon: 'bi-cash-coin' },
  { href: '/dashboard/finance/bank-accounts', label: 'Cuentas Bancarias', icon: 'bi-bank' }
]

// Contabilidad
const accountingLinks = [
  { href: '/dashboard/accounting/accounts', label: 'Plan Contable', icon: 'bi-list-ol' },
  { href: '/dashboard/accounting/journal-entries', label: 'Asientos Contables', icon: 'bi-journal-text' },
  { href: '/dashboard/accounting/fiscal-periods', label: 'Períodos Fiscales', icon: 'bi-calendar-range' }
]

// Reportes (módulo independiente)
const reportsLinks = [
  { href: '/dashboard/reports', label: 'Dashboard Reportes', icon: 'bi-speedometer2' },
  { href: '/dashboard/reports/financial-statements', label: 'Estados Financieros', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/reports/aging-reports', label: 'Antigüedad AR/AP', icon: 'bi-clock-history' },
  { href: '/dashboard/reports/management-reports', label: 'Reportes Gerenciales', icon: 'bi-graph-up' }
]

// CRM
const crmLinks = [
  { href: '/dashboard/crm', label: 'Dashboard CRM', icon: 'bi-speedometer2' },
  { href: '/dashboard/crm/pipeline-stages', label: 'Etapas de Pipeline', icon: 'bi-diagram-3' },
  { href: '/dashboard/crm/leads', label: 'Leads', icon: 'bi-person-plus-fill' },
  { href: '/dashboard/crm/campaigns', label: 'Campañas', icon: 'bi-megaphone' }
]

// Recursos Humanos
const hrLinks = [
  { href: '/dashboard/hr', label: 'Dashboard HR', icon: 'bi-speedometer2' },
  { href: '/dashboard/hr/employees', label: 'Empleados', icon: 'bi-person-badge' },
  { href: '/dashboard/hr/attendances', label: 'Asistencia', icon: 'bi-clock-history' },
  { href: '/dashboard/hr/leaves', label: 'Permisos y Vacaciones', icon: 'bi-calendar-check' },
  { href: '/dashboard/hr/payroll', label: 'Nómina', icon: 'bi-cash-stack' },
  { href: '/dashboard/hr/organization', label: 'Organización', icon: 'bi-diagram-3' }
]

// Facturación CFDI
const billingLinks = [
  { href: '/dashboard/billing', label: 'Dashboard Facturación', icon: 'bi-speedometer2' },
  { href: '/dashboard/billing/invoices', label: 'Facturas CFDI', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/billing/invoices/create', label: 'Nueva Factura', icon: 'bi-plus-circle' },
  { href: '/dashboard/billing/settings', label: 'Configuración Fiscal', icon: 'bi-gear-fill' },
  { href: '/dashboard/billing/payments', label: 'Pagos Stripe', icon: 'bi-credit-card' }
]

// Configuración del sistema
const settingsLinks = [
  { href: '/dashboard/settings/folios', label: 'Folios y Consecutivos', icon: 'bi-123' },
  { href: '/dashboard/settings/invoice-series', label: 'Series de Facturación', icon: 'bi-collection' }
]

// Catálogo Público
const catalogLinks = [
  { href: '/dashboard/catalog', label: 'Gestión', icon: 'bi-grid-3x3-gap' },
  { href: '/dashboard/catalog/featured', label: 'Productos Destacados', icon: 'bi-star' },
  { href: '/dashboard/catalog/offers', label: 'Ofertas', icon: 'bi-percent' },
  { href: '/dashboard/catalog/settings', label: 'Configuración', icon: 'bi-gear' }
]

// E-commerce
const ecommerceLinks = [
  { href: '/dashboard/ecommerce', label: 'Dashboard E-commerce', icon: 'bi-speedometer2' },
  { href: '/dashboard/ecommerce/orders', label: 'Ordenes', icon: 'bi-bag-check' },
  { href: '/dashboard/ecommerce/orders/create', label: 'Nueva Orden', icon: 'bi-plus-circle' }
]

// Módulos planificados (deshabilitados)
const disabledModules = [
  {
    key: 'manufacturing',
    label: 'Manufactura',
    icon: 'bi-gear-wide-connected',
    tooltip: 'Próximamente: Control de producción, órdenes de trabajo, BOM'
  },
  {
    key: 'quality',
    label: 'Control de Calidad',
    icon: 'bi-clipboard-check',
    tooltip: 'Próximamente: Inspecciones, defectos, certificaciones'
  },
  {
    key: 'logistics',
    label: 'Logística',
    icon: 'bi-truck',
    tooltip: 'Próximamente: Envíos, rutas, tracking'
  },
  {
    key: 'projects',
    label: 'Proyectos',
    icon: 'bi-kanban',
    tooltip: 'Próximamente: Gestión de proyectos, tareas, Gantt'
  },
  {
    key: 'servicedesk',
    label: 'Service Desk',
    icon: 'bi-headset',
    tooltip: 'Próximamente: Tickets, atención al cliente, SLA'
  },
  {
    key: 'analytics',
    label: 'Analytics & BI',
    icon: 'bi-graph-up',
    tooltip: 'Próximamente: Dashboards, métricas, KPIs'
  }
]

// ============================================
// Enlaces para CUSTOMER (Portal Cliente)
// ============================================

const customerBaseLinks = [
  { href: '/dashboard', label: 'Mi Panel', icon: 'bi-house' },
  { href: '/dashboard/profile', label: 'Mi Perfil', icon: 'bi-person-circle' }
]

// Mi Portal (solo para clientes)
const myPortalLinks = [
  { href: '/dashboard/my-quotes', label: 'Mis Cotizaciones', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/my-orders', label: 'Mis Pedidos', icon: 'bi-bag-check' },
  { href: '/dashboard/my-cart', label: 'Mi Carrito', icon: 'bi-cart3' }
]

// ============================================
// Componente Sidebar
// ============================================

export default function Sidebar() {
  const pathname = usePathname()
  const navigation = useNavigationProgress()
  const { user, isLoading: authLoading } = useAuth()
  const [open, setOpen] = useState(false)

  // Determinar si el usuario es admin
  const userIsAdmin = isAdmin(user)
  const userIsCustomer = hasAnyRole(user, ['customer', 'cliente'])

  // Seleccionar enlaces base según rol
  const baseLinks = userIsAdmin ? adminBaseLinks : customerBaseLinks

  // Estados de grupos desplegables
  const [rcrudOpen, setRcrudOpen] = useState(
    pathname?.startsWith('/dashboard/permission-manager') ||
    pathname?.startsWith('/dashboard/roles') ||
    pathname?.startsWith('/dashboard/permissions')
  )
  const [pageBuilderOpen, setPageBuilderOpen] = useState(
    pathname?.startsWith('/dashboard/pages') ||
    pathname?.startsWith('/dashboard/page-builder')
  )
  const [productsOpen, setProductsOpen] = useState(pathname?.startsWith('/dashboard/products'))
  const [contactsOpen, setContactsOpen] = useState(pathname?.startsWith('/dashboard/contacts'))
  const [inventoryOpen, setInventoryOpen] = useState(pathname?.startsWith('/dashboard/inventory'))
  const [quotesOpen, setQuotesOpen] = useState(pathname?.startsWith('/dashboard/quotes'))
  const [salesOpen, setSalesOpen] = useState(pathname?.startsWith('/dashboard/sales'))
  const [purchaseOpen, setPurchaseOpen] = useState(pathname?.startsWith('/dashboard/purchase'))
  const [financeOpen, setFinanceOpen] = useState(pathname?.startsWith('/dashboard/finance'))
  const [accountingOpen, setAccountingOpen] = useState(pathname?.startsWith('/dashboard/accounting'))
  const [reportsOpen, setReportsOpen] = useState(pathname?.startsWith('/dashboard/reports'))
  const [crmOpen, setCrmOpen] = useState(pathname?.startsWith('/dashboard/crm'))
  const [hrOpen, setHrOpen] = useState(pathname?.startsWith('/dashboard/hr'))
  const [billingOpen, setBillingOpen] = useState(pathname?.startsWith('/dashboard/billing'))
  const [catalogOpen, setCatalogOpen] = useState(pathname?.startsWith('/dashboard/catalog'))
  const [ecommerceOpen, setEcommerceOpen] = useState(pathname?.startsWith('/dashboard/ecommerce'))
  const [settingsOpen, setSettingsOpen] = useState(pathname?.startsWith('/dashboard/settings'))
  const [systemOpen, setSystemOpen] = useState(
    pathname?.startsWith('/dashboard/audit') ||
    pathname?.startsWith('/dashboard/system-health') ||
    pathname?.startsWith('/dashboard/diagnostic') ||
    pathname?.startsWith('/dashboard/design-system')
  )
  const [myPortalOpen, setMyPortalOpen] = useState(
    pathname?.startsWith('/dashboard/my-quotes') ||
    pathname?.startsWith('/dashboard/my-orders') ||
    pathname?.startsWith('/dashboard/my-cart')
  )

  // Función helper para renderizar un grupo
  const renderGroup = (
    label: string,
    icon: string,
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    links: typeof productsLinks,
    badge?: { text: string; color: string }
  ) => (
    <li className={styles.navItem}>
      <button
        className={`${styles.groupButton} ${isOpen ? styles.groupActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.groupContent}>
          <i className={`bi ${icon}`} aria-hidden="true"></i>
          {label}
          {badge && (
            <span
              className={styles.badge}
              style={{
                backgroundColor: badge.color,
                marginLeft: '8px',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                color: 'white'
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        <i className={`bi bi-chevron-right ${styles.groupChevron} ${isOpen ? styles.expanded : ''}`}></i>
      </button>

      <div className={`${styles.subMenu} ${isOpen ? styles.expanded : styles.collapsed}`}>
        <ul className={styles.subNavList}>
          {links.map(({ href, label, icon }) => (
            <li key={href}>
              <button
                onClick={() => navigation.push(href)}
                className={`${styles.subNavLink} ${pathname === href ? styles.active : ''}`}
              >
                <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )

  // Función helper para renderizar módulos deshabilitados
  const renderDisabledModule = (module: typeof disabledModules[0]) => (
    <li className={styles.navItem} key={module.key}>
      <button
        className={`${styles.groupButton} ${styles.disabled}`}
        disabled
        title={module.tooltip}
        style={{ cursor: 'not-allowed', opacity: 0.5 }}
      >
        <div className={styles.groupContent}>
          <i className={`bi ${module.icon}`} aria-hidden="true"></i>
          {module.label}
          <span
            className={styles.badge}
            style={{
              backgroundColor: '#6c757d',
              marginLeft: '8px',
              fontSize: '9px',
              padding: '2px 5px',
              borderRadius: '8px',
              color: 'white'
            }}
          >
            PRÓXIMAMENTE
          </span>
        </div>
      </button>
    </li>
  )

  // Loading state
  if (authLoading) {
    return (
      <>
        <NavigationProgress />
        <aside className={styles.sidebar}>
          <div className={styles.header}>
            <h6 className={styles.title}>Cargando...</h6>
          </div>
          <nav className={styles.navigation}>
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
            </div>
          </nav>
        </aside>
      </>
    )
  }

  return (
    <>
      <NavigationProgress />

      <button
        className={styles.toggleButton}
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-list"></i>
      </button>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <h6 className={styles.title}>
            {userIsAdmin ? 'Menú Admin' : 'Mi Portal'}
          </h6>
          {user && (
            <small className="text-muted d-block" style={{ fontSize: '11px', marginTop: '4px' }}>
              {user.name || user.email}
            </small>
          )}
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {/* Enlaces base (según rol) */}
            {baseLinks.map(({ href, label, icon }) => (
              <li className={styles.navItem} key={href}>
                <button
                  onClick={() => navigation.push(href)}
                  className={`${styles.navLink} ${
                    (pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))) ? styles.active : ''
                  }`}
                >
                  <i className={`bi ${icon} ${styles.navIcon}`} aria-hidden="true"></i>
                  {label}
                </button>
              </li>
            ))}

            {/* ============================================ */}
            {/* MENÚ PARA CLIENTES */}
            {/* ============================================ */}
            {userIsCustomer && !userIsAdmin && (
              <>
                {renderGroup('Mi Portal', 'bi-person-badge', myPortalOpen, setMyPortalOpen, myPortalLinks)}

                {/* Link directo a catálogo */}
                <li className={styles.navItem}>
                  <button
                    onClick={() => navigation.push('/productos')}
                    className={styles.navLink}
                  >
                    <i className={`bi bi-grid-3x3-gap ${styles.navIcon}`} aria-hidden="true"></i>
                    Ver Catálogo
                  </button>
                </li>
              </>
            )}

            {/* ============================================ */}
            {/* MENÚ PARA ADMINS */}
            {/* ============================================ */}
            {userIsAdmin && (
              <>
                {/* Grupos principales (en orden de uso frecuente) */}
                {renderGroup('Page Builder', 'bi-brush', pageBuilderOpen, setPageBuilderOpen, pageBuilderLinks)}
                {renderGroup('Roles y Permisos', 'bi-shield-fill-check', rcrudOpen, setRcrudOpen, rcrudLinks)}

                {/* Módulos operativos */}
                {renderGroup('Productos', 'bi-box-seam', productsOpen, setProductsOpen, productsLinks)}
                {renderGroup('Inventario', 'bi-archive', inventoryOpen, setInventoryOpen, inventoryLinks)}
                {renderGroup('Contactos', 'bi-person-rolodex', contactsOpen, setContactsOpen, contactsLinks)}
                {renderGroup('Cotizaciones', 'bi-file-earmark-text', quotesOpen, setQuotesOpen, quotesLinks)}
                {renderGroup('Ventas', 'bi-cart-check', salesOpen, setSalesOpen, salesLinks)}
                {renderGroup('Compras', 'bi-cart-plus', purchaseOpen, setPurchaseOpen, purchaseLinks)}

                {/* Módulos financieros */}
                {renderGroup('Finanzas', 'bi-cash-stack', financeOpen, setFinanceOpen, financeLinks)}
                {renderGroup('Contabilidad', 'bi-calculator', accountingOpen, setAccountingOpen, accountingLinks)}
                {renderGroup('Reportes', 'bi-file-earmark-bar-graph', reportsOpen, setReportsOpen, reportsLinks)}
                {renderGroup('Facturación CFDI', 'bi-receipt-cutoff', billingOpen, setBillingOpen, billingLinks)}

                {/* Módulos de cliente */}
                {renderGroup('CRM', 'bi-bar-chart-line', crmOpen, setCrmOpen, crmLinks)}
                {renderGroup('Catálogo Público', 'bi-grid-3x3-gap', catalogOpen, setCatalogOpen, catalogLinks)}
                {renderGroup('E-commerce', 'bi-shop', ecommerceOpen, setEcommerceOpen, ecommerceLinks)}

                {/* Módulos de gestión */}
                {renderGroup('Recursos Humanos', 'bi-people-fill', hrOpen, setHrOpen, hrLinks)}

                {/* Configuración */}
                {renderGroup('Configuración', 'bi-sliders', settingsOpen, setSettingsOpen, settingsLinks)}

                {/* Sistema y administración */}
                {renderGroup('Sistema', 'bi-gear-wide-connected', systemOpen, setSystemOpen, systemLinks)}

                {/* Separador */}
                <li className={styles.navItem} style={{ margin: '16px 0', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '16px' }}>
                  <div style={{ padding: '0 16px', color: '#6c757d', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Próximamente
                  </div>
                </li>

                {/* Módulos deshabilitados */}
                {disabledModules.map(renderDisabledModule)}
              </>
            )}

            {/* Usuario sin rol definido (fallback) */}
            {!userIsAdmin && !userIsCustomer && user && (
              <li className={styles.navItem}>
                <div style={{ padding: '16px', color: '#6c757d', fontSize: '13px' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Contacta al administrador para obtener acceso a más funciones.
                </div>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  )
}
