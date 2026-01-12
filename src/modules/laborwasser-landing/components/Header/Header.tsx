'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocalCartCount } from '@/modules/public-catalog'
import styles from './Header.module.scss'

export const Header: React.FC = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartItemCount = useLocalCartCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleWhatsApp = () => {
    window.open('https://wa.me/525557621412', '_blank', 'noopener,noreferrer')
  }

  return (
    <header className={styles.header}>
      {/* Desktop Header */}
      <div className={`${styles.desktopHeader} d-none d-lg-block`}>
        <div className="container">
          <div className="row align-items-center py-3">
            {/* Logo */}
            <div className="col-lg-3">
              <Link href="/" className={styles.logo}>
                <Image
                  src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
                  alt="Labor Wasser de Mexico"
                  width={200}
                  height={60}
                  className={styles.logoImage}
                  priority
                />
              </Link>
            </div>

            {/* Search */}
            <div className="col-lg-6">
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-search" />
                  </button>
                </div>
              </form>
            </div>

            {/* Cart and Contact */}
            <div className="col-lg-3 text-end d-flex align-items-center justify-content-end gap-3">
              <Link href="/cart" className={styles.cartButton}>
                <i className="bi bi-cart3" />
                {cartItemCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemCount}</span>
                )}
              </Link>
              <button
                type="button"
                className={styles.contactBtn}
                onClick={handleWhatsApp}
              >
                <i className="bi bi-whatsapp me-2" />
                Contactanos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className={`${styles.mobileHeader} d-lg-none`}>
        <div className="container">
          <div className="row align-items-center py-2">
            <div className="col-8">
              <Link href="/" className={styles.logo}>
                <Image
                  src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
                  alt="Labor Wasser de Mexico"
                  width={160}
                  height={48}
                  className={styles.logoImage}
                  priority
                />
              </Link>
            </div>
            <div className="col-4 text-end">
              <button
                type="button"
                className={styles.menuToggle}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className={styles.mobileMenu}>
              <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-search" />
                  </button>
                </div>
              </form>

              <nav className={styles.mobileNav}>
                <Link href="/" className={styles.mobileNavLink}>
                  Inicio
                </Link>
                <Link href="/productos" className={styles.mobileNavLink}>
                  Productos
                </Link>
                <Link href="/cart" className={styles.mobileNavLink}>
                  <i className="bi bi-cart3 me-2" />
                  Carrito
                  {cartItemCount > 0 && (
                    <span className={styles.mobileCartBadge}>{cartItemCount}</span>
                  )}
                </Link>
                <Link href="/contacto" className={styles.mobileNavLink}>
                  Contacto
                </Link>
              </nav>

              <button
                type="button"
                className={styles.mobileWhatsApp}
                onClick={handleWhatsApp}
              >
                <i className="bi bi-whatsapp me-2" />
                WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <button
        type="button"
        className={styles.floatingWhatsApp}
        onClick={handleWhatsApp}
        aria-label="Contactar por WhatsApp"
      >
        <i className="bi bi-whatsapp" />
      </button>
    </header>
  )
}
