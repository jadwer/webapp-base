'use client'

import { useState, useEffect } from 'react'
import { usePurchaseProducts } from '../hooks'
import { formatCurrency } from '@/lib/formatters'

interface OrderItem {
  tempId: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface ItemsManagerProps {
  items: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
  onTotalChange: (total: number) => void
}

export default function ItemsManager({ items, onItemsChange, onTotalChange }: ItemsManagerProps) {
  const [productSearch, setProductSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { products, isLoading: productsLoading } = usePurchaseProducts(
    debouncedSearch ? { 'filter[search]': debouncedSearch } : {}
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0
  })

  // Calculate total whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0)
    onTotalChange(total)
  }, [items, onTotalChange])

  // Debounce search to avoid losing focus
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(productSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [productSearch])

  const handleProductChange = (productId: string) => {
    setNewItem(prev => ({ ...prev, productId }))
    
    if (productId) {
      const selectedProduct = products.find((p: any) => p.id === productId)
      if (selectedProduct) {
        const price = selectedProduct.attributes?.price || selectedProduct.attributes?.unit_price || 0
        setNewItem(prev => ({ 
          ...prev, 
          unitPrice: parseFloat(price) || 0 
        }))
      }
    }
  }

  const calculateItemTotal = (quantity: number, unitPrice: number, discount: number) => {
    return Math.max(0, (quantity * unitPrice) - discount)
  }

  const addItem = () => {
    if (!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice < 0) return

    const selectedProduct = products.find((p: any) => p.id === newItem.productId)
    const total = calculateItemTotal(newItem.quantity, newItem.unitPrice, newItem.discount)
    
    const item: OrderItem = {
      tempId: `temp_${Date.now()}`,
      productId: newItem.productId,
      productName: selectedProduct?.attributes?.name || `Producto #${newItem.productId}`,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      discount: newItem.discount,
      total
    }

    onItemsChange([...items, item])
    
    // Reset form
    setNewItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    })
    setShowAddForm(false)
  }

  const removeItem = (tempId: string) => {
    onItemsChange(items.filter(item => item.tempId !== tempId))
  }

  const updateItemQuantity = (tempId: string, quantity: number) => {
    const updatedItems = items.map(item => {
      if (item.tempId === tempId) {
        const total = calculateItemTotal(quantity, item.unitPrice, item.discount)
        return { ...item, quantity, total }
      }
      return item
    })
    onItemsChange(updatedItems)
  }

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="bi bi-box-seam me-2"></i>
          Items de la Orden de Compra
        </h5>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Item
        </button>
      </div>

      <div className="card-body">
        {/* Add Item Form */}
        {showAddForm && (
          <div className="border rounded p-3 mb-3 bg-light">
            <h6 className="mb-3">
              <i className="bi bi-plus me-2"></i>
              Nuevo Item
            </h6>
            
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label">Buscar Producto *</label>
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar por nombre o SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    disabled={productsLoading}
                  />
                  <small className="text-muted">
                    {productsLoading ? 'Buscando...' : `${products.length} productos encontrados`}
                  </small>
                </div>
                <select
                  className="form-select form-select-sm"
                  value={newItem.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  disabled={productsLoading}
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.attributes?.name || `Producto #${product.id}`}
                      {product.attributes?.sku && ` (${product.attributes.sku})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-2">
                <label className="form-label">Cantidad *</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div className="col-md-2">
                <label className="form-label">Precio *</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="0"
                  step="0.01"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="col-md-2">
                <label className="form-label">Descuento</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="0"
                  step="0.01"
                  value={newItem.discount}
                  onChange={(e) => setNewItem(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="col-md-2 d-flex align-items-end">
                <div className="btn-group w-100">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={addItem}
                    disabled={!newItem.productId || newItem.quantity <= 0}
                  >
                    <i className="bi bi-check"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-end">
              <small className="text-muted">
                Total: <strong className="text-success">
                  {formatCurrency(calculateItemTotal(newItem.quantity, newItem.unitPrice, newItem.discount))}
                </strong>
              </small>
            </div>
          </div>
        )}

        {/* Items Table */}
        {items.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{width: '80px'}}>Cantidad</th>
                  <th style={{width: '100px'}}>Precio</th>
                  <th style={{width: '100px'}}>Descuento</th>
                  <th style={{width: '100px'}}>Total</th>
                  <th style={{width: '60px'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.tempId}>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.tempId, parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td>
                      <small>{formatCurrency(item.unitPrice)}</small>
                    </td>
                    <td>
                      <small>{formatCurrency(item.discount)}</small>
                    </td>
                    <td>
                      <strong className="text-success">{formatCurrency(item.total)}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeItem(item.tempId)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={4} className="text-end">Total General:</th>
                  <th className="text-success fs-5">{formatCurrency(grandTotal)}</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4 mb-3"></i>
            <p>No hay items agregados</p>
            <small>Haz click en "Agregar Item" para comenzar</small>
          </div>
        )}
      </div>
    </div>
  )
}