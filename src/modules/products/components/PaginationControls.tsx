'use client'

import React from 'react'
import { Button } from '@/ui/components/base'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  className?: string
  showInfo?: boolean
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  perPage,
  totalItems,
  onPageChange,
  isLoading = false,
  className = '',
  showInfo = true
}) => {
  if (totalPages <= 1) return null

  const startItem = ((currentPage - 1) * perPage) + 1
  const endItem = Math.min(currentPage * perPage, totalItems)

  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      {showInfo && (
        <div className="text-muted">
          Página {currentPage} de {totalPages}
          {totalItems > 0 && (
            <span className="d-none d-md-inline">
              {' '} • Mostrando {startItem} a {endItem} de {totalItems} elementos
            </span>
          )}
        </div>
      )}
      
      <div className="btn-group">
        <Button
          size="small"
          variant="secondary"
          buttonStyle="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          title="Página anterior"
        >
          <i className="bi bi-chevron-left" />
          <span className="d-none d-md-inline ms-1">Anterior</span>
        </Button>
        
        <Button
          size="small"
          variant="secondary"
          buttonStyle="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          title="Página siguiente"
        >
          <span className="d-none d-md-inline me-1">Siguiente</span>
          <i className="bi bi-chevron-right" />
        </Button>
      </div>
    </div>
  )
}

export default PaginationControls