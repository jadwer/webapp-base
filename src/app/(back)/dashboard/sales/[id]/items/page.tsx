'use client'

import { useState, use } from 'react'
import { useSalesOrderItems } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import AddItemModal from '@/modules/sales/components/AddItemModal'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SalesOrderItemsPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const navigation = useNavigationProgress()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const { salesOrderItems, isLoading, error, mutate } = useSalesOrderItems(resolvedParams.id)

  // Debug: Check what data we're actually receiving
  console.log('🔍 [Debug] Sales Order Items Raw Data:', salesOrderItems)
  if (salesOrderItems && salesOrderItems.length > 0) {
    console.log('🔍 [Debug] First Item Fields:', Object.keys(salesOrderItems[0]))
    console.log('🔍 [Debug] First Item Data:', salesOrderItems[0])
  }

  const filteredItems = salesOrderItems?.filter((item: any) => 
    searchTerm === '' || 
    item.productId?.toString().includes(searchTerm) ||
    item.id?.toString().includes(searchTerm)
  )

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-box-seam me-3"></i>
                Items de Orden #{resolvedParams.id}
              </h1>
              <p className="text-muted">
                Productos incluidos en esta orden de venta
              </p>
            </div>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigation.back()}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a la Orden
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por ID de producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-funnel"></i> Filtros
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-download"></i> Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Items */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Items de la Orden
                {filteredItems?.length > 0 && (
                  <span className="badge bg-primary ms-2">{filteredItems.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {isLoading && (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando items...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error al cargar los items: {error.message}
                </div>
              )}

              {!isLoading && !error && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>ID Item</th>
                        <th>Producto ID</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Descuento</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems && filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                            <h6>No hay items en esta orden</h6>
                            <p className="mb-0">
                              Agrega productos a esta orden de venta
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredItems?.map((item: any) => (
                          <tr key={item.id}>
                            <td>
                              <strong className="text-primary">#{item.id}</strong>
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">
                                  {item.product?.attributes?.name || item.product?.name || `Producto #${item.productId}`}
                                </div>
                                <small className="text-muted">
                                  SKU: {item.product?.attributes?.sku || item.product?.sku || item.productId}
                                </small>
                              </div>
                            </td>
                            <td>
                              <strong>{formatQuantity(item.quantity)}</strong>
                            </td>
                            <td>
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td>
                              {item.discount > 0 ? (
                                <span className="text-warning">
                                  -{formatCurrency(item.discount)}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <strong className="text-success">
                                {formatCurrency(item.totalPrice || item.total || (item.quantity * item.unitPrice) - (item.discount || 0))}
                              </strong>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button className="btn btn-outline-danger">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {filteredItems && filteredItems.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Total Items</h6>
                    <h4 className="mb-0">{filteredItems.length}</h4>
                  </div>
                  <i className="bi bi-box display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Cantidad Total</h6>
                    <h4 className="mb-0">
                      {formatQuantity(filteredItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0))}
                    </h4>
                  </div>
                  <i className="bi bi-calculator display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-info">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Valor Total</h6>
                    <h4 className="mb-0">
                      {formatCurrency(filteredItems.reduce((acc: number, item: any) => acc + (item.total || item.totalPrice || 0), 0))}
                    </h4>
                  </div>
                  <i className="bi bi-currency-dollar display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Item Modal */}
      <AddItemModal
        salesOrderId={resolvedParams.id}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          mutate() // Refresh the items list
          setShowAddModal(false)
        }}
      />
    </div>
  )
}