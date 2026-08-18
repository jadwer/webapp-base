'use client'

/**
 * HEADER (rediseno 2026-08)
 *
 * Un solo bloque blanco con esquinas inferiores redondeadas sobre el hero:
 *   fila 1: logo | buscador pill | Iniciar sesion (outline) | Necesitas ayuda?
 *           (solido, abre el offcanvas de contacto) | carrito
 *   fila 2: nav centrado: Inicio | Productos v | Nosotros | Certificados/SDS
 *           (item activo con subrayado azul)
 * En movil: logo + iconos + hamburguesa; el buscador queda visible debajo y
 * el nav se despliega en lista.
 *
 * Absorbe al TopNav legado (que solo tenia el nav) para que el bloque sea uno.
 * Se conservan: sesion (dropdown de usuario), contador del carrito, widget de
 * WhatsApp (decision de Gabino: se queda) y el ContactOffcanvas.
 */

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocalCartCount, ProductSearchBox, usePublicCategories } from '@lwm/ecommerce'
import { useAuth } from '@lwm/auth'
import { useIsClient } from '@/hooks/useIsClient'
import { usePublicSettings } from '@lwm/app-config'
import { ContactOffcanvas } from '../ContactOffcanvas/ContactOffcanvas'
import styles from './Header.module.scss'

export const Header: React.FC = () => {
  const cartItemCount = useLocalCartCount()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const isClient = useIsClient()
  const { get } = usePublicSettings()
  const pathname = usePathname()
  const { categories, isLoading: categoriesLoading } = usePublicCategories({ limit: 50 })

  const logoSrc = get('company.logo_path_alt') || '/images/laborwasser/labor-wasser-mexico-logo2.webp'
  const companyName = get('company.name') || 'Labor Wasser de Mexico'
  const whatsappNumber = get('company.whatsapp_number')

  const [userOpen, setUserOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Cerrar el menu movil al navegar
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = async () => {
    setUserOpen(false)
    await logout()
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuario'
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href))

  const userMenu = (
    <ul className={`dropdown-menu dropdown-menu-end${userOpen ? ' show' : ''}`}>
      <li><span className="dropdown-header text-muted small">{displayName}</span></li>
      <li><hr className="dropdown-divider" /></li>
      <li>
        <Link href="/dashboard" className="dropdown-item" onClick={() => setUserOpen(false)}>
          <i className="bi bi-speedometer2 me-2" />Dashboard
        </Link>
      </li>
      <li>
        <Link href="/dashboard/profile" className="dropdown-item" onClick={() => setUserOpen(false)}>
          <i className="bi bi-person me-2" />Mi perfil
        </Link>
      </li>
      <li><hr className="dropdown-divider" /></li>
      <li>
        <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2" />Cerrar sesion
        </button>
      </li>
    </ul>
  )

  const sessionControl = (compact: boolean) => {
    if (!isClient || isLoading) {
      return (
        <span className={`btn lw-btn lw-btn-accent-outline ${styles.sessionBtn}`} aria-busy="true">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        </span>
      )
    }
    if (isAuthenticated) {
      return (
        <div className="dropdown" ref={compact ? undefined : userRef}>
          <button
            type="button"
            className={compact ? `btn ${styles.iconBtn}` : `btn lw-btn lw-btn-accent-outline dropdown-toggle ${styles.sessionBtn}`}
            onClick={() => setUserOpen((v) => !v)}
            aria-expanded={userOpen}
            aria-label={compact ? 'Mi cuenta' : undefined}
          >
            <i className={`bi bi-person-circle${compact ? '' : ' me-1'}`} aria-hidden="true" />
            {!compact && displayName}
          </button>
          {userMenu}
        </div>
      )
    }
    return compact ? (
      <Link href="/auth/login" className={`btn ${styles.iconBtn}`} aria-label="Iniciar sesion">
        <i className="bi bi-person" aria-hidden="true" />
      </Link>
    ) : (
      <Link href="/auth/login" className={`btn lw-btn lw-btn-accent-outline ${styles.sessionBtn}`}>
        Iniciar sesion
      </Link>
    )
  }

  const cartLink = (
    <Link href="/cart" className={`btn ${styles.iconBtn} ${styles.cart}`} aria-label={`Carrito, ${cartItemCount} articulos`}>
      <i className="bi bi-cart3" aria-hidden="true" />
      {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
    </Link>
  )

  const navItems = (
    <>
      <li className={styles.navItem}>
        <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.navActive : ''}`}>Inicio</Link>
      </li>
      <li className={`${styles.navItem} dropdown`}>
        <a
          href="#"
          className={`${styles.navLink} dropdown-toggle ${isActive('/productos') ? styles.navActive : ''}`}
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Productos
        </a>
        <ul className={`dropdown-menu ${styles.dropdown}`}>
          <li><Link className="dropdown-item" href="/productos">Todos los productos</Link></li>
          {categoriesLoading ? (
            <li><span className="dropdown-item text-muted">Cargando...</span></li>
          ) : (
            categories.map((c) => (
              <li key={c.id}>
                <Link className="dropdown-item" href={`/productos?categoryId=${c.id}`}>{c.name}</Link>
              </li>
            ))
          )}
        </ul>
      </li>
      <li className={styles.navItem}>
        <Link href="/nosotros" className={`${styles.navLink} ${isActive('/nosotros') ? styles.navActive : ''}`}>Nosotros</Link>
      </li>
      <li className={styles.navItem}>
        <Link href="/certificados" className={`${styles.navLink} ${isActive('/certificados') ? styles.navActive : ''}`}>Certificados/SDS</Link>
      </li>
    </>
  )

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          {/* Fila 1 */}
          <div className={styles.top}>
            <Link href="/" className={styles.logoLink} aria-label={companyName}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt={companyName} className={styles.logo} />
            </Link>

            <div className={`${styles.search} d-none d-lg-block`}>
              <ProductSearchBox placeholder="Buscar producto..." className={styles.searchBox} />
            </div>

            <div className={`${styles.actions} d-none d-lg-flex`}>
              {sessionControl(false)}
              <button
                type="button"
                className={`btn lw-btn lw-btn-accent ${styles.helpBtn}`}
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
              >
                ¿Necesitas ayuda?
              </button>
              {cartLink}
            </div>

            {/* Movil: iconos + hamburguesa */}
            <div className={`${styles.actionsMobile} d-flex d-lg-none`}>
              {sessionControl(true)}
              {cartLink}
              <button
                type="button"
                className={`btn ${styles.iconBtn}`}
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
                aria-label="Contacto"
              >
                <i className="bi bi-headset" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`btn ${styles.iconBtn}`}
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="lwmMobileNav"
                aria-label="Menu"
              >
                <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Buscador movil, siempre visible */}
          <div className={`${styles.searchMobile} d-lg-none`}>
            <ProductSearchBox placeholder="Buscar producto..." className={styles.searchBox} />
          </div>

          {/* Fila 2: nav */}
          <nav className={`${styles.nav} d-none d-lg-block`} aria-label="Principal">
            <ul className={styles.navList}>{navItems}</ul>
          </nav>
          <nav
            id="lwmMobileNav"
            className={`${styles.navMobile} d-lg-none ${mobileOpen ? styles.navMobileOpen : ''}`}
            aria-label="Principal"
          >
            <ul className={styles.navListMobile}>{navItems}</ul>
          </nav>
        </div>
      </header>

      {/* WhatsApp: se conserva (decision 2026-08-18) */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hola!%20%C2%BFC%C3%B3mo%20%20podemos%20ayudarte%3F`}
          className="whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <i className="bi bi-whatsapp" />
        </a>
      )}

      <ContactOffcanvas />
    </>
  )
}
