'use client'

import React, { useState } from 'react'
import { Card, Button, Input } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useCategories } from '../hooks'
import { CategoriesTable } from '../components'
import type { CategorySortOptions } from '../types'

interface CategoriesAdminTemplateProps {
  onCreateCategory?: () => void
  onEditCategory?: (categoryId: string) => void
  onViewCategory?: (categoryId: string) => void
  className?: string
}

export const CategoriesAdminTemplate: React.FC<CategoriesAdminTemplateProps> = ({
  onCreateCategory,
  onEditCategory,
  onViewCategory,
  className
}) => {
  const navigation = useNavigationProgress()
  const [currentPage, setCurrentPage] = useState(1)
  const [nameFilter, setNameFilter] = useState('')
  const [slugFilter, setSlugFilter] = useState('')
  
  const [sort, setSort] = useState<CategorySortOptions>({
    field: 'createdAt',
    direction: 'desc'
  })

  const { categories, meta, isLoading, error, refresh } = useCategories({
    page: { number: currentPage, size: 10 },
    filter: {
      ...(nameFilter && { name: nameFilter }),
      ...(slugFilter && { slug: slugFilter })
    },
    sort
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSortChange = (newSort: CategorySortOptions) => {
    setSort(newSort)
    setCurrentPage(1)
  }

  const handleCreateCategory = () => {
    if (onCreateCategory) {
      onCreateCategory()
    } else {
      navigation.push('/dashboard/products/categories/create')
    }
  }

  const totalCategories = meta?.page?.total || 0
  const hasCategories = categories.length > 0

  return (
    <div className={className}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Gestión de Categorías</h1>
          <p className="text-muted mb-0">
            Administra todas las categorías del catálogo
          </p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="primary"
            onClick={handleCreateCategory}
            disabled={isLoading}
          >
            <i className="bi bi-plus-lg me-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-primary">{totalCategories}</h3>
              <p className="text-muted mb-0">Total Categorías</p>
            </div>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-success">
                {categories.filter(c => c.description).length}
              </h3>
              <p className="text-muted mb-0">Con Descripción</p>
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
            <div className="col-md-4">
              <Input
                label="Buscar por nombre"
                type="text"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Nombre de la categoría"
                leftIcon="bi-search"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <Input
                label="Buscar por slug"
                type="text"
                value={slugFilter}
                onChange={(e) => {
                  setSlugFilter(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Slug de la categoría"
                leftIcon="bi-tag"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <Input
                label="Ordenar por"
                type="select"
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-')
                  handleSortChange({
                    field: field as CategorySortOptions['field'],
                    direction: direction as CategorySortOptions['direction']
                  })
                }}
                disabled={isLoading}
                options={[
                  { value: 'name-asc', label: 'Nombre (A-Z)' },
                  { value: 'name-desc', label: 'Nombre (Z-A)' },
                  { value: 'createdAt-desc', label: 'Más recientes' },
                  { value: 'createdAt-asc', label: 'Más antiguos' },
                  { value: 'updatedAt-desc', label: 'Actualizados recientemente' }
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
          Error al cargar las categorías: {error.message}
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

      {/* Categories Table */}
      <Card>
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-grid-3x3-gap me-2" />
              Categorías
            </h5>
            {meta?.page && (
              <small className="text-muted">
                Mostrando {((currentPage - 1) * (meta.page.perPage || 10)) + 1} a {Math.min(currentPage * (meta.page.perPage || 10), totalCategories)} de {totalCategories} categorías
              </small>
            )}
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {hasCategories && (
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
          <CategoriesTable
            categories={categories}
            isLoading={isLoading}
            onEdit={(category) => onEditCategory?.(category.id)}
            onView={(category) => onViewCategory?.(category.id)}
          />
        </div>

        {/* Pagination */}
        {meta?.page && meta.page.lastPage > 1 && (
          <div className="card-footer">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Página {currentPage} de {meta.page.lastPage}
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
                  disabled={currentPage >= meta.page.lastPage || isLoading}
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

export default CategoriesAdminTemplate