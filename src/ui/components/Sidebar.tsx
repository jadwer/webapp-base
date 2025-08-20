'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import NavigationProgress from './NavigationProgress'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import styles from '@/ui/styles/modules/Sidebar.module.scss'

const links = [
  { href: '/dashboard', label: 'Panel Principal', icon: 'bi-house' },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: 'bi-person-circle' },
  { href: '/dashboard/design-system', label: 'Design System', icon: 'bi-palette' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'bi-people' }
]
const pageBuilderLinks = [
  { href: '/dashboard/pages', label: 'Gestión de Páginas', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/pages/templates', label: 'Galería de Templates', icon: 'bi-layout-text-window-reverse' }
]

const rcrudLinks = [
  { href: '/dashboard/permission-manager', label: 'Permission Manager', icon: 'bi-layout-text-window-reverse' }, // Usando el ícono del Page Builder
  { href: '/dashboard/roles', label: 'Roles', icon: 'bi-person-badge' },
  { href: '/dashboard/permissions', label: 'Permisos', icon: 'bi-shield-lock' }
]

const contactsLinks = [
  { href: '/dashboard/contacts', label: 'Gestión', icon: 'bi-person-lines-fill' },
  { href: '/dashboard/contacts/customers', label: 'Clientes', icon: 'bi-person-check' },
  { href: '/dashboard/contacts/suppliers', label: 'Proveedores', icon: 'bi-building' },
  { href: '/dashboard/contacts/create', label: 'Crear Contacto', icon: 'bi-person-plus' }
]

const productsLinks = [
  { href: '/dashboard/products', label: 'Productos', icon: 'bi-box-seam' },
  { href: '/dashboard/products/categories', label: 'Categorías', icon: 'bi-tags' },
  { href: '/dashboard/products/brands', label: 'Marcas', icon: 'bi-award' },
  { href: '/dashboard/products/units', label: 'Unidades', icon: 'bi-rulers' }
]

const inventoryLinks = [
  { href: '/dashboard/inventory', label: 'Dashboard', icon: 'bi-speedometer2' },
  { href: '/dashboard/inventory/warehouses', label: 'Almacenes', icon: 'bi-building' },
  { href: '/dashboard/inventory/locations', label: 'Ubicaciones', icon: 'bi-geo-alt' },
  { href: '/dashboard/inventory/stock', label: 'Control de Stock', icon: 'bi-boxes' },
  { href: '/dashboard/inventory/movements', label: 'Movimientos', icon: 'bi-arrow-left-right' },
  { href: '/dashboard/inventory/product-batch', label: 'Lotes de Productos', icon: 'bi-calendar-check' }
]

const salesLinks = [
  { href: '/dashboard/sales', label: 'Órdenes de Venta', icon: 'bi-cart-check' },
  { href: '/dashboard/sales/create', label: 'Nueva Orden', icon: 'bi-plus-circle' },
  { href: '/dashboard/sales/reports', label: 'Reportes', icon: 'bi-graph-up' },
  { href: '/dashboard/sales/customers', label: 'Clientes', icon: 'bi-person-heart' }
]

const purchaseLinks = [
  { href: '/dashboard/purchase', label: 'Órdenes de Compra', icon: 'bi-cart-plus' },
  { href: '/dashboard/purchase/create', label: 'Nueva Orden', icon: 'bi-plus-circle' },
  { href: '/dashboard/purchase/reports', label: 'Reportes', icon: 'bi-graph-up' },
  { href: '/dashboard/purchase/suppliers', label: 'Proveedores', icon: 'bi-building' }
]

const financeLinks = [
  { href: '/dashboard/finance/ap-invoices', label: 'Facturas por Pagar', icon: 'bi-receipt' },
  { href: '/dashboard/finance/ar-invoices', label: 'Facturas por Cobrar', icon: 'bi-receipt-cutoff' },
  { href: '/dashboard/finance/ap-payments', label: 'Pagos AP', icon: 'bi-credit-card' },
  { href: '/dashboard/finance/ar-receipts', label: 'Recibos de Clientes', icon: 'bi-cash-coin' },
  { href: '/dashboard/finance/bank-accounts', label: 'Cuentas Bancarias', icon: 'bi-bank' }
]

const accountingLinks = [
  { href: '/dashboard/accounting/accounts', label: 'Plan Contable', icon: 'bi-list-ol' },
  { href: '/dashboard/accounting/journal-entries', label: 'Asientos Contables', icon: 'bi-journal-text' },
  { href: '/dashboard/accounting/fiscal-periods', label: 'Períodos Fiscales', icon: 'bi-calendar-range' },
  { href: '/dashboard/accounting/reports/balance-general', label: 'Balance General', icon: 'bi-clipboard-data' },
  { href: '/dashboard/accounting/reports/estado-resultados', label: 'Estado de Resultados', icon: 'bi-graph-up-arrow' },
  { href: '/dashboard/accounting/reports/balanza-comprobacion', label: 'Balanza de Comprobación', icon: 'bi-balance-scale' },
  { href: '/dashboard/accounting/reports/libro-diario', label: 'Libro Diario', icon: 'bi-journal-text' },
  { href: '/dashboard/accounting/reports/libro-mayor', label: 'Libro Mayor', icon: 'bi-book' },
  { href: '/dashboard/sales/reports', label: 'Reportes de Ventas', icon: 'bi-graph-up' },
  { href: '/dashboard/purchase/reports', label: 'Reportes de Compras', icon: 'bi-truck' },
  { href: '/dashboard/accounting/reports', label: 'Todos los Reportes', icon: 'bi-collection' }
]

const catalogLinks = [
  { href: '/dashboard/catalog', label: 'Gestión', icon: 'bi-grid-3x3-gap' },
  { href: '/dashboard/catalog/featured', label: 'Productos Destacados', icon: 'bi-star' },
  { href: '/dashboard/catalog/offers', label: 'Ofertas', icon: 'bi-percent' },
  { href: '/dashboard/catalog/settings', label: 'Configuración', icon: 'bi-gear' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const navigation = useNavigationProgress()
  const [open, setOpen] = useState(false)
  const [rcrudOpen, setRcrudOpen] = useState(
    pathname?.startsWith('/dashboard/permission-manager') || 
    pathname?.startsWith('/dashboard/roles') || 
    pathname?.startsWith('/dashboard/permissions')
  )
  const [contactsOpen, setContactsOpen] = useState(
    pathname?.startsWith('/dashboard/contacts')
  )
  const [productsOpen, setProductsOpen] = useState(
    pathname?.startsWith('/dashboard/products')
  )
  const [inventoryOpen, setInventoryOpen] = useState(
    pathname?.startsWith('/dashboard/inventory')
  )
  const [pageBuilderOpen, setPageBuilderOpen] = useState(
    pathname?.startsWith('/dashboard/pages') || 
    pathname?.startsWith('/dashboard/page-builder')
  )
  const [salesOpen, setSalesOpen] = useState(
    pathname?.startsWith('/dashboard/sales')
  )
  const [purchaseOpen, setPurchaseOpen] = useState(
    pathname?.startsWith('/dashboard/purchase')
  )
  const [financeOpen, setFinanceOpen] = useState(
    pathname?.startsWith('/dashboard/finance')
  )
  const [accountingOpen, setAccountingOpen] = useState(
    pathname?.startsWith('/dashboard/accounting')
  )
  const [catalogOpen, setCatalogOpen] = useState(
    pathname?.startsWith('/dashboard/catalog')
  )

  return (
    <>
      {/* Navigation Progress */}
      <NavigationProgress />
      
      {/* Botón toggle en pantallas pequeñas */}
      <button
        className={styles.toggleButton}
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Overlay para móvil */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <h6 className={styles.title}>Menú</h6>
        </div>
        
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
          {/* Enlaces simples */}
          {links.map(({ href, label, icon }) => (
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
          
          {/* Grupo Page Builder */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                pageBuilderOpen ? styles.groupActive : ''
              }`}
              onClick={() => setPageBuilderOpen(!pageBuilderOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-brush" aria-hidden="true"></i>
                Page Builder
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                pageBuilderOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              pageBuilderOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {pageBuilderLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo RCRUD */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                rcrudOpen ? styles.groupActive : ''
              }`}
              onClick={() => setRcrudOpen(!rcrudOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-shield-fill-check" aria-hidden="true"></i>
                Permission Manager
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                rcrudOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              rcrudOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {rcrudLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Productos */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                productsOpen ? styles.groupActive : ''
              }`}
              onClick={() => setProductsOpen(!productsOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-box-seam" aria-hidden="true"></i>
                Productos
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                productsOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              productsOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {productsLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Contactos */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                contactsOpen ? styles.groupActive : ''
              }`}
              onClick={() => setContactsOpen(!contactsOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-person-rolodex" aria-hidden="true"></i>
                Contactos
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                contactsOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              contactsOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {contactsLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Inventario */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                inventoryOpen ? styles.groupActive : ''
              }`}
              onClick={() => setInventoryOpen(!inventoryOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-archive" aria-hidden="true"></i>
                Inventario
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                inventoryOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              inventoryOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {inventoryLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Ventas */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                salesOpen ? styles.groupActive : ''
              }`}
              onClick={() => setSalesOpen(!salesOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-cart-check" aria-hidden="true"></i>
                Ventas
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                salesOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              salesOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {salesLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Compras */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                purchaseOpen ? styles.groupActive : ''
              }`}
              onClick={() => setPurchaseOpen(!purchaseOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-cart-plus" aria-hidden="true"></i>
                Compras
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                purchaseOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              purchaseOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {purchaseLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Finance */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                financeOpen ? styles.groupActive : ''
              }`}
              onClick={() => setFinanceOpen(!financeOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-cash-stack" aria-hidden="true"></i>
                Finanzas
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                financeOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              financeOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {financeLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Accounting */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                accountingOpen ? styles.groupActive : ''
              }`}
              onClick={() => setAccountingOpen(!accountingOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-calculator" aria-hidden="true"></i>
                Contabilidad
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                accountingOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              accountingOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {accountingLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Grupo Catálogo Público */}
          <li className={styles.navItem}>
            <button
              className={`${styles.groupButton} ${
                catalogOpen ? styles.groupActive : ''
              }`}
              onClick={() => setCatalogOpen(!catalogOpen)}
            >
              <div className={styles.groupContent}>
                <i className="bi bi-grid-3x3-gap" aria-hidden="true"></i>
                Catálogo Público
              </div>
              <i className={`bi bi-chevron-right ${styles.groupChevron} ${
                catalogOpen ? styles.expanded : ''
              }`}></i>
            </button>
            
            {/* Submenú */}
            <div className={`${styles.subMenu} ${
              catalogOpen ? styles.expanded : styles.collapsed
            }`}>
              <ul className={styles.subNavList}>
                {catalogLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <button
                      onClick={() => navigation.push(href)}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
        </nav>
      </aside>
    </>
  )
}
