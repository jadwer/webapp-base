/**
 * WAREHOUSES TABLE
 * Tabla de warehouses con sorting, selección y acciones
 * Patrón basado en el éxito del módulo Products
 */

'use client'

import React, { memo } from 'react'
import type { Warehouse, WarehouseSortOptions } from '../types'

interface WarehousesTableProps {
  warehouses: Warehouse[]
  isLoading: boolean
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onEdit: (warehouse: Warehouse) => void
  onView: (warehouse: Warehouse) => void
  onDelete: (warehouse: Warehouse) => void
  sort: WarehouseSortOptions | null
  onSortChange: (sort: WarehouseSortOptions | null) => void
}

export const WarehousesTable = memo<WarehousesTableProps>(({
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
  console.log('🔄 [WarehousesTable] Rendering with', warehouses.length, 'warehouses')
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(warehouses.map(w => w.id))
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
  
  const handleSort = (field: keyof Warehouse) => {
    if (sort?.field === field) {
      // Toggle direction
      const newDirection = sort.direction === 'asc' ? 'desc' : 'asc'
      onSortChange({ field, direction: newDirection })
    } else {
      // New field, start with asc
      onSortChange({ field, direction: 'asc' })
    }
  }
  
  const getSortIcon = (field: keyof Warehouse) => {
    if (sort?.field !== field) {
      return <i className="bi bi-arrow-down-up text-muted" />
    }
    return sort.direction === 'asc' 
      ? <i className="bi bi-arrow-up text-primary" />
      : <i className="bi bi-arrow-down text-primary" />
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const getWarehouseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'main': 'Principal',
      'secondary': 'Secundario',
      'distribution': 'Distribución',
      'returns': 'Devoluciones'
    }
    return types[type] || type
  }
  
  const getWarehouseTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'main': 'primary',
      'secondary': 'info',
      'distribution': 'success',
      'returns': 'warning'
    }
    return variants[type] || 'secondary'
  }
  
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading warehouses...</p>
        </div>
      </div>
    )
  }
  
  if (warehouses.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-building display-1 text-muted" />
          <h5 className="mt-3">No warehouses found</h5>
          <p className="text-muted">Create your first warehouse to get started</p>
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
                  checked={selectedIds.length === warehouses.length && warehouses.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('code')}
              >
                Code {getSortIcon('code')}
              </th>
              <th>Type</th>
              <th>Address</th>
              <th>Manager</th>
              <th>Capacity</th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('isActive')}
              >
                Status {getSortIcon('isActive')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('createdAt')}
              >
                Created {getSortIcon('createdAt')}
              </th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(warehouse.id)}
                    onChange={(e) => handleSelectOne(warehouse.id, e.target.checked)}
                  />
                </td>
                <td>
                  <div className="fw-semibold">{warehouse.name}</div>
                  {warehouse.description && (
                    <small className="text-muted">{warehouse.description}</small>
                  )}
                </td>
                <td>
                  <code className="text-dark">{warehouse.code}</code>
                </td>
                <td>
                  <span className={`badge bg-${getWarehouseTypeBadge(warehouse.warehouseType)}`}>
                    {getWarehouseTypeLabel(warehouse.warehouseType)}
                  </span>
                </td>
                <td>
                  {warehouse.address && (
                    <div>
                      <div className="small">{warehouse.address}</div>
                      {(warehouse.city || warehouse.state) && (
                        <div className="small text-muted">
                          {[warehouse.city, warehouse.state].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {warehouse.managerName && (
                    <div>
                      <div className="small">{warehouse.managerName}</div>
                      {warehouse.email && (
                        <div className="small text-muted">{warehouse.email}</div>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {warehouse.maxCapacity && (
                    <div className="small">
                      {warehouse.maxCapacity.toLocaleString()} {warehouse.capacityUnit}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'}`}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <small className="text-muted">
                    {formatDate(warehouse.createdAt)}
                  </small>
                </td>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      title="View"
                      onClick={() => onView(warehouse)}
                    >
                      <i className="bi bi-eye" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      title="Edit"
                      onClick={() => onEdit(warehouse)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      title="Delete"
                      onClick={() => onDelete(warehouse)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

WarehousesTable.displayName = 'WarehousesTable'