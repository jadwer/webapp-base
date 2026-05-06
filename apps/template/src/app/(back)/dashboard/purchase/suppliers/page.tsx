'use client'

import { useState } from 'react'
import { usePurchaseSuppliers } from '@/modules/purchase'
import { formatCurrency } from '@/lib/formatters'
import Link from 'next/link'

interface Supplier {
  id: string | number
  supplier_id?: string | number
  name?: string
  email?: string
  phone?: string
  totalPurchased?: number
  totalOrders?: number
  averageOrderValue?: number
  lastOrderDate?: string
}

export default function PurchaseSuppliersPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  // Calcular fechas según el período seleccionado - incluir datos históricos
  const getDateRange = (period: string) => {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    
    switch (period) {
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90days':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
        // Para datos históricos - las órdenes son de 1980s/1990s
        return {
          startDate: '1980-01-01',
          endDate
        }
      default:
        startDate.setDate(startDate.getDate() - 90)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate
    }
  }
  
  const { startDate, endDate } = getDateRange(selectedPeriod)
  const { suppliers, isLoading, error } = usePurchaseSuppliers(startDate, endDate)

  // Transform API response usando estructura específica de Purchase API
  const topSuppliers = (suppliers?.suppliers || []) as Supplier[]

  const handleTimeRangeChange = (period: string) => {
    setSelectedPeriod(period)
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-building me-3"></i>
                Proveedores de Compras
              </h1>
              <p className="text-muted">
                Análisis del rendimiento y relaciones con proveedores ({selectedPeriod === '30days' ? '30 días' : selectedPeriod === '90days' ? '90 días' : selectedPeriod === '1year' ? '1 año' : 'Todos los datos'})
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="btn-group">
                <button 
                  className={`btn btn-outline-primary ${selectedPeriod === '30days' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('30days')}
                  disabled={isLoading}
                >
                  30 días
                </button>
                <button 
                  className={`btn btn-outline-primary ${selectedPeriod === '90days' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('90days')}
                  disabled={isLoading}
                >
                  90 días
                </button>
                <button 
                  className={`btn btn-outline-primary ${selectedPeriod === '1year' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('1year')}
                  disabled={isLoading}
                >
                  1 año
                </button>
                <button 
                  className={`btn btn-outline-primary ${selectedPeriod === 'all' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('all')}
                  disabled={isLoading}
                >
                  Todos
                </button>
              </div>
              <Link 
                href="/dashboard/contacts" 
                className="btn btn-outline-primary"
              >
                <i className="bi bi-building-add me-2"></i>
                Gestionar Contactos
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-building me-2"></i>
                Top Proveedores - Datos Reales
              </h5>
              <div className="badge bg-primary">
                {topSuppliers.length} proveedores
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Total Comprado</th>
                      <th>Órdenes</th>
                      <th>Promedio por Orden</th>
                      <th>Última Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando proveedores...</span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {error && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="alert alert-danger">
                            Error al cargar datos: {error.message}
                          </div>
                        </td>
                      </tr>
                    )}

                    {!isLoading && !error && topSuppliers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-info-circle me-2"></i>
                            No hay datos de proveedores disponibles
                          </div>
                        </td>
                      </tr>
                    )}

                    {!isLoading && !error && topSuppliers.map((supplier: Supplier, index: number) => (
                      <tr key={supplier.id || supplier.supplier_id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`bg-${index === 0 ? 'primary' : index === 1 ? 'success' : 'info'} text-white rounded-circle d-flex align-items-center justify-content-center me-3`} 
                                 style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                              {supplier.name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="fw-bold">
                                {supplier.name || 'Proveedor sin nombre'}
                              </div>
                              <small className="text-muted">
                                {supplier.email && (
                                  <div>
                                    <i className="bi bi-envelope me-1"></i>
                                    {supplier.email}
                                  </div>
                                )}
                                {supplier.phone && (
                                  <div>
                                    <i className="bi bi-telephone me-1"></i>
                                    {supplier.phone}
                                  </div>
                                )}
                                {!supplier.email && !supplier.phone && `ID: ${supplier.id}`}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-primary">
                            {formatCurrency(supplier.totalPurchased || 0)}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {supplier.totalOrders || 0}
                          </span>
                        </td>
                        <td>
                          {formatCurrency(supplier.averageOrderValue || 0)}
                        </td>
                        <td>
                          <small className="text-muted">
                            {supplier.lastOrderDate 
                              ? new Date(supplier.lastOrderDate).toLocaleDateString('es-ES') 
                              : 'N/A'}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}