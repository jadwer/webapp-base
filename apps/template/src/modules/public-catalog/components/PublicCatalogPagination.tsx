/**
 * PUBLIC CATALOG PAGINATION
 * Professional pagination component for public product catalog
 * Supports standard pagination patterns with responsive design
 */

'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { PublicProductsResponse } from '../types/publicProduct'

interface PublicCatalogPaginationProps {
  meta: PublicProductsResponse['meta']
  links: PublicProductsResponse['links']
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  showPageSizeSelector?: boolean
  showPageInfo?: boolean
  showJumpToPage?: boolean
  pageSizeOptions?: number[]
  className?: string
  variant?: 'default' | 'simple' | 'compact'
}

export const PublicCatalogPagination: React.FC<PublicCatalogPaginationProps> = ({
  meta,
  links: _links, // eslint-disable-line @typescript-eslint/no-unused-vars
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showPageInfo = true,
  showJumpToPage = false,
  pageSizeOptions = [12, 24, 48, 96],
  className = '',
  variant = 'default'
}) => {
  const { currentPage, lastPage, perPage, total, from, to } = meta

  // Don't render if there's only one page
  if (lastPage <= 1 && variant !== 'compact') {
    return null
  }

  // Generate page numbers to show
  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const delta = 2 // Number of pages to show around current page

    if (lastPage <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      // Add ellipsis if needed
      if (currentPage > delta + 2) {
        pages.push('...')
      }

      // Add pages around current page
      const start = Math.max(2, currentPage - delta)
      const end = Math.min(lastPage - 1, currentPage + delta)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (currentPage < lastPage - delta - 1) {
        pages.push('...')
      }

      // Show last page
      if (lastPage > 1) {
        pages.push(lastPage)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    }
  }

  // Simple variant - just prev/next
  if (variant === 'simple') {
    return (
      <div className={`d-flex justify-content-between align-items-center ${className}`}>
        <Button
          variant="secondary"
          buttonStyle="outline"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          startIcon={<i className="bi bi-chevron-left" />}
        >
          Anterior
        </Button>
        
        {showPageInfo && (
          <span className="text-muted small">
            Página {currentPage} de {lastPage}
          </span>
        )}
        
        <Button
          variant="secondary"
          buttonStyle="outline"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          endIcon={<i className="bi bi-chevron-right" />}
        >
          Siguiente
        </Button>
      </div>
    )
  }

  // Compact variant - minimal info
  if (variant === 'compact') {
    return (
      <div className={`d-flex justify-content-center align-items-center gap-2 ${className}`}>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <i className="bi bi-chevron-left" />
        </button>
        
        <span className="small text-muted px-2">
          {currentPage} / {lastPage}
        </span>
        
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    )
  }

  // Default variant - full pagination
  return (
    <div className={`public-catalog-pagination ${className}`}>
      {/* Page Info */}
      {showPageInfo && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted small">
            {from && to ? (
              <>Mostrando {from} - {to} de {total} productos</>
            ) : (
              <>Total: {total} productos</>
            )}
          </div>
          
          {/* Page Size Selector */}
          {showPageSizeSelector && onPageSizeChange && (
            <div className="d-flex align-items-center gap-2 ms-3">
              <span className="text-muted small">Mostrar:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={perPage}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-muted small">por página</span>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <nav aria-label="Navegación de páginas">
        <ul className="pagination justify-content-center mb-0">
          {/* First Page */}
          <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              aria-label="Primera página"
            >
              <i className="bi bi-chevron-double-left" />
            </button>
          </li>

          {/* Previous Page */}
          <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
            >
              <i className="bi bi-chevron-left" />
            </button>
          </li>

          {/* Page Numbers */}
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <li key={`ellipsis-${index}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )
            }

            const page = pageNum as number
            return (
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
            )
          })}

          {/* Next Page */}
          <li className={`page-item ${currentPage >= lastPage ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              aria-label="Página siguiente"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </li>

          {/* Last Page */}
          <li className={`page-item ${currentPage >= lastPage ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(lastPage)}
              disabled={currentPage >= lastPage}
              aria-label="Última página"
            >
              <i className="bi bi-chevron-double-right" />
            </button>
          </li>
        </ul>
      </nav>

      {/* Jump to Page */}
      {showJumpToPage && lastPage > 10 && (
        <div className="d-flex justify-content-center mt-3">
          <div className="input-group" style={{ width: '200px' }}>
            <span className="input-group-text">Ir a página</span>
            <input
              type="number"
              className="form-control"
              min={1}
              max={lastPage}
              placeholder={currentPage.toString()}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value)
                  if (page >= 1 && page <= lastPage) {
                    onPageChange(page)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicCatalogPagination