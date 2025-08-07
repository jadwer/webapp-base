'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import NavigationProgress from './NavigationProgress'
import styles from '@/ui/styles/modules/Sidebar.module.scss'

const links = [
  { href: '/dashboard', label: 'Panel Principal', icon: 'bi-house' },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: 'bi-person-circle' },
  { href: '/dashboard/design-system', label: 'Design System', icon: 'bi-palette' },
  { href: '/dashboard/pages', label: 'Gestión de Páginas', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'bi-people' }
]

const rcrudLinks = [
  { href: '/dashboard/permission-manager', label: 'RCRUD', icon: 'bi-layout-text-window-reverse' }, // Usando el ícono del Page Builder
  { href: '/dashboard/roles', label: 'Roles', icon: 'bi-person-badge' },
  { href: '/dashboard/permissions', label: 'Permisos', icon: 'bi-shield-lock' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [rcrudOpen, setRcrudOpen] = useState(
    pathname?.startsWith('/dashboard/permission-manager') || 
    pathname?.startsWith('/dashboard/roles') || 
    pathname?.startsWith('/dashboard/permissions')
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
              <Link
                href={href}
                className={`${styles.navLink} ${
                  (pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))) ? styles.active : ''
                }`}
              >
                <i className={`bi ${icon} ${styles.navIcon}`} aria-hidden="true"></i>
                {label}
              </Link>
            </li>
          ))}
          
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
                RCRUD
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
                    <Link
                      href={href}
                      className={`${styles.subNavLink} ${
                        pathname === href ? styles.active : ''
                      }`}
                    >
                      <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                      {label}
                    </Link>
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
