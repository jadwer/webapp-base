'use client'

import { useState, useCallback } from 'react'
import type { QuoteItem, UpdateQuoteItemRequest } from '../types'
import { getQuoteItemStockStatus } from '../utils/stock'
import { useQuoteItemMutations } from '../hooks'
import { productService } from '@lwm/products'
import { toast } from '@lwm/ui'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  iva?: boolean
  // taxRate: null = Exento (0% IVA); number = tasa en % (16, 8, 0, custom).
  // undefined = el backend aun no trae este campo para este producto.
  taxRate?: number | null
}

type DiscountMode = 'percent' | 'amount'

// Borrador de edicion: los inputs guardan el texto tal cual (permite vaciar
// el campo mientras se teclea) y se parsea al guardar. 0 es valido para
// precio, descuento e IVA; cantidad minima 0.01 (igual que el backend).
interface EditDraft {
  quotedPrice: string
  quantity: string
  discountMode: DiscountMode
  discountValue: string
  taxRate: string
  notes: string
}

// Parsea un borrador: vacio o no numerico regresa null (error inline, no se guarda)
const parseDraftNumber = (raw: string): number | null => {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
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
  const [editValues, setEditValues] = useState<EditDraft | null>(null)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // Add product state
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addQuantity, setAddQuantity] = useState('1')
  const [addPrice, setAddPrice] = useState('0')
  const [addTaxRate, setAddTaxRate] = useState('16')
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

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
        iva: p.iva ?? true,
        taxRate: p.taxRate
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
    setAddPrice(String(product.price))
    setAddQuantity('1')
    // Default de IVA: prioriza taxRate (dato fiscal SAT real del producto)
    // sobre el flag legado iva. taxRate null = Exento -> 0% en la cotizacion
    // (el motor de cotizaciones no modela "exento" como estado propio, solo
    // tasa numerica; 0% es el equivalente correcto). Si taxRate no vino
    // (undefined, backend viejo o producto sin el campo), cae al flag iva.
    setAddTaxRate(String(product.taxRate ?? (product.iva ? 16 : 0)))
    setAddErrors({})
    setProductSearch(product.name)
    setSearchResults([])
  }

  const handleAddItem = async () => {
    if (!selectedProduct) return

    const quantity = parseDraftNumber(addQuantity)
    const price = parseDraftNumber(addPrice)
    const taxRate = parseDraftNumber(addTaxRate)

    const errors: Record<string, string> = {}
    if (quantity === null || quantity < 0.01) {
      errors.quantity = 'Cantidad minima 0.01'
    }
    if (price === null || price < 0) {
      errors.price = 'Precio invalido (0 es valido)'
    }
    if (taxRate === null || taxRate < 0 || taxRate > 100) {
      errors.taxRate = 'IVA entre 0 y 100'
    }
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors)
      return
    }
    setAddErrors({})

    try {
      await mutations.create.mutateAsync({
        quoteId: parseInt(quoteId),
        productId: parseInt(selectedProduct.id),
        quantity: quantity!,
        unitPrice: selectedProduct.price,
        quotedPrice: price!,
        taxRate: taxRate!,
        productName: selectedProduct.name,
        productSku: selectedProduct.sku
      })
      toast.success('Producto agregado')
      setIsAddingProduct(false)
      setSelectedProduct(null)
      setProductSearch('')
      setAddQuantity('1')
      setAddPrice('0')
      setAddTaxRate('16')
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

  // Stock helpers extraidos a ../utils/stock (Fase A): tambien los usan
  // GenerateSaleModal / GenerateOrderModal para el semaforo de stock.
  const getStockStatus = getQuoteItemStockStatus

  const handleStartEdit = (item: QuoteItem) => {
    setEditingId(item.id)
    setEditErrors({})
    setEditValues({
      quotedPrice: String(item.quotedPrice),
      quantity: String(item.quantity),
      discountMode: 'percent',
      discountValue: String(item.discountPercentage),
      taxRate: String(item.taxRate),
      notes: item.notes || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues(null)
    setEditErrors({})
  }

  const handleDiscountModeChange = (item: QuoteItem, mode: DiscountMode) => {
    setEditValues((prev) =>
      prev
        ? {
            ...prev,
            discountMode: mode,
            discountValue:
              mode === 'percent'
                ? String(item.discountPercentage)
                : String(item.discountAmount)
          }
        : prev
    )
    setEditErrors((prev) => {
      const next = { ...prev }
      delete next.discount
      return next
    })
  }

  const handleSaveEdit = async (itemId: string) => {
    if (!editValues) return

    const quantity = parseDraftNumber(editValues.quantity)
    const quotedPrice = parseDraftNumber(editValues.quotedPrice)
    const discountValue = parseDraftNumber(editValues.discountValue)
    const taxRate = parseDraftNumber(editValues.taxRate)

    const errors: Record<string, string> = {}
    if (quantity === null || quantity < 0.01) {
      errors.quantity = 'Cantidad minima 0.01'
    }
    if (quotedPrice === null || quotedPrice < 0) {
      errors.quotedPrice = 'Precio invalido (0 es valido)'
    }
    if (discountValue === null || discountValue < 0) {
      errors.discount = 'Descuento invalido'
    } else if (editValues.discountMode === 'percent' && discountValue > 100) {
      errors.discount = 'Maximo 100%'
    }
    if (taxRate === null || taxRate < 0 || taxRate > 100) {
      errors.taxRate = 'IVA entre 0 y 100'
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    // Se envia discountPercentage O discountAmount segun el modo, nunca ambos
    const data: UpdateQuoteItemRequest = {
      quantity: quantity!,
      quotedPrice: quotedPrice!,
      taxRate: taxRate!,
      notes: editValues.notes || undefined
    }
    if (editValues.discountMode === 'percent') {
      data.discountPercentage = discountValue!
    } else {
      data.discountAmount = discountValue!
    }

    try {
      await mutations.update.mutateAsync({ id: itemId, data })
      toast.success('Item actualizado')
      setEditingId(null)
      setEditValues(null)
      setEditErrors({})
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
                className={`form-control form-control-sm${addErrors.quantity ? ' is-invalid' : ''}`}
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                min={0.01}
                step={0.01}
              />
              {addErrors.quantity && (
                <div className="invalid-feedback d-block small">{addErrors.quantity}</div>
              )}
            </div>
            <div className="col-md-2">
              <label className="form-label small">Precio Cotizado</label>
              <input
                type="number"
                className={`form-control form-control-sm${addErrors.price ? ' is-invalid' : ''}`}
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                min={0}
                step={0.01}
              />
              {addErrors.price && (
                <div className="invalid-feedback d-block small">{addErrors.price}</div>
              )}
            </div>
            <div className="col-md-1">
              <label className="form-label small">IVA %</label>
              <input
                type="number"
                className={`form-control form-control-sm${addErrors.taxRate ? ' is-invalid' : ''}`}
                value={addTaxRate}
                onChange={(e) => setAddTaxRate(e.target.value)}
                min={0}
                max={100}
                step={0.01}
              />
              {addErrors.taxRate && (
                <div className="invalid-feedback d-block small">{addErrors.taxRate}</div>
              )}
            </div>
            <div className="col-md-3 d-flex gap-2">
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
                  setAddErrors({})
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
                    <div>
                      <input
                        type="number"
                        className={`form-control form-control-sm text-end${editErrors.quantity ? ' is-invalid' : ''}`}
                        style={{ width: '80px' }}
                        aria-label="Cantidad"
                        value={editValues?.quantity ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev!,
                            quantity: e.target.value
                          }))
                        }
                        min={0.01}
                        step={0.01}
                      />
                      {editErrors.quantity && (
                        <div className="invalid-feedback d-block small text-nowrap">{editErrors.quantity}</div>
                      )}
                    </div>
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="text-end text-muted">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="text-end">
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        className={`form-control form-control-sm text-end${editErrors.quotedPrice ? ' is-invalid' : ''}`}
                        style={{ width: '100px' }}
                        aria-label="Precio cotizado"
                        value={editValues?.quotedPrice ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev!,
                            quotedPrice: e.target.value
                          }))
                        }
                        min={0}
                        step={0.01}
                      />
                      {editErrors.quotedPrice && (
                        <div className="invalid-feedback d-block small text-nowrap">{editErrors.quotedPrice}</div>
                      )}
                    </div>
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
                    <div style={{ minWidth: '140px' }}>
                      <div className="input-group input-group-sm">
                        <input
                          type="number"
                          className={`form-control text-end${editErrors.discount ? ' is-invalid' : ''}`}
                          aria-label="Descuento"
                          value={editValues?.discountValue ?? ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev!,
                              discountValue: e.target.value
                            }))
                          }
                          min={0}
                          step={0.01}
                        />
                        <select
                          className="form-select"
                          style={{ maxWidth: '58px' }}
                          aria-label="Modo de descuento"
                          title="Descuento en porcentaje o monto"
                          value={editValues?.discountMode ?? 'percent'}
                          onChange={(e) =>
                            handleDiscountModeChange(item, e.target.value as DiscountMode)
                          }
                        >
                          <option value="percent">%</option>
                          <option value="amount">$</option>
                        </select>
                      </div>
                      {editErrors.discount && (
                        <div className="invalid-feedback d-block small text-nowrap">{editErrors.discount}</div>
                      )}
                    </div>
                  ) : (
                    <span className={item.discountPercentage > 0 ? 'text-success' : ''}>
                      {formatPercentage(item.discountPercentage)}
                      {item.discountAmount > 0 && (
                        <small className="text-muted d-block">-{formatCurrency(item.discountAmount)}</small>
                      )}
                    </span>
                  )}
                </td>
                <td className="text-end">
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        className={`form-control form-control-sm text-end${editErrors.taxRate ? ' is-invalid' : ''}`}
                        style={{ width: '80px' }}
                        aria-label="IVA %"
                        value={editValues?.taxRate ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev!,
                            taxRate: e.target.value
                          }))
                        }
                        min={0}
                        max={100}
                        step={0.01}
                      />
                      {editErrors.taxRate && (
                        <div className="invalid-feedback d-block small text-nowrap">{editErrors.taxRate}</div>
                      )}
                    </div>
                  ) : (
                    formatPercentage(item.taxRate)
                  )}
                </td>
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
