'use client'

import { useState, useCallback } from 'react'
import type { QuoteItem } from '../types'
import { useQuoteItemMutations } from '../hooks'
import { productService } from '@/modules/products/services'
import { toast } from '@/lib/toast'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  iva?: boolean
}

interface QuoteItemsTableProps {
  items: QuoteItem[]
  quoteId: string
  currency?: string
  editable?: boolean
  onItemsChanged?: () => void
}

export function QuoteItemsTable({
  items,
  quoteId,
  currency = 'MXN',
  editable = false,
  onItemsChanged
}: QuoteItemsTableProps) {
  const mutations = useQuoteItemMutations(quoteId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    quotedPrice: number
    discountPercentage: number
    quantity: number
    notes: string
  } | null>(null)

  // Add product state
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addQuantity, setAddQuantity] = useState(1)
  const [addPrice, setAddPrice] = useState(0)

  const searchProducts = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await productService.getProducts({
        filters: { name: term },
        page: { size: 20 }
      })
      const products: Product[] = (response.data || []).map((p) => ({
        id: String(p.id),
        name: p.name || '',
        sku: p.sku || '',
        price: p.price || 0,
        iva: p.iva ?? true
      }))
      setSearchResults(products)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setAddPrice(product.price)
    setAddQuantity(1)
    setProductSearch(product.name)
    setSearchResults([])
  }

  const handleAddItem = async () => {
    if (!selectedProduct) return
    try {
      await mutations.create.mutateAsync({
        quoteId: parseInt(quoteId),
        productId: parseInt(selectedProduct.id),
        quantity: addQuantity,
        unitPrice: selectedProduct.price,
        quotedPrice: addPrice,
        taxRate: selectedProduct.iva ? 16 : 0,
        productName: selectedProduct.name,
        productSku: selectedProduct.sku
      })
      toast.success('Producto agregado')
      setIsAddingProduct(false)
      setSelectedProduct(null)
      setProductSearch('')
      setAddQuantity(1)
      setAddPrice(0)
      onItemsChanged?.()
    } catch {
      toast.error('Error al agregar el producto')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Calculate total available stock across all warehouses
  const getTotalAvailableStock = (item: QuoteItem): number => {
    if (!item.product?.stock || item.product.stock.length === 0) return 0
    return item.product.stock.reduce((sum, s) => sum + (s.availableQuantity || 0), 0)
  }

  // Get stock status for display
  const getStockStatus = (item: QuoteItem): { available: number; sufficient: boolean; lowStock: boolean } => {
    const available = getTotalAvailableStock(item)
    return {
      available,
      sufficient: available >= item.quantity,
      lowStock: available > 0 && available < item.quantity
    }
  }

  const handleStartEdit = (item: QuoteItem) => {
    setEditingId(item.id)
    setEditValues({
      quotedPrice: item.quotedPrice,
      discountPercentage: item.discountPercentage,
      quantity: item.quantity,
      notes: item.notes || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues(null)
  }

  const handleSaveEdit = async (itemId: string) => {
    if (!editValues) return

    try {
      await mutations.update.mutateAsync({
        id: itemId,
        data: {
          quotedPrice: editValues.quotedPrice,
          discountPercentage: editValues.discountPercentage,
          quantity: editValues.quantity,
          notes: editValues.notes || undefined
        }
      })
      toast.success('Item actualizado')
      setEditingId(null)
      setEditValues(null)
      onItemsChanged?.()
    } catch {
      toast.error('Error al actualizar el item')
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await mutations.delete.mutateAsync(itemId)
      toast.success('Item eliminado')
      onItemsChanged?.()
    } catch {
      toast.error('Error al eliminar el item')
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.subtotalBeforeDiscount ?? item.quantity * item.quotedPrice), 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0)
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0)

  if (items.length === 0 && !isAddingProduct) {
    return (
      <div className="text-center py-5 text-muted">
        <p className="mb-2">No hay items en esta cotizacion</p>
        {editable && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setIsAddingProduct(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Agregar Producto
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Add Product Button */}
      {editable && !isAddingProduct && (
        <div className="p-3 border-bottom">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setIsAddingProduct(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Agregar Producto
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {isAddingProduct && (
        <div className="p-3 border-bottom bg-light">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label small">Producto</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar por nombre o SKU..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setSelectedProduct(null)
                    searchProducts(e.target.value)
                  }}
                  autoFocus
                />
                {isSearching && (
                  <div className="position-absolute end-0 top-50 translate-middle-y me-2">
                    <span className="spinner-border spinner-border-sm"></span>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="position-absolute w-100 bg-white border rounded-bottom shadow-sm" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="btn btn-link text-start w-100 text-decoration-none px-3 py-2 border-bottom"
                        onClick={() => handleSelectProduct(p)}
                      >
                        <div className="fw-medium">{p.name}</div>
                        <small className="text-muted">{p.sku} - ${p.price.toFixed(2)}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Cantidad</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={addQuantity}
                onChange={(e) => setAddQuantity(parseFloat(e.target.value) || 1)}
                min={0.01}
                step={0.01}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Precio Cotizado</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={addPrice}
                onChange={(e) => setAddPrice(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.01}
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddItem}
                disabled={!selectedProduct || mutations.create.isPending}
              >
                {mutations.create.isPending ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="bi bi-plus me-1"></i>
                    Agregar
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setIsAddingProduct(false)
                  setSelectedProduct(null)
                  setProductSearch('')
                  setSearchResults([])
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th className="text-center">Stock</th>
            <th className="text-end">Cantidad</th>
            <th className="text-end">Precio Orig.</th>
            <th className="text-end">Precio Cotiz.</th>
            <th className="text-end">Descuento</th>
            <th className="text-end">IVA</th>
            <th className="text-end">Total</th>
            {editable && <th className="text-end">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isEditing = editingId === item.id
            const stockStatus = getStockStatus(item)

            return (
              <tr key={item.id}>
                <td className="fw-medium">
                  <div>{item.productName || `Producto #${item.productId}`}</div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control form-control-sm mt-1"
                      value={editValues?.notes ?? ''}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev!,
                          notes: e.target.value
                        }))
                      }
                      placeholder="Notas (ETA, detalles, etc.)"
                      maxLength={1000}
                    />
                  ) : item.notes ? (
                    <small className="text-muted d-block">{item.notes}</small>
                  ) : null}
                </td>
                <td className="text-muted">{item.productSku || '-'}</td>
                <td className="text-center">
                  {stockStatus.available === 0 ? (
                    <span className="text-danger" title="Sin stock disponible">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      <small>0</small>
                    </span>
                  ) : stockStatus.lowStock ? (
                    <span className="text-warning" title={`Stock insuficiente: ${stockStatus.available} disponibles, se requieren ${item.quantity}`}>
                      <i className="bi bi-box me-1"></i>
                      <small>{stockStatus.available}</small>
                    </span>
                  ) : (
                    <span className="text-success" title={`Stock suficiente: ${stockStatus.available} disponibles`}>
                      <i className="bi bi-check-circle me-1"></i>
                      <small>{stockStatus.available}</small>
                    </span>
                  )}
                </td>
                <td className="text-end">
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control form-control-sm text-end"
                      style={{ width: '80px' }}
                      value={editValues?.quantity ?? item.quantity}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev!,
                          quantity: parseFloat(e.target.value) || 0
                        }))
                      }
                      min={0.01}
                      step={0.01}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="text-end text-muted">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="text-end">
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control form-control-sm text-end"
                      style={{ width: '100px' }}
                      value={editValues?.quotedPrice ?? item.quotedPrice}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev!,
                          quotedPrice: parseFloat(e.target.value) || 0
                        }))
                      }
                      min={0}
                      step={0.01}
                    />
                  ) : (
                    <span
                      className={
                        item.quotedPrice < item.unitPrice
                          ? 'text-success'
                          : item.quotedPrice > item.unitPrice
                            ? 'text-danger'
                            : ''
                      }
                    >
                      {formatCurrency(item.quotedPrice)}
                    </span>
                  )}
                </td>
                <td className="text-end">
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control form-control-sm text-end"
                      style={{ width: '80px' }}
                      value={editValues?.discountPercentage ?? item.discountPercentage}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev!,
                          discountPercentage: parseFloat(e.target.value) || 0
                        }))
                      }
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  ) : (
                    <span className={item.discountPercentage > 0 ? 'text-success' : ''}>
                      {formatPercentage(item.discountPercentage)}
                    </span>
                  )}
                </td>
                <td className="text-end">{formatPercentage(item.taxRate)}</td>
                <td className="text-end fw-medium">{formatCurrency(item.total)}</td>
                {editable && (
                  <td className="text-end">
                    {isEditing ? (
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={mutations.update.isPending}
                          title="Guardar"
                        >
                          <i className="bi bi-check"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleCancelEdit}
                          title="Cancelar"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleStartEdit(item)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(item.id)}
                          disabled={mutations.delete.isPending}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        <tfoot className="table-light">
          <tr>
            <td colSpan={editable ? 7 : 6}></td>
            <td className="text-end fw-medium">Subtotal:</td>
            <td className="text-end">{formatCurrency(subtotal)}</td>
            {editable && <td></td>}
          </tr>
          {totalDiscount > 0 && (
            <tr>
              <td colSpan={editable ? 7 : 6}></td>
              <td className="text-end fw-medium text-success">Descuento:</td>
              <td className="text-end text-success">-{formatCurrency(totalDiscount)}</td>
              {editable && <td></td>}
            </tr>
          )}
          <tr>
            <td colSpan={editable ? 7 : 6}></td>
            <td className="text-end fw-medium">IVA:</td>
            <td className="text-end">{formatCurrency(totalTax)}</td>
            {editable && <td></td>}
          </tr>
          <tr>
            <td colSpan={editable ? 7 : 6}></td>
            <td className="text-end fw-bold">Total:</td>
            <td className="text-end fw-bold text-primary">{formatCurrency(grandTotal)}</td>
            {editable && <td></td>}
          </tr>
        </tfoot>
      </table>
    </div>
    </div>
  )
}
