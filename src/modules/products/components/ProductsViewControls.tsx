'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { ViewMode } from '../types'

interface ProductsViewControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  isLoading?: boolean
  className?: string
}

const VIEW_MODES: Array<{
  value: ViewMode
  label: string
  icon: string
  description: string
}> = [
  {
    value: 'table',
    label: 'Tabla',
    icon: 'bi-table',
    description: 'Vista detallada completa'
  },
  {
    value: 'grid',
    label: 'Cuadrícula',
    icon: 'bi-grid-3x3',
    description: 'Cards con imágenes'
  },
  {
    value: 'list',
    label: 'Lista',
    icon: 'bi-list-ul',
    description: 'Vista compacta vertical'
  },
  {
    value: 'compact',
    label: 'Compacto',
    icon: 'bi-list',
    description: 'Vista densa para selección'
  },
  {
    value: 'showcase',
    label: 'Escaparate',
    icon: 'bi-window-stack',
    description: 'Vista destacada con imágenes grandes'
  }
] as const

export const ProductsViewControls: React.FC<ProductsViewControlsProps> = ({
  viewMode,
  onViewModeChange,
  isLoading = false,
  className = ''
}) => {
  const navigation = useNavigationProgress()

  const handleCreateProduct = () => {
    navigation.push('/dashboard/products/create')
  }

  return (
    <div className={`d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center justify-content-between ${className}`}>
      {/* View Mode Selector */}
      <div className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-center">
        <span className="fw-medium text-muted small">Vista:</span>
        <div className="btn-group" role="group" aria-label="Selector de vista">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode.value}
              size="small"
              variant={viewMode === mode.value ? 'primary' : 'secondary'}
              buttonStyle={viewMode === mode.value ? 'filled' : 'outline'}
              onClick={() => onViewModeChange(mode.value)}
              disabled={isLoading}
              title={`${mode.label} - ${mode.description}`}
              className="d-flex align-items-center"
            >
              <i className={`${mode.icon} me-1 d-none d-sm-inline`} />
              <span className="d-none d-md-inline">{mode.label}</span>
              <span className="d-inline d-md-none">
                <i className={mode.icon} />
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <Button
          variant="success"
          onClick={handleCreateProduct}
          disabled={isLoading}
        >
          <i className="bi bi-plus-lg me-2" />
          Nuevo Producto
        </Button>
        
        <Button
          variant="secondary"
          buttonStyle="outline"
          onClick={() => navigation.push('/dashboard/products/examples')}
          disabled={isLoading}
        >
          <i className="bi bi-eye me-2" />
          Ver Ejemplos
        </Button>
      </div>
    </div>
  )
}

export default ProductsViewControls