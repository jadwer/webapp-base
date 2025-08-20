/**
 * PAGINATION SIMPLE COMPONENT
 * Simple pagination component for Finance module following inventory pattern
 */

'use client'

import React from 'react'

interface PaginationSimpleProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export const PaginationSimple = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5
}: PaginationSimpleProps) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const visiblePages = getVisiblePages()

  return (
    <nav aria-label="Pagination">
      <ul className="pagination justify-content-center mb-0">
        {/* Previous button */}
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>

        {/* First page if not visible */}
        {visiblePages[0] > 1 && (
          <>
            <li className="page-item">
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
            </li>
            {visiblePages[0] > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}

        {/* Visible page numbers */}
        {visiblePages.map((page) => (
          <li
            key={page}
            className={`page-item ${currentPage === page ? 'active' : ''}`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Last page if not visible */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next button */}
        <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Página siguiente"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>

      {/* Page info */}
      <div className="text-center text-muted mt-2 small">
        Página {currentPage} de {totalPages}
      </div>
    </nav>
  )
}