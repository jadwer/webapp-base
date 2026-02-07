'use client'

import { useState } from 'react'
import type { QuoteItem } from '../types'
import { useQuoteItemMutations } from '../hooks'
import { toast } from '@/lib/toast'

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
  } | null>(null)

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
      quantity: item.quantity
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
          quantity: editValues.quantity
        }
      })
      toast.success('Item actualizado')
      setEditingId(null)
      setEditValues(null)
      onItemsChanged?.()
    } catch (error) {
      toast.error('Error al actualizar el item')
      console.error(error)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await mutations.delete.mutateAsync(itemId)
      toast.success('Item eliminado')
      onItemsChanged?.()
    } catch (error) {
      toast.error('Error al eliminar el item')
      console.error(error)
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.subtotalBeforeDiscount ?? item.quantity * item.quotedPrice), 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0)
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0)

  if (items.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        No hay items en esta cotizacion
      </div>
    )
  }

  return (
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
                  {item.productName || `Producto #${item.productId}`}
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
  )
}
