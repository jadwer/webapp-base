'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import type { PaginatedPages } from '../types/page'

interface PaginationControlsProps {
  meta: PaginatedPages['meta']
  onPageChange: (page: number) => void
  className?: string
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  meta,
  onPageChange,
  className
}) => {
  const { current_page, per_page, total, last_page } = meta

  const startItem = (current_page - 1) * per_page + 1
  const endItem = Math.min(current_page * per_page, total)

  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5

    if (last_page <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= last_page; i++) {
        pages.push(i)
      }
    } else {
      // Complex pagination logic
      if (current_page <= 3) {
        // Show first few pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(last_page)
      } else if (current_page >= last_page - 2) {
        // Show last few pages
        pages.push(1)
        pages.push('...')
        for (let i = last_page - 3; i <= last_page; i++) {
          pages.push(i)
        }
      } else {
        // Show middle pages
        pages.push(1)
        pages.push('...')
        for (let i = current_page - 1; i <= current_page + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(last_page)
      }
    }

    return pages
  }

  if (last_page <= 1) {
    return null
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className={`d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 ${className || ''}`}>
      {/* Results info */}
      <div className="text-muted small">
        Mostrando {startItem} a {endItem} de {total} resultados
      </div>

      {/* Pagination */}
      <nav aria-label="Paginación de páginas">
        <div className="d-flex gap-1">
          {/* Previous button */}
          <Button
            size="small"
            variant="secondary"
            buttonStyle="outline"
            disabled={current_page <= 1}
            onClick={() => onPageChange(current_page - 1)}
            title="Página anterior"
          >
            <i className="bi bi-chevron-left" />
          </Button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 d-flex align-items-center text-muted">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isCurrentPage = pageNum === current_page

            return (
              <Button
                key={pageNum}
                size="small"
                variant={isCurrentPage ? 'primary' : 'secondary'}
                buttonStyle={isCurrentPage ? 'filled' : 'outline'}
                onClick={() => onPageChange(pageNum)}
                disabled={isCurrentPage}
                title={`Ir a página ${pageNum}`}
              >
                {pageNum}
              </Button>
            )
          })}

          {/* Next button */}
          <Button
            size="small"
            variant="secondary"
            buttonStyle="outline"
            disabled={current_page >= last_page}
            onClick={() => onPageChange(current_page + 1)}
            title="Página siguiente"
          >
            <i className="bi bi-chevron-right" />
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default PaginationControls