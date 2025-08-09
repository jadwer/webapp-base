'use client'

import React, { useState } from 'react'
import { Button, Card } from '@/ui/components/base'
import { ProductsView } from '@/modules/products'
import { useProducts } from '@/modules/products/hooks'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { ViewMode } from '@/modules/products/types'

const ViewModeDemoPage: React.FC = () => {
  const navigation = useNavigationProgress()
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('table')
  const [currentPage, setCurrentPage] = useState(1)

  // Cargar productos con configuración básica
  const { products, meta, isLoading, error } = useProducts({
    page: { number: currentPage, size: 6 }, // Pocos productos para demo
    include: ['unit', 'category', 'brand']
  })

  const viewModes: { value: ViewMode; label: string; icon: string; description: string }[] = [
    { value: 'table', label: 'Tabla', icon: 'bi-table', description: 'Vista detallada con todas las columnas' },
    { value: 'grid', label: 'Catálogo', icon: 'bi-grid-3x3-gap', description: 'Cards visuales para frontend' },
    { value: 'list', label: 'Lista', icon: 'bi-list-ul', description: 'Optimizada para móvil' },
    { value: 'compact', label: 'Compacta', icon: 'bi-list', description: 'Densa para selección múltiple' },
    { value: 'showcase', label: 'Destacados', icon: 'bi-star', description: 'Hero products con imágenes grandes' }
  ]

  const handleViewProduct = (product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}`)
  }

  const handleEditProduct = (product: { id: string }) => {
    navigation.push(`/dashboard/products/${product.id}/edit`)
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-eye me-2" />
            Demo de Vistas de Productos
          </h1>
          <p className="text-muted mb-0">
            Explora todas las vistas disponibles del componente ProductsView
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

      {/* Selector de Vista */}
      <Card className="mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-toggles me-2" />
            Selector de Vista
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {viewModes.map((mode) => (
              <div key={mode.value} className="col-md-6 col-lg-4">
                <div 
                  className={`card h-100 cursor-pointer border-2 ${
                    activeViewMode === mode.value ? 'border-primary' : 'border-light'
                  }`}
                  onClick={() => setActiveViewMode(mode.value)}
                >
                  <div className="card-body text-center">
                    <i className={`${mode.icon} display-4 text-primary mb-3`} />
                    <h6 className="card-title">{mode.label}</h6>
                    <p className="card-text text-muted small">
                      {mode.description}
                    </p>
                    {activeViewMode === mode.value && (
                      <div className="badge bg-primary">
                        <i className="bi bi-check-circle me-1" />
                        Activo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Vista Activa */}
      <div className="mb-4">
        <div className="alert alert-info d-flex align-items-center">
          <i className="bi bi-info-circle me-2" />
          <div>
            <strong>Vista actual: {viewModes.find(m => m.value === activeViewMode)?.label}</strong>
            <br />
            <small>{viewModes.find(m => m.value === activeViewMode)?.description}</small>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar los productos: {error.message}
        </div>
      )}

      {/* ProductsView Demo */}
      <ProductsView
        products={products}
        meta={meta}
        isLoading={isLoading}
        viewMode={activeViewMode}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onEdit={handleEditProduct}
        onView={handleViewProduct}
        onDelete={async (productId: string) => {
          console.log('Demo: Delete product', productId)
          // En demo no eliminamos realmente
        }}
        showStats={true}
        showDetailedStats={true}
        customStats={
          <div className="col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <i className="bi bi-lightning-charge text-warning h4 mb-0" />
              <div className="small text-muted">Modo Demo</div>
            </div>
          </div>
        }
      />

      {/* Características de cada vista */}
      <Card className="mt-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2" />
            Características por Vista
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Vistas para Admin</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span><i className="bi bi-table me-2" />Tabla</span>
                  <small className="text-muted">Gestión completa</small>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span><i className="bi bi-list me-2" />Compacta</span>
                  <small className="text-muted">Selección múltiple</small>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span><i className="bi bi-star me-2" />Showcase</span>
                  <small className="text-muted">Gestión destacados</small>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Vistas para Frontend</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span><i className="bi bi-grid-3x3-gap me-2" />Grid</span>
                  <small className="text-muted">Catálogo principal</small>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span><i className="bi bi-list-ul me-2" />Lista</span>
                  <small className="text-muted">Móvil optimizada</small>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span><i className="bi bi-star me-2" />Showcase</span>
                  <small className="text-muted">Hero products</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewModeDemoPage