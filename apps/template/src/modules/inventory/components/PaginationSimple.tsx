/**
 * PAGINATION SIMPLE
 * Paginación simple y elegante para inventory-simple
 * Sin complejidades innecesarias
 */

'use client'

import React from 'react'
import { Button } from '@/ui/components/base/Button'

interface PaginationSimpleProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  totalItems?: number
  pageSize?: number
}

export const PaginationSimple = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  totalItems,
  pageSize = 20
}: PaginationSimpleProps) => {
  // Validación de props para evitar errores
  const safeTotalPages = Math.max(1, totalPages || 1)
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages))
  const safeTotalItems = Math.max(0, totalItems || 0)
  const safePageSize = Math.max(1, pageSize || 20)

  if (safeTotalPages <= 1) return null

  const startItem = (safeCurrentPage - 1) * safePageSize + 1
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems)

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 px-3 py-2">
      {/* Info de registros */}
      <div className="text-muted small">
        {safeTotalItems > 0 ? (
          <>Mostrando {startItem} - {endItem} de {safeTotalItems} registros</>
        ) : (
          <>Página {safeCurrentPage} de {safeTotalPages}</>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="d-flex gap-1">
        <Button
          variant="secondary"
          size="small"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1 || isLoading}
          title="Página anterior"
        >
          <i className="bi bi-chevron-left" />
        </Button>

        {/* Números de página */}
        {renderPageNumbers(safeCurrentPage, safeTotalPages, onPageChange, isLoading)}

        <Button
          variant="secondary"
          size="small"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages || isLoading}
          title="Página siguiente"
        >
          <i className="bi bi-chevron-right" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Renderiza los números de página de forma inteligente
 */
function renderPageNumbers(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
  isLoading: boolean
) {
  const pages: (number | string)[] = []
  
  if (totalPages <= 7) {
    // Si hay pocas páginas, mostrar todas
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Lógica más compleja para muchas páginas
    pages.push(1)
    
    if (currentPage > 3) {
      pages.push('...')
    }
    
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...')
    }
    
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  }

  return pages.map((page, index) => {
    if (typeof page === 'string') {
      return (
        <span key={`ellipsis-${index}`} className="px-2 py-1 text-muted">
          {page}
        </span>
      )
    }

    return (
      <Button
        key={page}
        variant={page === currentPage ? 'primary' : 'secondary'}
        size="small"
        onClick={() => onPageChange(page)}
        disabled={isLoading}
        style={{ minWidth: '32px' }}
      >
        {page}
      </Button>
    )
  })
}