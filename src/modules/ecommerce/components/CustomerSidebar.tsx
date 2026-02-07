'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useAuth } from '@/modules/auth'
import { hasAnyRole } from '@/lib/permissions'
import styles from './CustomerSidebar.module.scss'

const customerLinks = [
  { href: '/dashboard', label: 'Mi Panel', icon: 'bi-house' },
  { href: '/dashboard/my-quotes', label: 'Mis Cotizaciones', icon: 'bi-file-earmark-text' },
  { href: '/dashboard/my-orders', label: 'Mis Pedidos', icon: 'bi-bag-check' },
  { href: '/dashboard/my-cart', label: 'Mi Carrito', icon: 'bi-cart3' },
  { href: '/dashboard/profile', label: 'Mi Perfil', icon: 'bi-person-circle' },
]

export default function CustomerSidebar() {
  const pathname = usePathname()
  const navigation = useNavigationProgress()
  const { user, isLoading } = useAuth()
  const [open, setOpen] = useState(false)

  const isCustomer = hasAnyRole(user, ['customer', 'cliente'])

  // No renderizar si no esta autenticado o no es customer
  if (isLoading || !user || !isCustomer) {
    return null
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Cliente'

  const handleNavigate = (href: string) => {
    setOpen(false)
    navigation.push(href)
  }

  return (
    <>
      {/* Boton toggle */}
      <button
        className={`${styles.toggleButton} ${open ? styles.open : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Abrir mi portal"
      >
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-person-badge'}`}></i>
        {!open && <span>Mi Portal</span>}
      </button>

      {/* Overlay */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <h6 className={styles.title}>Mi Portal</h6>
          <button
            className={styles.closeButton}
            onClick={() => setOpen(false)}
            aria-label="Cerrar menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Info del usuario */}
        <div className={styles.userInfo}>
          <p className={styles.userName}>{displayName}</p>
          {user.email && <p className={styles.userEmail}>{user.email}</p>}
        </div>

        <div className={styles.separator} />

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {customerLinks.map(({ href, label, icon }) => (
              <li className={styles.navItem} key={href}>
                <button
                  onClick={() => handleNavigate(href)}
                  className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}
                >
                  <i className={`bi ${icon} ${styles.navIcon}`} aria-hidden="true"></i>
                  {label}
                </button>
              </li>
            ))}

            <div className={styles.separator} />

            {/* Link al catalogo (ya estamos en el contexto de tienda) */}
            <li className={styles.navItem}>
              <button
                onClick={() => handleNavigate('/productos')}
                className={`${styles.navLink} ${pathname?.startsWith('/productos') ? styles.active : ''}`}
              >
                <i className={`bi bi-grid-3x3-gap ${styles.navIcon}`} aria-hidden="true"></i>
                Ver Catalogo
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}
