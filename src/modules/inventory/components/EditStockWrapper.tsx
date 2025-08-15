'use client'

import { StockForm } from './StockForm'
import { useStockItem, useStockMutations } from '../hooks'

interface EditStockWrapperProps {
  stockId: string
}

export const EditStockWrapper = ({ stockId }: EditStockWrapperProps) => {
  const { stockItem: stock, isLoading: isLoadingStock, error } = useStockItem(stockId, ['product', 'warehouse', 'location'])
  const { updateStock } = useStockMutations()
  
  const handleSubmit = async (data: any) => {
    await updateStock(stockId, data)
  }
  
  if (isLoadingStock) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando datos del stock...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-danger">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 text-danger">Error al cargar el stock</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del stock'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!stock) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-boxes" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Stock no encontrado</h4>
                <p className="text-muted">El registro de stock solicitado no existe o no está disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Convert JSON:API format to form format  
  const stockForForm = {
    ...stock.attributes,
    id: stock.id
  }
  
  return (
    <StockForm
      stock={stockForForm}
      onSubmit={handleSubmit}
      isEditing={true}
    />
  )
}