'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { useCategories } from '@/modules/products/hooks/useCategories'

export const TopNav: React.FC = () => {
  const { isAuthenticated } = useAuth()
  // Categories endpoint requires auth - only fetch when authenticated
  const { categories, isLoading } = useCategories({
    page: { size: 50 },
    sort: { field: 'name', direction: 'asc' },
    enabled: isAuthenticated,
  })

  return (
    <nav className="navbar navbar-expand-lg lwm-topnav">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#lwmTopNavContent"
          aria-controls="lwmTopNavContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className="collapse navbar-collapse" id="lwmTopNavContent">
          <ul className="navbar-nav ms-auto">
            {/* Productos dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Productos
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/productos">
                    Todos los productos
                  </Link>
                </li>
                {isLoading ? (
                  <li>
                    <span className="dropdown-item text-muted">Cargando...</span>
                  </li>
                ) : (
                  categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        className="dropdown-item"
                        href={`/productos?categoryId=${category.id}`}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </li>

            {/* Nosotros */}
            <li className="nav-item">
              <Link className="nav-link" href="/nosotros">
                Nosotros
              </Link>
            </li>

            {/* Recursos dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Recursos
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/catalogos">
                    Catalogos
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/certificados">
                    Certificados
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/precios">
                    Lista de precios
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
