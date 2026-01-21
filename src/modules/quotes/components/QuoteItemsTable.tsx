'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Pencil, Check, X, Package, AlertTriangle, CheckCircle2 } from 'lucide-react'
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
      <div className="text-center py-8 text-muted-foreground">
        No hay items en esta cotizacion
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-center">Stock</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Precio Orig.</TableHead>
          <TableHead className="text-right">Precio Cotiz.</TableHead>
          <TableHead className="text-right">Descuento</TableHead>
          <TableHead className="text-right">IVA</TableHead>
          <TableHead className="text-right">Total</TableHead>
          {editable && <TableHead className="text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isEditing = editingId === item.id

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.productName || `Producto #${item.productId}`}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.productSku || '-'}</TableCell>
              <TableCell className="text-center">
                {(() => {
                  const stockStatus = getStockStatus(item)
                  if (stockStatus.available === 0) {
                    return (
                      <span className="inline-flex items-center gap-1 text-red-600" title="Sin stock disponible">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">0</span>
                      </span>
                    )
                  }
                  if (stockStatus.lowStock) {
                    return (
                      <span className="inline-flex items-center gap-1 text-amber-600" title={`Stock insuficiente: ${stockStatus.available} disponibles, se requieren ${item.quantity}`}>
                        <Package className="h-4 w-4" />
                        <span className="text-xs">{stockStatus.available}</span>
                      </span>
                    )
                  }
                  return (
                    <span className="inline-flex items-center gap-1 text-green-600" title={`Stock suficiente: ${stockStatus.available} disponibles`}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs">{stockStatus.available}</span>
                    </span>
                  )
                })()}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues?.quantity ?? item.quantity}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev!,
                        quantity: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-20 text-right"
                    min={0.01}
                    step={0.01}
                  />
                ) : (
                  item.quantity
                )}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues?.quotedPrice ?? item.quotedPrice}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev!,
                        quotedPrice: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-24 text-right"
                    min={0}
                    step={0.01}
                  />
                ) : (
                  <span
                    className={
                      item.quotedPrice < item.unitPrice
                        ? 'text-green-600'
                        : item.quotedPrice > item.unitPrice
                          ? 'text-red-600'
                          : ''
                    }
                  >
                    {formatCurrency(item.quotedPrice)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues?.discountPercentage ?? item.discountPercentage}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev!,
                        discountPercentage: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-20 text-right"
                    min={0}
                    max={100}
                    step={0.01}
                  />
                ) : (
                  <span className={item.discountPercentage > 0 ? 'text-green-600' : ''}>
                    {formatPercentage(item.discountPercentage)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">{formatPercentage(item.taxRate)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
              {editable && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={mutations.update.isPending}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        disabled={mutations.delete.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={editable ? 7 : 6} />
          <TableCell className="text-right font-medium">Subtotal:</TableCell>
          <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
          {editable && <TableCell />}
        </TableRow>
        {totalDiscount > 0 && (
          <TableRow>
            <TableCell colSpan={editable ? 7 : 6} />
            <TableCell className="text-right font-medium text-green-600">Descuento:</TableCell>
            <TableCell className="text-right text-green-600">
              -{formatCurrency(totalDiscount)}
            </TableCell>
            {editable && <TableCell />}
          </TableRow>
        )}
        <TableRow>
          <TableCell colSpan={editable ? 7 : 6} />
          <TableCell className="text-right font-medium">IVA:</TableCell>
          <TableCell className="text-right">{formatCurrency(totalTax)}</TableCell>
          {editable && <TableCell />}
        </TableRow>
        <TableRow>
          <TableCell colSpan={editable ? 7 : 6} />
          <TableCell className="text-right font-bold">Total:</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
          {editable && <TableCell />}
        </TableRow>
      </TableFooter>
    </Table>
  )
}
