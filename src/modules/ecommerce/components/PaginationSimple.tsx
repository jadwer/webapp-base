/**
 * PaginationSimple Component
 *
 * Simple pagination component for ecommerce orders.
 */

'use client'

import React from 'react'
import { Button } from '@/ui/components/base'

interface PaginationSimpleProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

export const PaginationSimple = React.memo<PaginationSimpleProps>(({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) {
    return null
  }

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  // Calculate showing items range
  const getShowingRange = () => {
    if (!totalItems || !itemsPerPage) return null
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)
    return `${start}-${end} de ${totalItems}`
  }

  const showingRange = getShowingRange()

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-4">
            {showingRange && (
              <p className="text-muted mb-0">
                Mostrando {showingRange} órdenes
              </p>
            )}
          </div>
          <div className="col-md-8">
            <nav aria-label="Navegación de páginas">
              <ul className="pagination pagination-sm justify-content-end mb-0">
                {/* Previous button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <Button
                    variant="secondary"
                    buttonStyle="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-link"
                  >
                    <i className="bi bi-chevron-left" />
                  </Button>
                </li>

                {/* Page numbers */}
                {visiblePages.map((page, index) => (
                  <li
                    key={index}
                    className={`page-item ${page === currentPage ? 'active' : ''} ${
                      page === '...' ? 'disabled' : ''
                    }`}
                  >
                    {page === '...' ? (
                      <span className="page-link">...</span>
                    ) : (
                      <Button
                        variant={page === currentPage ? 'primary' : 'secondary'}
                        buttonStyle={page === currentPage ? 'solid' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page as number)}
                        className="page-link"
                      >
                        {page}
                      </Button>
                    )}
                  </li>
                ))}

                {/* Next button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <Button
                    variant="secondary"
                    buttonStyle="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-link"
                  >
                    <i className="bi bi-chevron-right" />
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
})

PaginationSimple.displayName = 'PaginationSimple'
