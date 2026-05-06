/**
 * PAGINATION SIMPLE - CONTACTS
 * Componente de paginación simple y reutilizable
 * Copiado del patrón exitoso de Inventory
 */

'use client'

import React from 'react'

interface PaginationSimpleProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  totalItems?: number
  pageSize?: number
  className?: string
}

export const PaginationSimple: React.FC<PaginationSimpleProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  totalItems,
  pageSize,
  className = ''
}) => {
  // Don't render if only 1 page
  if (totalPages <= 1) {
    return null
  }

  // Calculate displayed items info
  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2 // Pages to show around current page
    const range = []
    const rangeWithDots = []

    // Always include first page
    range.push(1)

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    // Always include last page if more than 1 page
    if (totalPages > 1) {
      range.push(totalPages)
    }

    let l
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`d-flex justify-content-between align-items-center p-3 border-top ${className}`}>
      {/* Items info */}
      <div className="text-muted small">
        {totalItems && pageSize && (
          <>
            Mostrando {startItem} - {endItem} de {totalItems.toLocaleString()} contactos
          </>
        )}
        {!totalItems && (
          <>
            Página {currentPage} de {totalPages}
          </>
        )}
      </div>

      {/* Pagination controls */}
      <div className="d-flex align-items-center gap-1">
        {/* Previous button */}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          title="Página anterior"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 text-muted">
                …
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <button
              key={pageNum}
              className={`btn btn-sm ${
                isActive 
                  ? 'btn-primary' 
                  : 'btn-outline-secondary'
              }`}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </button>
          )
        })}

        {/* Next button */}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          title="Página siguiente"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-muted small d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          Cargando...
        </div>
      )}
    </div>
  )
}