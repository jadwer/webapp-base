/**
 * STOCK TABLE
 * Tabla de stock con sorting, selección y acciones
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo } from 'react'
import type { Stock, StockSortOptions, Warehouse } from '../types'

interface StockTableProps {
  stock: Stock[]
  warehouses: Warehouse[]
  isLoading: boolean
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onEdit: (stock: Stock) => void
  onView: (stock: Stock) => void
  onDelete: (stock: Stock) => void
  sort: StockSortOptions | null
  onSortChange: (sort: StockSortOptions | null) => void
}

export const StockTable = memo<StockTableProps>(({
  stock,
  warehouses,
  isLoading,
  selectedIds,
  onSelectionChange,
  onEdit,
  onView,
  onDelete,
  sort,
  onSortChange
}) => {
  console.log('🔄 [StockTable] Rendering with', stock.length, 'stock entries')
  
  // Create warehouse lookup for performance
  const warehouseMap = React.useMemo(() => {
    return warehouses.reduce((acc, warehouse) => {
      acc[warehouse.id] = warehouse
      return acc
    }, {} as Record<string, Warehouse>)
  }, [warehouses])
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(stock.map(s => s.id))
    } else {
      onSelectionChange([])
    }
  }
  
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    }
  }
  
  const handleSort = (field: keyof Stock) => {
    if (sort?.field === field) {
      // Toggle direction
      const newDirection = sort.direction === 'asc' ? 'desc' : 'asc'
      onSortChange({ field, direction: newDirection })
    } else {
      // New field, start with asc
      onSortChange({ field, direction: 'asc' })
    }
  }
  
  const getSortIcon = (field: keyof Stock) => {
    if (sort?.field !== field) {
      return <i className="bi bi-arrow-down-up text-muted" />
    }
    return sort.direction === 'asc' 
      ? <i className="bi bi-arrow-up text-primary" />
      : <i className="bi bi-arrow-down text-primary" />
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD'
    })
  }
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'active': 'success',
      'inactive': 'secondary',
      'low': 'warning',
      'out': 'danger'
    }
    return variants[status] || 'secondary'
  }
  
  const getStockLevel = (stock: Stock) => {
    const percentage = stock.minimumStock 
      ? (stock.availableQuantity / stock.minimumStock) * 100
      : 100
    
    if (stock.availableQuantity <= 0) return 'out'
    if (percentage <= 100) return 'low'
    return 'normal'
  }
  
  const getStockLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'out': 'danger',
      'low': 'warning', 
      'normal': 'success'
    }
    return colors[level] || 'secondary'
  }
  
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading stock...</p>
        </div>
      </div>
    )
  }
  
  if (stock.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-box-seam display-1 text-muted" />
          <h5 className="mt-3">No stock found</h5>
          <p className="text-muted">Create your first stock entry to get started</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedIds.length === stock.length && stock.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Location</th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('quantity')}
              >
                Quantity {getSortIcon('quantity')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('availableQuantity')}
              >
                Available {getSortIcon('availableQuantity')}
              </th>
              <th>Reserved</th>
              <th>Min/Max</th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('unitCost')}
              >
                Unit Cost {getSortIcon('unitCost')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('totalValue')}
              >
                Total Value {getSortIcon('totalValue')}
              </th>
              <th>Stock Level</th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('lastMovementDate')}
              >
                Last Movement {getSortIcon('lastMovementDate')}
              </th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((stockItem) => {
              const warehouse = warehouseMap[stockItem.warehouseId]
              const stockLevel = getStockLevel(stockItem)
              
              return (
                <tr key={stockItem.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(stockItem.id)}
                      onChange={(e) => handleSelectOne(stockItem.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    {stockItem.product ? (
                      <div>
                        <div className="fw-semibold">{stockItem.product.name}</div>
                        <div className="small text-muted">{stockItem.product.sku}</div>
                      </div>
                    ) : (
                      <div className="small text-muted">Product ID: {stockItem.productId}</div>
                    )}
                  </td>
                  <td>
                    {warehouse ? (
                      <div>
                        <div className="small fw-semibold">{warehouse.name}</div>
                        <div className="small text-muted">{warehouse.code}</div>
                      </div>
                    ) : (
                      <div className="small text-muted">ID: {stockItem.warehouseId}</div>
                    )}
                  </td>
                  <td>
                    {stockItem.location ? (
                      <div>
                        <div className="small">{stockItem.location.name}</div>
                        <code className="small text-muted">{stockItem.location.code}</code>
                      </div>
                    ) : (
                      <div className="small text-muted">ID: {stockItem.warehouseLocationId}</div>
                    )}
                  </td>
                  <td>
                    <span className="fw-semibold">{stockItem.quantity.toLocaleString()}</span>
                  </td>
                  <td>
                    <span className={`fw-semibold text-${getStockLevelColor(stockLevel)}`}>
                      {stockItem.availableQuantity.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">
                      {stockItem.reservedQuantity.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div className="small">
                      {stockItem.minimumStock && (
                        <div><strong>Min:</strong> {stockItem.minimumStock.toLocaleString()}</div>
                      )}
                      {stockItem.maximumStock && (
                        <div><strong>Max:</strong> {stockItem.maximumStock.toLocaleString()}</div>
                      )}
                      {stockItem.reorderPoint && stockItem.reorderPoint > 0 && (
                        <div className="text-warning">
                          <strong>Reorder:</strong> {stockItem.reorderPoint.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {stockItem.unitCost ? (
                      <span className="small">{formatCurrency(stockItem.unitCost)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {stockItem.totalValue ? (
                      <span className="fw-semibold">{formatCurrency(stockItem.totalValue)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div 
                        className={`bg-${getStockLevelColor(stockLevel)} rounded-circle me-2`}
                        style={{ width: '8px', height: '8px' }}
                      />
                      <span className={`badge bg-${getStockLevelColor(stockLevel)} badge-sm`}>
                        {stockLevel.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge bg-${getStatusBadge(stockItem.status)}`}>
                      {stockItem.status}
                    </span>
                  </td>
                  <td>
                    <div className="small">
                      <div className="text-muted">{formatDate(stockItem.lastMovementDate)}</div>
                      {stockItem.lastMovementType && (
                        <div className="text-muted">{stockItem.lastMovementType}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        title="View"
                        onClick={() => onView(stockItem)}
                      >
                        <i className="bi bi-eye" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="Edit"
                        onClick={() => onEdit(stockItem)}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        title="Delete"
                        onClick={() => onDelete(stockItem)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})

StockTable.displayName = 'StockTable'