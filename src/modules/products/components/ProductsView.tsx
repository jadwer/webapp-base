'use client'

import React from 'react'
import { Card } from '@/ui/components/base'
import ProductsTable from './ProductsTable'
import ProductsGrid from './ProductsGrid'
import ProductsList from './ProductsList'
import ProductsCompact from './ProductsCompact'
import ProductsShowcase from './ProductsShowcase'
import PaginationControls from './PaginationControls'
import ProductsStats from './ProductsStats'
import type { Product, PaginationMeta } from '../types'

type ViewMode = 'table' | 'grid' | 'list' | 'compact' | 'showcase'

interface ProductsViewProps {
  products: Product[]
  meta: PaginationMeta | undefined
  isLoading: boolean
  viewMode?: ViewMode
  showStats?: boolean
  showPagination?: boolean
  currentPage?: number
  onPageChange?: (page: number) => void
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  className?: string
  // Props específicas para diferentes acciones
  onEdit?: (product: { id: string }) => void
  onDelete?: (productId: string) => Promise<void>
  onDuplicate?: (productId: string) => Promise<void>
  onView?: (product: { id: string }) => void
  // Props de configuración de stats
  showDetailedStats?: boolean
  customStats?: React.ReactNode
}

const DefaultEmptyState: React.FC = () => (
  <div className="text-center py-5">
    <i className="bi bi-inbox display-1 text-muted mb-3" />
    <h3 className="text-muted">No hay productos</h3>
    <p className="text-muted">No se encontraron productos con los filtros aplicados.</p>
  </div>
)

const DefaultLoadingState: React.FC = () => (
  <div className="text-center py-5">
    <div className="spinner-border text-primary mb-3" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
    <p className="text-muted">Cargando productos...</p>
  </div>
)

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  meta,
  isLoading,
  viewMode = 'table',
  showStats = true,
  showPagination = true,
  currentPage = 1,
  onPageChange,
  emptyState,
  loadingState,
  className = '',
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  showDetailedStats = false,
  customStats
}) => {
  const totalProducts = meta?.page?.total || 0
  const totalPages = meta?.page?.lastPage || 1
  const perPage = meta?.page?.perPage || 20
  const hasProducts = products.length > 0

  // Handler para cambio de página
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page)
    }
  }

  return (
    <div className={className}>
      {/* Estadísticas */}
      {showStats && hasProducts && (
        <ProductsStats
          products={products}
          totalProducts={totalProducts}
          currentPage={currentPage}
          perPage={perPage}
          displayedItems={products.length}
          showDetailedStats={showDetailedStats}
          customStats={customStats}
        />
      )}

      {/* Contenido principal */}
      <Card>
        {/* Header con información */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-box-seam me-2" />
              Productos
            </h5>
            {meta?.page && hasProducts && (
              <small className="text-muted">
                Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, totalProducts)} de {totalProducts} productos
              </small>
            )}
          </div>
        </div>

        {/* Cuerpo del contenido */}
        <div className="card-body p-0">
          {isLoading ? (
            loadingState || <DefaultLoadingState />
          ) : !hasProducts ? (
            emptyState || <DefaultEmptyState />
          ) : (
            <>
              {/* Renderizado según el modo de vista */}
              {viewMode === 'table' && (
                <ProductsTable
                  products={products}
                  isLoading={isLoading}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onView={onView}
                />
              )}

              {viewMode === 'grid' && (
                <ProductsGrid
                  products={products}
                  isLoading={isLoading}
                  onEdit={onEdit}
                  onDelete={onDelete ? (product) => onDelete(product.id) : undefined}
                  onView={onView}
                />
              )}

              {viewMode === 'list' && (
                <ProductsList
                  products={products}
                  isLoading={isLoading}
                  onEdit={onEdit}
                  onDelete={onDelete ? (product) => onDelete(product.id) : undefined}
                  onView={onView}
                />
              )}

              {viewMode === 'compact' && (
                <ProductsCompact
                  products={products}
                  isLoading={isLoading}
                  onQuickAction={(action, product) => {
                    if (action === 'view' && onView) onView(product)
                    if (action === 'add' && onEdit) onEdit(product)
                  }}
                />
              )}

              {viewMode === 'showcase' && (
                <ProductsShowcase
                  products={products}
                  isLoading={isLoading}
                  onEdit={onEdit}
                  onDelete={onDelete ? (product) => onDelete(product.id) : undefined}
                  onView={onView}
                />
              )}
            </>
          )}
        </div>

        {/* Footer con paginación */}
        {showPagination && hasProducts && meta?.page && totalPages > 1 && (
          <div className="card-footer">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              perPage={perPage}
              totalItems={totalProducts}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default ProductsView