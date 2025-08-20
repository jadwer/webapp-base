'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Input } from '@/ui/components/base'
import styles from './Header.module.scss'
import type { NavigationItem } from '../../types'

// Base navigation items (fixed pages)
const baseNavigationItems: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Roadmap Financiero', href: '/roadmap-financiero' }
]

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [dynamicPages, setDynamicPages] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener páginas dinámicas disponibles
  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/v1/pages?filter[status]=published')
        
        // Si el endpoint no existe (404), usar páginas conocidas que existen
        if (response.status === 404) {
          console.warn('Pages API not available, using fallback pages')
          setDynamicPages([
            { label: 'Nosotros', href: '/p/nosotros' }
          ])
          return
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('API returned non-JSON response, using base navigation only')
          setDynamicPages([])
          return
        }
        
        const data = await response.json()
        
        if (data.data) {
          const pages = data.data.map((page: any) => ({
            label: page.attributes.title,
            href: `/p/${page.attributes.slug}`
          }))
          setDynamicPages(pages)
        } else {
          setDynamicPages([])
        }
      } catch (fetchError) {
        console.warn('Error fetching pages (graceful fallback):', fetchError)
        // No establecer error en UI, solo usar navegación base
        setDynamicPages([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages()
  }, [])

  // Combinar navegación base con páginas dinámicas
  const navigationItems: NavigationItem[] = [
    ...baseNavigationItems,
    ...dynamicPages
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <header className={styles.header}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <span className={styles.topBarText}>
                Distribuidora de reactivos y material de laboratorio
              </span>
            </div>
            <div className="col-md-6 text-end">
              <div className={styles.topBarActions}>
                <span className={styles.topBarText}>Profesional</span>
                <span className={styles.separator}>•</span>
                <span className={styles.topBarText}>Empresas</span>
                <span className={styles.separator}>•</span>
                <span className={styles.topBarText}>Gobierno</span>
                <Button 
                  variant="primary" 
                  size="small"
                  className={styles.loginButton}
                >
                  <i className="bi bi-person" />
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className={styles.mainHeader}>
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-lg-3">
              <Link href="/" className={styles.logo}>
                <div className={styles.logoContainer}>
                  <div className={styles.logoIcon}>
                    <span className={styles.logoLetter}>W</span>
                  </div>
                  <div className={styles.logoText}>
                    <div className={styles.logoTitle}>LABOR WASSER</div>
                    <div className={styles.logoSubtitle}>DE MÉXICO</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Search */}
            <div className="col-lg-6">
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className="input-group">
                  <Input
                    type="text"
                    placeholder="Encuentra tu reactivo por producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <Button 
                    type="submit" 
                    variant="success"
                    className={styles.searchButton}
                  >
                    <i className="bi bi-search" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Cart & User */}
            <div className="col-lg-3 text-end">
              <div className={styles.headerActions}>
                <Button 
                  variant="secondary"
                  buttonStyle="outline"
                  className={styles.actionButton}
                >
                  <i className="bi bi-cart" />
                  <span className={styles.cartCount}>0</span>
                </Button>
                <Button 
                  variant="secondary"
                  buttonStyle="outline"
                  className={styles.actionButton}
                >
                  <i className="bi bi-person" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.navigation}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className={styles.navContent}>
                {/* Mobile menu button */}
                <Button
                  variant="secondary"
                  buttonStyle="ghost"
                  className={`${styles.mobileMenuButton} d-lg-none`}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <i className={`bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`} />
                </Button>

                {/* Navigation items */}
                <ul className={`${styles.navItems} ${isMenuOpen ? styles.navItemsOpen : ''}`}>
                  {navigationItems.map((item) => (
                    <li key={item.href} className={styles.navItem}>
                      <Link href={item.href} className={styles.navLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  {isLoading && (
                    <li className={styles.navItem}>
                      <span className={styles.navLink}>
                        <i className="bi bi-three-dots" />
                      </span>
                    </li>
                  )}
                  {error && (
                    <li className={styles.navItem}>
                      <span className={styles.navLink} title="Error al cargar páginas dinámicas">
                        <i className="bi bi-exclamation-triangle text-warning" />
                      </span>
                    </li>
                  )}
                </ul>

                {/* Contact info */}
                <div className={styles.contactInfo}>
                  <i className="bi bi-telephone" />
                  <span>01 55 5762 1412</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}