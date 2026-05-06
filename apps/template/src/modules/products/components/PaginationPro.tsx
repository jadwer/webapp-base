'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { PaginationMeta } from '../types'

interface PaginationProProps {
  meta: PaginationMeta | undefined
  currentPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export const PaginationPro = React.memo<PaginationProProps>(({
  meta,
  currentPage,
  onPageChange,
  isLoading = false
}) => {
  if (!meta?.page || meta.page.lastPage <= 1) {
    return null
  }

  const { page } = meta
  const totalPages = page.lastPage
  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Show max 7 page buttons
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 2)
      let end = Math.min(totalPages - 1, currentPage + 2)
      
      // Adjust range if too close to edges
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 5)
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 4)
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Info */}
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <small className="text-muted">
                Mostrando <strong>{page.from}</strong> a <strong>{page.to}</strong> de{' '}
                <strong>{page.total}</strong> productos
              </small>
              <div className="vr mx-3"></div>
              <small className="text-muted">
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </small>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="col-md-6">
            <div className="d-flex justify-content-end">
              <nav aria-label="Paginación de productos">
                <div className="d-flex gap-1 align-items-center">
                  {/* First Page */}
                  <Button
                    size="small"
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={() => onPageChange(1)}
                    disabled={isFirst || isLoading}
                    title="Primera página"
                  >
                    <i className="bi bi-chevron-double-left" />
                  </Button>

                  {/* Previous Page */}
                  <Button
                    size="small"
                    variant="secondary" 
                    buttonStyle="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirst || isLoading}
                    title="Página anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="d-flex gap-1 mx-2">
                    {visiblePages.map((pageNum, index) => {
                      if (pageNum === '...') {
                        return (
                          <span 
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-muted"
                          >
                            ...
                          </span>
                        )
                      }
                      
                      const pageNumber = pageNum as number
                      const isActive = pageNumber === currentPage
                      
                      return (
                        <Button
                          key={pageNumber}
                          size="small"
                          variant={isActive ? "primary" : "secondary"}
                          buttonStyle={isActive ? "filled" : "outline"}
                          onClick={() => onPageChange(pageNumber)}
                          disabled={isLoading}
                          className={isActive ? "fw-bold" : ""}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Next Page */}
                  <Button
                    size="small"
                    variant="secondary"
                    buttonStyle="outline" 
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLast || isLoading}
                    title="Página siguiente"
                  >
                    <i className="bi bi-chevron-right" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    size="small"
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={() => onPageChange(totalPages)}
                    disabled={isLast || isLoading}
                    title="Última página"
                  >
                    <i className="bi bi-chevron-double-right" />
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-2">
            <div className="progress" style={{ height: '2px' }}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

PaginationPro.displayName = 'PaginationPro'

export default PaginationPro