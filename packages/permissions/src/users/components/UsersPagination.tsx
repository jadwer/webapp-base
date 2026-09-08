'use client'

/**
 * Paginacion server-side del sub-modulo users.
 * Mismo patron que PaginationSimple de @lwm/contacts.
 */

import React from 'react'

interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  totalItems?: number
  pageSize?: number
  className?: string
}

export const UsersPagination: React.FC<UsersPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  totalItems,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null
  }

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null

  const getPageNumbers = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: Array<number | '...'> = []

    range.push(1)
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    if (totalPages > 1) {
      range.push(totalPages)
    }

    let last: number | undefined
    for (const i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1)
        } else if (i - last !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      last = i
    }

    return rangeWithDots
  }

  return (
    <div className={`d-flex justify-content-between align-items-center p-3 border-top ${className}`}>
      <div className="text-muted small">
        {totalItems && pageSize ? (
          <>Mostrando {startItem} - {endItem} de {totalItems.toLocaleString()} usuarios</>
        ) : (
          <>Página {currentPage} de {totalPages}</>
        )}
      </div>

      <div className="d-flex align-items-center gap-1">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          title="Página anterior"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 text-muted">
                …
              </span>
            )
          }

          const isActive = page === currentPage
          return (
            <button
              key={page}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
            >
              {page}
            </button>
          )
        })}

        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          title="Página siguiente"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {isLoading && (
        <div className="text-muted small d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          Cargando...
        </div>
      )}
    </div>
  )
}
