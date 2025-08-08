'use client'

import React, { useState } from 'react'
import { Card, Button, Input } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useUnits } from '../hooks'
import { UnitsTable } from '../components'
import type { UnitSortOptions } from '../types'

interface UnitsAdminTemplateProps {
  onCreateUnit?: () => void
  onEditUnit?: (unitId: string) => void
  onViewUnit?: (unitId: string) => void
  className?: string
}

export const UnitsAdminTemplate: React.FC<UnitsAdminTemplateProps> = ({
  onCreateUnit,
  onEditUnit,
  onViewUnit,
  className
}) => {
  const navigation = useNavigationProgress()
  const [currentPage, setCurrentPage] = useState(1)
  const [nameFilter, setNameFilter] = useState('')
  const [codeFilter, setCodeFilter] = useState('')
  const [unitTypeFilter, setUnitTypeFilter] = useState('')
  
  const [sort, setSort] = useState<UnitSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  })

  const { units, meta, isLoading, error, refresh } = useUnits({
    page: { number: currentPage, size: 10 },
    filter: {
      ...(nameFilter && { name: nameFilter }),
      ...(codeFilter && { code: codeFilter }),
      ...(unitTypeFilter && { unitType: unitTypeFilter })
    },
    sort
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSortChange = (newSort: UnitSortOptions) => {
    setSort(newSort)
    setCurrentPage(1)
  }

  const handleCreateUnit = () => {
    if (onCreateUnit) {
      onCreateUnit()
    } else {
      navigation.push('/dashboard/products/units/create')
    }
  }

  const totalUnits = meta?.total || 0
  const hasUnits = units.length > 0

  return (
    <div className={className}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Gestión de Unidades</h1>
          <p className="text-muted mb-0">
            Administra todas las unidades de medida del sistema
          </p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="primary"
            onClick={handleCreateUnit}
            disabled={isLoading}
          >
            <i className="bi bi-plus-lg me-2" />
            Nueva Unidad
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-primary">{totalUnits}</h3>
              <p className="text-muted mb-0">Total Unidades</p>
            </div>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-info">
                {new Set(units.map(u => u.unitType)).size}
              </h3>
              <p className="text-muted mb-0">Tipos de Unidad</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2" />
            Filtros y búsqueda
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <Input
                label="Buscar por nombre"
                type="text"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Nombre de la unidad"
                leftIcon="bi-search"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-3">
              <Input
                label="Buscar por código"
                type="text"
                value={codeFilter}
                onChange={(e) => {
                  setCodeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Código de la unidad"
                leftIcon="bi-code"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-3">
              <Input
                label="Tipo de unidad"
                type="text"
                value={unitTypeFilter}
                onChange={(e) => {
                  setUnitTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Tipo de unidad"
                leftIcon="bi-tags"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-3">
              <Input
                label="Ordenar por"
                type="select"
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-')
                  handleSortChange({
                    field: field as UnitSortOptions['field'],
                    direction: direction as UnitSortOptions['direction']
                  })
                }}
                disabled={isLoading}
                options={[
                  { value: 'name-asc', label: 'Nombre (A-Z)' },
                  { value: 'name-desc', label: 'Nombre (Z-A)' },
                  { value: 'code-asc', label: 'Código (A-Z)' },
                  { value: 'code-desc', label: 'Código (Z-A)' },
                  { value: 'unitType-asc', label: 'Tipo (A-Z)' },
                  { value: 'unitType-desc', label: 'Tipo (Z-A)' },
                  { value: 'createdAt-desc', label: 'Más recientes' },
                  { value: 'createdAt-asc', label: 'Más antiguos' }
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar las unidades: {error.message}
          <Button
            size="small"
            variant="danger"
            buttonStyle="outline"
            onClick={() => refresh()}
            className="ms-3"
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Units Table */}
      <Card>
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-rulers me-2" />
              Unidades
            </h5>
            {meta && (
              <small className="text-muted">
                Mostrando {((currentPage - 1) * (meta.perPage || 10)) + 1} a {Math.min(currentPage * (meta.perPage || 10), totalUnits)} de {totalUnits} unidades
              </small>
            )}
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {hasUnits && (
              <Button
                size="small"
                variant="secondary"
                buttonStyle="outline"
                onClick={() => refresh()}
                disabled={isLoading}
                loading={isLoading}
                title="Actualizar lista"
              >
                <i className="bi bi-arrow-clockwise" />
              </Button>
            )}
          </div>
        </div>

        <div className="card-body p-0">
          <UnitsTable
            units={units}
            isLoading={isLoading}
            onEdit={(unit) => onEditUnit?.(unit.id)}
            onView={(unit) => onViewUnit?.(unit.id)}
          />
        </div>

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div className="card-footer">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Página {currentPage} de {meta.lastPage}
              </div>
              
              <div className="btn-group">
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  <i className="bi bi-chevron-left" />
                  Anterior
                </Button>
                
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= meta.lastPage || isLoading}
                >
                  Siguiente
                  <i className="bi bi-chevron-right ms-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default UnitsAdminTemplate