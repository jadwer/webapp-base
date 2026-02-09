'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocalCartCount } from '@/modules/public-catalog'
import { useAuth } from '@/modules/auth'
import { ContactOffcanvas } from '../ContactOffcanvas/ContactOffcanvas'

export const Header: React.FC = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const cartItemCount = useLocalCartCount()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
  }

  // Get user display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuario'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/productos/todos')
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="d-none d-lg-block">
        <div className="container py-3">
          <div className="row d-flex align-items-center">
            <div className="col-6 col-md-4 d-flex">
              <Link href="/">
                <img
                  className="img-fluid logo"
                  alt="Labor Wasser de Mexico"
                  src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
                />
              </Link>
            </div>
            <div className="col-6 col-md-8 d-flex justify-content-end align-items-center">
              <div className="input-group my-1">
                <form id="homeSearch" className="d-block w-100" onSubmit={handleSearch}>
                  <div className="row">
                    <div className="col-8">
                      <input
                        type="text"
                        id="searchNavProduct"
                        className="form-control"
                        placeholder="Introduzca el nombre del producto"
                        name="homeSearch"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="col-4">
                      <button
                        className="btn btn-primary w-100"
                        type="submit"
                        id="button-addon1"
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Cart Icon */}
              <Link href="/cart" className="btn btn-link position-relative mx-2 header-icon">
                <i className="bi bi-cart3" style={{ fontSize: '1.5rem' }}></i>
                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu / Login Button */}
              {isLoading ? (
                <div className="btn btn-outline-primary d-flex align-items-center me-2" style={{ whiteSpace: 'nowrap' }}>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                </div>
              ) : isAuthenticated ? (
                <div className="dropdown me-2" ref={dropdownRef}>
                  <button
                    className="btn btn-outline-primary d-flex align-items-center dropdown-toggle"
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-expanded={dropdownOpen}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {displayName}
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end${dropdownOpen ? ' show' : ''}`}>
                    <li>
                      <Link
                        href="/dashboard"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/profile"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-person me-2"></i>
                        Mi Perfil
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn btn-outline-primary d-flex align-items-center me-2"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <i className="bi bi-person me-1"></i>
                  Iniciar Sesión
                </Link>
              )}

              <button
                type="button"
                className="burger btn btn-primary me-3"
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
              >
                <img
                  src="/images/laborwasser/labor-wasser-contacto.svg"
                  className="contact-head"
                  alt="Labor Wasser Mexico - Contacto"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="d-block d-lg-none">
        <div className="container-fluid py-3 border-bottom">
          <div className="row d-flex align-items-center">
            <div className="col-8 d-flex">
              <Link href="/">
                <img
                  className="img-fluid logo"
                  alt="Labor Wasser de Mexico"
                  src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
                />
              </Link>
            </div>
            <div className="col-4 d-flex justify-content-end align-items-center">
              {/* User Menu / Login Icon Mobile */}
              {isLoading ? (
                <span className="btn btn-link header-icon">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </span>
              ) : isAuthenticated ? (
                <div className="dropdown">
                  <button
                    className="btn btn-link dropdown-toggle p-1 header-icon"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle" style={{ fontSize: '1.3rem' }}></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li className="dropdown-header text-muted small">{displayName}</li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link href="/dashboard" className="dropdown-item">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/profile" className="dropdown-item">
                        <i className="bi bi-person me-2"></i>
                        Mi Perfil
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link href="/auth/login" className="btn btn-link header-icon">
                  <i className="bi bi-person" style={{ fontSize: '1.3rem' }}></i>
                </Link>
              )}

              {/* Cart Icon Mobile */}
              <Link href="/cart" className="btn btn-link position-relative header-icon">
                <i className="bi bi-cart3" style={{ fontSize: '1.3rem' }}></i>
                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                className="burger btn btn-primary me-3"
                data-bs-toggle="offcanvas"
                data-bs-target="#navMenu"
              >
                <img
                  src="/images/laborwasser/labor-wasser-contacto.svg"
                  className="contact-head"
                  alt="Labor Wasser Mexico - Contacto"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="my-1 px-2">
          <form id="homeSearchMobile" onSubmit={handleSearch}>
            <div className="row">
              <div className="col-8">
                <input
                  type="text"
                  id="searchNavProductMobile"
                  className="form-control"
                  placeholder="Introduzca el nombre del producto"
                  name="homeSearch"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-4">
                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  id="button-addon1-mobile"
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
      </header>

      {/* WhatsApp Widget */}
      <a
        href="https://wa.me/5215610400441?text=Hola!%20%C2%BFC%C3%B3mo%20%20podemos%20ayudarte%3F"
        className="whatsapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="bi bi-whatsapp"></i>
      </a>

      {/* Contact Offcanvas */}
      <ContactOffcanvas />
    </>
  )
}
