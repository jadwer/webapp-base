'use client'

import { useState, useEffect } from 'react'
import { usePurchaseProducts, usePurchaseOrderItemMutations } from '../hooks'
import { formatCurrency } from '@/lib/formatters'

interface AddItemModalProps {
  purchaseOrderId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddItemModal({ purchaseOrderId, isOpen, onClose, onSuccess }: AddItemModalProps) {
  const { products, isLoading: productsLoading } = usePurchaseProducts()
  const { createPurchaseOrderItem } = usePurchaseOrderItemMutations()
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Calcular total
  const total = (formData.quantity * formData.unitPrice) - formData.discount
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0
      })
      setError(null)
    }
  }, [isOpen])
  
  // Update unit price when product changes
  const handleProductChange = (productId: string) => {
    setFormData(prev => ({ ...prev, productId }))
    
    if (productId) {
      const selectedProduct = products.find((p: any) => p.id === productId)
      if (selectedProduct) {
        // Use product price if available
        const price = selectedProduct.attributes?.price || selectedProduct.attributes?.unit_price || 0
        setFormData(prev => ({ ...prev, unitPrice: parseFloat(price) || 0 }))
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const itemData = {
        purchaseOrderId,
        productId: parseInt(formData.productId),
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        discount: formData.discount
      }
      
      console.log('🚀 Creating purchase order item:', itemData)
      await createPurchaseOrderItem(itemData)
      
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('❌ Error creating item:', err)
      setError(err.response?.data?.message || err.message || 'Error al agregar el item')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Item a la Orden de Compra
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">
                    Producto <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required
                    disabled={productsLoading || isSubmitting}
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.attributes?.name || `Producto #${product.id}`} 
                        {product.attributes?.sku && ` (SKU: ${product.attributes.sku})`}
                        {product.attributes?.price && ` - ${formatCurrency(product.attributes.price)}`}
                      </option>
                    ))}
                  </select>
                  {productsLoading && (
                    <small className="text-muted">Cargando productos...</small>
                  )}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">
                    Cantidad <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">
                    Precio Unitario <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Descuento</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="col-12">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3">
                          <small className="text-muted">Cantidad</small>
                          <div className="fw-bold">{formData.quantity}</div>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">Precio Unitario</small>
                          <div className="fw-bold">{formatCurrency(formData.unitPrice)}</div>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">Descuento</small>
                          <div className="fw-bold text-warning">{formatCurrency(formData.discount)}</div>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">Total</small>
                          <div className="fw-bold text-success fs-5">{formatCurrency(total)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.productId || !formData.quantity || !formData.unitPrice}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Agregando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Agregar Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}