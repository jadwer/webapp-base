'use client'

import React, { useState } from 'react'
import { Card, Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useProducts, useProductMutations } from '../hooks'
import ProductsTable from '../components/ProductsTable'
import { ProductFiltersComponent } from '../components'
import type { ProductFilters as ProductFiltersType, ProductSortOptions } from '../types'

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  const [filters, setFilters] = useState<ProductFiltersType>({})
  const [sort, setSort] = useState<ProductSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  })

  const { products, meta, isLoading, error, refresh } = useProducts({
    page: { number: currentPage, size: 20 },
    filters,
    sort,
    include: ['unit', 'category', 'brand']
  })

  const { deleteProduct, duplicateProduct, isLoading: isMutating } = useProductMutations()

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

  const handleDuplicateProduct = async (productId: string) => {
    await duplicateProduct(productId)
    refresh()
  }

  const handleCreateProduct = () => {
    if (onCreateProduct) {
      onCreateProduct()
    } else {
      navigation.push('/dashboard/products/create')
    }
  }

  const totalProducts = meta?.total || 0
  const hasProducts = products.length > 0

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
              variant={viewMode === 'cards' ? 'primary' : 'secondary'}
              buttonStyle={viewMode === 'cards' ? 'filled' : 'outline'}
              onClick={() => setViewMode('cards')}
              title="Vista de tarjetas"
            >
              <i className="bi bi-grid-3x3-gap" />
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

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-primary">{totalProducts}</h3>
              <p className="text-muted mb-0">Total Productos</p>
            </div>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-success">
                {products.filter(p => p.price && p.price > 0).length}
              </h3>
              <p className="text-muted mb-0">Con Precio</p>
            </div>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-warning">
                {products.filter(p => p.sku).length}
              </h3>
              <p className="text-muted mb-0">Con SKU</p>
            </div>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <div className="card-body">
              <h3 className="display-6 text-info">
                {products.filter(p => p.imgPath).length}
              </h3>
              <p className="text-muted mb-0">Con Imagen</p>
            </div>
          </Card>
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

      {/* Products Table/Cards */}
      <Card>
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-box-seam me-2" />
              Productos
            </h5>
            {meta && (
              <small className="text-muted">
                Mostrando {((currentPage - 1) * (meta.perPage || 20)) + 1} a {Math.min(currentPage * (meta.perPage || 20), totalProducts)} de {totalProducts} productos
              </small>
            )}
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {hasProducts && (
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
          <ProductsTable
            products={products}
            isLoading={isLoading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onDuplicate={handleDuplicateProduct}
            onView={handleViewProduct}
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

export default ProductsAdminTemplate