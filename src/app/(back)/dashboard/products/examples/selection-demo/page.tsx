'use client'

import React, { useState } from 'react'
import { Button, Card } from '@/ui/components/base'
import { ProductsCompact } from '@/modules/products'
import { useProducts } from '@/modules/products/hooks'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { Product } from '@/modules/products/types'

const SelectionDemoPage: React.FC = () => {
  const navigation = useNavigationProgress()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [maxItems, setMaxItems] = useState<number | undefined>(undefined)
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [currentPage] = useState(1)

  const { products, isLoading, error } = useProducts({
    page: { number: currentPage, size: 20 },
    include: ['unit', 'category', 'brand']
  })

  const displayedProducts = showSelectedOnly 
    ? products.filter(p => selectedProducts.includes(p.id))
    : products

  const scenarios = [
    {
      id: 'unlimited',
      title: 'Selección Ilimitada',
      description: 'Permite seleccionar cualquier cantidad de productos',
      maxItems: undefined,
      icon: 'bi-infinity'
    },
    {
      id: 'order-form',
      title: 'Formulario de Pedido',
      description: 'Máximo 10 productos por pedido',
      maxItems: 10,
      icon: 'bi-cart-plus'
    },
    {
      id: 'comparison',
      title: 'Comparador',
      description: 'Máximo 3 productos para comparar',
      maxItems: 3,
      icon: 'bi-diagram-3'
    },
    {
      id: 'promotion',
      title: 'Promoción 2x1',
      description: 'Exactamente 2 productos',
      maxItems: 2,
      icon: 'bi-gift'
    }
  ]

  const handleSelectionChange = (productIds: string[]) => {
    setSelectedProducts(productIds)
  }

  const handleQuickAction = (action: string, product: Product) => {
    if (action === 'view') {
      navigation.push(`/dashboard/products/${product.id}`)
    } else if (action === 'add') {
      // Simular agregar a carrito o formulario
      console.log('Quick add to cart:', product.name)
    }
  }

  const clearSelection = () => {
    setSelectedProducts([])
  }

  const applyScenario = (scenario: typeof scenarios[0]) => {
    setMaxItems(scenario.maxItems)
    setSelectedProducts([])
  }

  const selectedCount = selectedProducts.length
  const selectedProductDetails = products.filter(p => selectedProducts.includes(p.id))
  const totalValue = selectedProductDetails.reduce((sum, product) => sum + (product.price || 0), 0)

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-check2-square me-2" />
            Demo de Selección de Productos
          </h1>
          <p className="text-muted mb-0">
            Prueba la funcionalidad de selección múltiple con ProductsCompact
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

      <div className="row">
        {/* Panel de Control */}
        <div className="col-md-4 col-lg-3 mb-4">
          {/* Scenarios */}
          <Card className="mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-toggles me-2" />
                Escenarios
              </h6>
            </div>
            <div className="card-body p-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light"
                  onClick={() => applyScenario(scenario)}
                >
                  <i className={`${scenario.icon} text-primary me-2`} />
                  <div className="flex-grow-1">
                    <div className="small fw-medium">{scenario.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {scenario.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Selection Summary */}
          <Card className="mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-clipboard-check me-2" />
                Selección Actual
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">Productos:</span>
                <span className="fw-medium">
                  {selectedCount}
                  {maxItems && ` / ${maxItems}`}
                </span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small text-muted">Valor Total:</span>
                <span className="fw-medium text-success">
                  ${totalValue.toLocaleString()}
                </span>
              </div>

              {maxItems && (
                <div className="progress mb-3" style={{ height: '4px' }}>
                  <div 
                    className={`progress-bar ${
                      selectedCount >= maxItems ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min((selectedCount / maxItems) * 100, 100)}%` }}
                  />
                </div>
              )}

              <div className="d-grid gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={clearSelection}
                  disabled={selectedCount === 0}
                >
                  <i className="bi bi-x-circle me-1" />
                  Limpiar
                </Button>
                
                <Button
                  size="small"
                  variant={showSelectedOnly ? 'primary' : 'secondary'}
                  buttonStyle={showSelectedOnly ? 'filled' : 'outline'}
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                  disabled={selectedCount === 0}
                >
                  <i className="bi bi-filter me-1" />
                  {showSelectedOnly ? 'Ver Todos' : 'Solo Seleccionados'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Selected Products Detail */}
          {selectedCount > 0 && (
            <Card>
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-list-ul me-2" />
                  Productos Seleccionados
                </h6>
              </div>
              <div className="card-body p-2">
                {selectedProductDetails.map((product) => (
                  <div key={product.id} className="d-flex align-items-center p-2 border-bottom last:border-bottom-0">
                    <div className="flex-grow-1">
                      <div className="small fw-medium">{product.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        ${product.price?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <Button
                      size="small"
                      variant="secondary"
                      buttonStyle="outline"
                      onClick={() => {
                        const newSelection = selectedProducts.filter(id => id !== product.id)
                        setSelectedProducts(newSelection)
                      }}
                    >
                      <i className="bi bi-x" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="col-md-8 col-lg-9">
          {/* Controls */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="text-muted">
                Límite actual: 
                <span className="fw-medium ms-1">
                  {maxItems ? `${maxItems} productos` : 'Sin límite'}
                </span>
              </span>
            </div>
            
            {maxItems && selectedCount >= maxItems && (
              <div className="alert alert-warning alert-sm mb-0 py-2">
                <i className="bi bi-exclamation-triangle me-2" />
                Límite alcanzado
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              Error al cargar los productos: {error.message}
            </div>
          )}

          {/* Products Compact View */}
          <Card>
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-grid me-2" />
                Productos Disponibles
                {showSelectedOnly && (
                  <span className="badge bg-primary ms-2">
                    Mostrando solo seleccionados ({selectedCount})
                  </span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              <ProductsCompact
                products={displayedProducts}
                isLoading={isLoading}
                selectable={true}
                selectedProducts={selectedProducts}
                onSelectionChange={handleSelectionChange}
                onQuickAction={handleQuickAction}
                maxItems={maxItems}
                showCheckboxes={true}
                showImages={true}
                showPricing={true}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Usage Examples */}
      <Card className="mt-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-lightbulb me-2" />
            Casos de Uso Reales
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <h6><i className="bi bi-cart-plus me-2 text-success" />E-commerce</h6>
              <ul className="small text-muted">
                <li>Carrito de compras</li>
                <li>Listas de deseos</li>
                <li>Comparador de productos</li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6><i className="bi bi-clipboard-data me-2 text-info" />Administración</h6>
              <ul className="small text-muted">
                <li>Operaciones en lote</li>
                <li>Creación de promociones</li>
                <li>Gestión de inventario</li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6><i className="bi bi-journal-text me-2 text-warning" />Formularios</h6>
              <ul className="small text-muted">
                <li>Pedidos personalizados</li>
                <li>Cotizaciones</li>
                <li>Bundles de productos</li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6><i className="bi bi-graph-up me-2 text-primary" />Análisis</h6>
              <ul className="small text-muted">
                <li>Reportes por selección</li>
                <li>Análisis comparativo</li>
                <li>Estudios de mercado</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SelectionDemoPage