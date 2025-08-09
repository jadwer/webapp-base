'use client'

import React, { useState } from 'react'
import { Button, Card } from '@/ui/components/base'
import { ProductsView, ProductFiltersComponent } from '@/modules/products'
import { useProducts, useProductMutations } from '@/modules/products/hooks'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { ViewMode, ProductFilters, ProductSortOptions } from '@/modules/products/types'

const AdminUseCasesPage: React.FC = () => {
  const navigation = useNavigationProgress()
  const [currentCase, setCurrentCase] = useState<string>('inventory-management')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [sort, setSort] = useState<ProductSortOptions>({
    field: 'name',
    direction: 'asc'
  })

  const { products, meta, isLoading, error, refresh } = useProducts({
    page: { number: currentPage, size: 12 },
    filters,
    sort,
    include: ['unit', 'category', 'brand']
  })

  const { deleteProduct } = useProductMutations()

  const useCases = [
    {
      id: 'inventory-management',
      title: 'Gestión de Inventario',
      description: 'Vista tabla completa para administración diaria',
      viewMode: 'table' as ViewMode,
      icon: 'bi-clipboard-data',
      filters: {},
      sort: { field: 'name' as const, direction: 'asc' as const }
    },
    {
      id: 'quick-selection',
      title: 'Selección Rápida',
      description: 'Vista compacta para pedidos y formularios',
      viewMode: 'compact' as ViewMode,
      icon: 'bi-check2-square',
      filters: {},
      sort: { field: 'name' as const, direction: 'asc' as const }
    },
    {
      id: 'catalog-preview',
      title: 'Vista Previa Catálogo',
      description: 'Como se verá en el frontend público',
      viewMode: 'grid' as ViewMode,
      icon: 'bi-eye',
      filters: {},
      sort: { field: 'createdAt' as const, direction: 'desc' as const }
    },
    {
      id: 'mobile-review',
      title: 'Revisión Móvil',
      description: 'Vista optimizada para dispositivos móviles',
      viewMode: 'list' as ViewMode,
      icon: 'bi-phone',
      filters: {},
      sort: { field: 'name' as const, direction: 'asc' as const }
    },
    {
      id: 'featured-management',
      title: 'Productos Destacados',
      description: 'Gestión de productos hero y promociones',
      viewMode: 'showcase' as ViewMode,
      icon: 'bi-star-fill',
      filters: {},
      sort: { field: 'price' as const, direction: 'desc' as const }
    }
  ]

  const activeCase = useCases.find(c => c.id === currentCase)!

  const handleCaseChange = (caseId: string) => {
    const newCase = useCases.find(c => c.id === caseId)!
    setCurrentCase(caseId)
    setFilters(newCase.filters)
    setSort(newCase.sort)
    setCurrentPage(1)
  }

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId)
    refresh()
    
    if (products.length === 1 && currentPage > 1) {
      setCurrentPage(1)
    }
  }

  const handleEditProduct = (product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}/edit`)
  }

  const handleViewProduct = (product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}`)
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-tools me-2" />
            Casos de Uso Administrativos
          </h1>
          <p className="text-muted mb-0">
            Ejemplos prácticos de cómo usar ProductsView en diferentes contextos admin
          </p>
        </div>
        
        <Button
          variant="secondary"
          buttonStyle="outline"
          onClick={() => navigation.back()}
        >
          <i className="bi bi-arrow-left me-2" />
          Volver
        </Button>
      </div>

      {/* Selector de Caso de Uso */}
      <Card className="mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2" />
            Casos de Uso
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {useCases.map((useCase) => (
              <div key={useCase.id} className="col-md-6 col-xl-4">
                <div 
                  className={`card h-100 cursor-pointer border-2 ${
                    currentCase === useCase.id ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                  }`}
                  onClick={() => handleCaseChange(useCase.id)}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <i className={`${useCase.icon} h4 text-primary me-3 mt-1`} />
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-2">{useCase.title}</h6>
                        <p className="card-text text-muted small mb-2">
                          {useCase.description}
                        </p>
                        <div className="small">
                          <span className="badge bg-secondary me-2">
                            Vista: {useCase.viewMode}
                          </span>
                          {currentCase === useCase.id && (
                            <span className="badge bg-primary">
                              <i className="bi bi-check-circle me-1" />
                              Activo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Información del Caso Actual */}
      <div className="alert alert-info d-flex align-items-center mb-4">
        <i className={`${activeCase.icon} h5 me-3`} />
        <div>
          <strong>{activeCase.title}</strong>
          <br />
          <small>{activeCase.description}</small>
          <span className="badge bg-info-subtle text-info-emphasis ms-2">
            Modo: {activeCase.viewMode}
          </span>
        </div>
      </div>

      {/* Filtros específicos para el caso de gestión de inventario */}
      {currentCase === 'inventory-management' && (
        <ProductFiltersComponent
          filters={filters}
          sort={sort}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters)
            setCurrentPage(1)
          }}
          onSortChange={(newSort) => {
            setSort(newSort)
            setCurrentPage(1)
          }}
          onClearFilters={() => {
            setFilters({})
            setCurrentPage(1)
          }}
          isLoading={isLoading}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar los productos: {error.message}
        </div>
      )}

      {/* Vista del Caso de Uso */}
      <ProductsView
        products={products}
        meta={meta}
        isLoading={isLoading}
        viewMode={activeCase.viewMode}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onEdit={handleEditProduct}
        onView={handleViewProduct}
        onDelete={handleDeleteProduct}
        showStats={true}
        showDetailedStats={currentCase === 'inventory-management'}
        customStats={
          <div className="col-md-3">
            <div className="text-center p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-25">
              <i className={`${activeCase.icon} text-primary h4 mb-0`} />
              <div className="small text-primary fw-medium">{activeCase.title}</div>
            </div>
          </div>
        }
      />

      {/* Explicación de Beneficios */}
      <Card className="mt-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-lightbulb me-2" />
            Beneficios de la Arquitectura Modular
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><i className="bi bi-recycle me-2 text-success" />Reutilización</h6>
              <p className="small text-muted mb-4">
                Un solo componente ProductsView sirve para todos los casos de uso administrativos,
                evitando duplicación de código y facilitando mantenimiento.
              </p>
              
              <h6><i className="bi bi-gear me-2 text-info" />Configurabilidad</h6>
              <p className="small text-muted">
                Cada caso de uso puede tener configuraciones específicas (filtros, ordenamiento, vista)
                sin necesidad de crear componentes separados.
              </p>
            </div>
            <div className="col-md-6">
              <h6><i className="bi bi-speedometer2 me-2 text-warning" />Performance</h6>
              <p className="small text-muted mb-4">
                Los mismos datos y estado se pueden mostrar en diferentes vistas sin re-fetch,
                optimizando el rendimiento y la experiencia de usuario.
              </p>
              
              <h6><i className="bi bi-phone me-2 text-primary" />Responsivo</h6>
              <p className="small text-muted">
                Cada vista está optimizada para diferentes dispositivos y contextos,
                proporcionando la mejor experiencia en cada situación.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminUseCasesPage