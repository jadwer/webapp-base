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
        </ul>
        </nav>
      </aside>
    </>
  )
}
