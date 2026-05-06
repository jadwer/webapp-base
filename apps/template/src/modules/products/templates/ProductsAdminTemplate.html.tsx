'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useProducts, useProductMutations } from '../hooks'
import { ProductsView, ProductFiltersComponent } from '../components'
import type { ProductFilters as ProductFiltersType, ProductSortOptions, ViewMode } from '../types'

interface ProductsAdminTemplateProps {
  onCreateProduct?: () => void
  onEditProduct?: (productId: string) => void
  onViewProduct?: (productId: string) => void
  className?: string
}

export const ProductsAdminTemplate: React.FC<ProductsAdminTemplateProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
  className
}) => {
  const navigation = useNavigationProgress()
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  
  const [filters, setFilters] = useState<ProductFiltersType>({})
  const [sort, setSort] = useState<ProductSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  })

  const { products, meta, isLoading, error, refresh } = useProducts({
    page: { number: currentPage, size: 20 },
    filters,
    sort,
    include: ['unit', 'category', 'brand', 'currency']
  })

  const { deleteProduct, isLoading: isMutating } = useProductMutations()

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: ProductSortOptions) => {
    setSort(newSort)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditProduct = (product: { id: string }) => {
    if (onEditProduct) {
      onEditProduct(product.id)
    } else {
      navigation.push(`/dashboard/products/${product.id}/edit`)
    }
  }

  const handleViewProduct = (product: { id: string }) => {
    if (onViewProduct) {
      onViewProduct(product.id)
    } else {
      navigation.push(`/dashboard/products/${product.id}`)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId)
    refresh()
    
    if (products.length === 1 && currentPage > 1) {
      setCurrentPage(1)
    }
  }

  const handleCreateProduct = () => {
    if (onCreateProduct) {
      onCreateProduct()
    } else {
      navigation.push('/dashboard/products/create')
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Gestión de Productos</h1>
          <p className="text-muted mb-0">
            Administra todos los productos de tu catálogo
          </p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group">
            <Button
              size="small"
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              buttonStyle={viewMode === 'table' ? 'filled' : 'outline'}
              onClick={() => setViewMode('table')}
              title="Vista de tabla"
            >
              <i className="bi bi-table" />
            </Button>
            <Button
              size="small"
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              buttonStyle={viewMode === 'grid' ? 'filled' : 'outline'}
              onClick={() => setViewMode('grid')}
              title="Vista de tarjetas"
            >
              <i className="bi bi-grid-3x3-gap" />
            </Button>
            <Button
              size="small"
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              buttonStyle={viewMode === 'list' ? 'filled' : 'outline'}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <i className="bi bi-list" />
            </Button>
          </div>
          
          <Button
            variant="primary"
            onClick={handleCreateProduct}
            disabled={isLoading || isMutating}
          >
            <i className="bi bi-plus-lg me-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProductFiltersComponent
        filters={filters}
        sort={sort}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar los productos: {error.message}
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

      {/* Products View - All-in-one component */}
      <ProductsView
        products={products}
        meta={meta}
        isLoading={isLoading}
        viewMode={viewMode}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onView={handleViewProduct}
        showStats={true}
        showDetailedStats={true}
      />
    </div>
  )
}

export default ProductsAdminTemplate