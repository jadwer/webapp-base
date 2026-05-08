/**
 * Phase 13: Advanced Sales Reports Page
 *
 * Features:
 * - Sales by Employee with profitability metrics
 * - Sales by Batch (lot traceability)
 * - Sales Profitability analysis
 * - Sales Trend with interactive chart
 * - Date range presets (Today, 7 days, 30 days, This month, This year)
 * - Export to CSV/Excel
 */

'use client'

import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  useSalesByEmployee,
  useSalesByBatch,
  useSalesProfitability,
  useSalesTrend,
  useReportExport,
} from '../hooks'

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B']

// Date presets
const DATE_PRESETS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Ultimos 7 dias', value: '7days' },
  { label: 'Ultimos 30 dias', value: '30days' },
  { label: 'Este mes', value: 'thisMonth' },
  { label: 'Mes pasado', value: 'lastMonth' },
  { label: 'Este ano', value: 'thisYear' },
  { label: 'Personalizado', value: 'custom' },
]

const getPresetDates = (preset: string): { startDate: string; endDate: string } => {
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]

  switch (preset) {
    case 'today':
      return { startDate: endDate, endDate }
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yd = yesterday.toISOString().split('T')[0]
      return { startDate: yd, endDate: yd }
    }
    case '7days': {
      const d7 = new Date(today)
      d7.setDate(d7.getDate() - 7)
      return { startDate: d7.toISOString().split('T')[0], endDate }
    }
    case '30days': {
      const d30 = new Date(today)
      d30.setDate(d30.getDate() - 30)
      return { startDate: d30.toISOString().split('T')[0], endDate }
    }
    case 'thisMonth': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: firstDay.toISOString().split('T')[0], endDate }
    }
    case 'lastMonth': {
      const firstDayLast = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0)
      return { startDate: firstDayLast.toISOString().split('T')[0], endDate: lastDayLast.toISOString().split('T')[0] }
    }
    case 'thisYear': {
      const jan1 = new Date(today.getFullYear(), 0, 1)
      return { startDate: jan1.toISOString().split('T')[0], endDate }
    }
    default:
      return { startDate: endDate, endDate }
  }
}

// Map active tab to report type for export
const TAB_TO_REPORT_TYPE: Record<string, string> = {
  employee: 'sales-by-employee',
  batch: 'sales-by-batch',
  profitability: 'sales-profitability',
  trend: 'sales-trend',
}

export const SalesAdvancedReportsPage = () => {
  // Date range state
  const [datePreset, setDatePreset] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [activeTab, setActiveTab] = useState<'employee' | 'batch' | 'profitability' | 'trend'>('employee')
  const [trendGroupBy, setTrendGroupBy] = useState<'day' | 'week' | 'month'>('day')

  // Advanced filter state
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Export hook
  const { exportReport, isExporting } = useReportExport()

  // Calculate dates based on preset or custom
  const { startDate, endDate } = useMemo(() => {
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate || new Date().toISOString().split('T')[0],
        endDate: customEndDate || new Date().toISOString().split('T')[0],
      }
    }
    return getPresetDates(datePreset)
  }, [datePreset, customStartDate, customEndDate])

  // Fetch data with filters
  const { salesByEmployee, isLoading: loadingEmployee } = useSalesByEmployee({
    startDate,
    endDate,
    ...(employeeFilter ? { employeeId: parseInt(employeeFilter) } : {}),
  })
  const { salesByBatch, isLoading: loadingBatch } = useSalesByBatch({
    startDate,
    endDate,
    ...(productFilter ? { productId: parseInt(productFilter) } : {}),
    ...(batchFilter ? { batchNumber: batchFilter } : {}),
  })
  const { salesProfitability, isLoading: loadingProfitability } = useSalesProfitability({
    startDate,
    endDate,
    ...(categoryFilter ? { categoryId: parseInt(categoryFilter) } : {}),
  })
  const { salesTrend, isLoading: loadingTrend } = useSalesTrend({ startDate, endDate, groupBy: trendGroupBy })

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0.00'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return '0%'
    return `${value.toFixed(1)}%`
  }

  // Handler for export - uses active tab to determine report type
  const handleExport = async (format: 'csv' | 'xlsx') => {
    const reportType = TAB_TO_REPORT_TYPE[activeTab] || 'sales-by-employee'
    const params: Record<string, string | number> = { start_date: startDate, end_date: endDate }
    if (activeTab === 'employee' && employeeFilter) params.employee_id = parseInt(employeeFilter)
    if (activeTab === 'batch' && productFilter) params.product_id = parseInt(productFilter)
    if (activeTab === 'batch' && batchFilter) params.batch_number = batchFilter
    if (activeTab === 'profitability' && categoryFilter) params.category_id = parseInt(categoryFilter)
    if (activeTab === 'trend') params.group_by = trendGroupBy
    const filename = `${reportType}_${startDate}_${endDate}.${format}`
    await exportReport(reportType, params, format, filename)
  }

  // Clear advanced filters
  const clearFilters = () => {
    setEmployeeFilter('')
    setProductFilter('')
    setCategoryFilter('')
    setBatchFilter('')
  }

  const hasActiveFilters = employeeFilter || productFilter || categoryFilter || batchFilter

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-graph-up-arrow me-3" />
                Reportes Avanzados de Ventas
              </h1>
              <p className="text-muted mb-0">
                Analisis de rentabilidad, tendencias y trazabilidad por lote
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Periodo</label>
              <select
                className="form-select"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
              >
                {DATE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {datePreset === 'custom' && (
              <>
                <div className="col-12 col-md-2">
                  <label className="form-label small text-muted mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label small text-muted mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="col-auto">
              <button
                className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <i className="bi bi-funnel me-1" />
                Filtros
                {hasActiveFilters && <span className="badge bg-danger ms-1">!</span>}
              </button>
            </div>

            <div className="col-auto ms-auto">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                >
                  <i className="bi bi-download me-1" />
                  CSV
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handleExport('xlsx')}
                  disabled={isExporting}
                >
                  <i className="bi bi-file-earmark-excel me-1" />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="row g-3 mt-2 pt-3 border-top">
              {/* Employee filter - relevant for "Por Vendedor" tab */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-person me-1" />
                  ID Vendedor
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="ID del vendedor"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
                <small className="text-muted">Filtra tab &quot;Por Vendedor&quot;</small>
              </div>

              {/* Product filter - relevant for "Por Lote" tab */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-box me-1" />
                  ID Producto
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="ID del producto"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                />
                <small className="text-muted">Filtra tab &quot;Por Lote&quot;</small>
              </div>

              {/* Batch filter - relevant for "Por Lote" tab */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-upc me-1" />
                  Numero de Lote
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: BATCH-001"
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                />
                <small className="text-muted">Filtra tab &quot;Por Lote&quot;</small>
              </div>

              {/* Category filter - relevant for "Rentabilidad" tab */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-tags me-1" />
                  ID Categoria
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="ID de la categoria"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
                <small className="text-muted">Filtra tab &quot;Rentabilidad&quot;</small>
              </div>

              {hasActiveFilters && (
                <div className="col-12">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-x-circle me-1" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'employee' ? 'active' : ''}`}
            onClick={() => setActiveTab('employee')}
          >
            <i className="bi bi-people me-2" />
            Por Vendedor
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <i className="bi bi-box-seam me-2" />
            Por Lote
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'profitability' ? 'active' : ''}`}
            onClick={() => setActiveTab('profitability')}
          >
            <i className="bi bi-cash-stack me-2" />
            Rentabilidad
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'trend' ? 'active' : ''}`}
            onClick={() => setActiveTab('trend')}
          >
            <i className="bi bi-graph-up me-2" />
            Tendencia
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Sales by Employee Tab */}
        {activeTab === 'employee' && (
          <div className="tab-pane fade show active">
            {loadingEmployee ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : salesByEmployee ? (
              <div className="row g-4">
                {/* Summary Cards */}
                <div className="col-12">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Total Ventas</div>
                          <div className="h3 mb-0">{formatCurrency(salesByEmployee.summary?.totalSales)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Utilidad Bruta</div>
                          <div className="h3 mb-0">{formatCurrency(salesByEmployee.summary?.totalProfit)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-info text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Margen Promedio</div>
                          <div className="h3 mb-0">{formatPercent(salesByEmployee.summary?.averageMargin)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-secondary text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Total Ordenes</div>
                          <div className="h3 mb-0">{salesByEmployee.summary?.totalOrders || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header">
                      <h6 className="mb-0">Ventas por Vendedor</h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByEmployee.employees?.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="employeeName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
                            labelFormatter={(label) => `Vendedor: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="totalSales" name="Ventas" fill="#0088FE" />
                          <Bar dataKey="grossProfit" name="Utilidad" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Margin Pie Chart */}
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header">
                      <h6 className="mb-0">Distribucion de Ventas</h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={salesByEmployee.employees?.slice(0, 5) as unknown as Array<Record<string, unknown>>}
                            dataKey="totalSales"
                            nameKey="employeeName"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {salesByEmployee.employees?.slice(0, 5).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Detalle por Vendedor</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Vendedor</th>
                              <th className="text-center">Ordenes</th>
                              <th className="text-end">Ventas</th>
                              <th className="text-end">Costo</th>
                              <th className="text-end">Utilidad</th>
                              <th className="text-end">Margen</th>
                              <th className="text-end">Ticket Prom.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesByEmployee.employees?.map((emp) => (
                              <tr key={emp.employeeId ?? 'unassigned'}>
                                <td>
                                  <strong>{emp.employeeName}</strong>
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-primary">{emp.orderCount}</span>
                                </td>
                                <td className="text-end">{formatCurrency(emp.totalSales)}</td>
                                <td className="text-end text-muted">{formatCurrency(emp.totalCost)}</td>
                                <td className="text-end text-success">
                                  <strong>{formatCurrency(emp.grossProfit)}</strong>
                                </td>
                                <td className="text-end">
                                  <span className={`badge ${emp.marginPercentage >= 30 ? 'bg-success' : emp.marginPercentage >= 15 ? 'bg-warning' : 'bg-danger'}`}>
                                    {formatPercent(emp.marginPercentage)}
                                  </span>
                                </td>
                                <td className="text-end">{formatCurrency(emp.averageOrderValue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">No hay datos disponibles para este periodo</div>
            )}
          </div>
        )}

        {/* Sales by Batch Tab */}
        {activeTab === 'batch' && (
          <div className="tab-pane fade show active">
            {loadingBatch ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : salesByBatch?.batches?.length ? (
              <div className="row g-4">
                {/* Summary */}
                <div className="col-12">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="card bg-info text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Lotes Vendidos</div>
                          <div className="h3 mb-0">{salesByBatch.summary?.totalBatches || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Cantidad Total</div>
                          <div className="h3 mb-0">{salesByBatch.summary?.totalQuantitySold?.toFixed(0) || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <div className="small text-white-50">Ingreso Estimado</div>
                          <div className="h3 mb-0">{formatCurrency(salesByBatch.summary?.totalRevenue)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-warning text-dark">
                        <div className="card-body">
                          <div className="small text-dark">Margen Promedio</div>
                          <div className="h3 mb-0">{formatPercent(salesByBatch.summary?.averageMargin)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch Table */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Trazabilidad por Lote</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Lote</th>
                              <th>Producto</th>
                              <th>SKU</th>
                              <th className="text-center">Vencimiento</th>
                              <th className="text-end">Cantidad</th>
                              <th className="text-end">Costo Unit.</th>
                              <th className="text-end">Ingreso Est.</th>
                              <th className="text-end">Margen</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesByBatch.batches?.map((batch) => (
                              <tr key={batch.batchId}>
                                <td>
                                  <code className="text-primary">{batch.batchNumber}</code>
                                  {batch.lotNumber && <small className="d-block text-muted">{batch.lotNumber}</small>}
                                </td>
                                <td>{batch.productName}</td>
                                <td><small className="text-muted">{batch.productSku}</small></td>
                                <td className="text-center">
                                  {batch.expirationDate ? (
                                    <span className={batch.isExpiringSoon ? 'text-danger' : ''}>
                                      {batch.isExpiringSoon && <i className="bi bi-exclamation-triangle me-1" />}
                                      {batch.expirationDate}
                                    </span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td className="text-end">{batch.quantitySold.toFixed(0)}</td>
                                <td className="text-end">{formatCurrency(batch.unitCost)}</td>
                                <td className="text-end">{formatCurrency(batch.estimatedRevenue)}</td>
                                <td className="text-end">
                                  <span className={`badge ${batch.marginPercentage >= 30 ? 'bg-success' : batch.marginPercentage >= 15 ? 'bg-warning' : 'bg-danger'}`}>
                                    {formatPercent(batch.marginPercentage)}
                                  </span>
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
            ) : (
              <div className="alert alert-info">
                No hay movimientos de lotes en este periodo. Asegurese de que los movimientos de inventario tengan un lote asignado.
              </div>
            )}
          </div>
        )}

        {/* Profitability Tab */}
        {activeTab === 'profitability' && (
          <div className="tab-pane fade show active">
            {loadingProfitability ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : salesProfitability ? (
              <div className="row g-4">
                {/* Summary */}
                <div className="col-12">
                  <div className="row g-3">
                    <div className="col-md-2">
                      <div className="card bg-secondary text-white">
                        <div className="card-body py-2">
                          <div className="small text-white-50">Productos</div>
                          <div className="h4 mb-0">{salesProfitability.summary?.totalProducts || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-info text-white">
                        <div className="card-body py-2">
                          <div className="small text-white-50">Unidades</div>
                          <div className="h4 mb-0">{salesProfitability.summary?.totalQuantity?.toFixed(0) || 0}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-primary text-white">
                        <div className="card-body py-2">
                          <div className="small text-white-50">Ingreso</div>
                          <div className="h4 mb-0">{formatCurrency(salesProfitability.summary?.totalRevenue)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-warning text-dark">
                        <div className="card-body py-2">
                          <div className="small text-dark">Costo</div>
                          <div className="h4 mb-0">{formatCurrency(salesProfitability.summary?.totalCost)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-success text-white">
                        <div className="card-body py-2">
                          <div className="small text-white-50">Utilidad</div>
                          <div className="h4 mb-0">{formatCurrency(salesProfitability.summary?.totalProfit)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-dark text-white">
                        <div className="card-body py-2">
                          <div className="small text-white-50">Margen</div>
                          <div className="h4 mb-0">{formatPercent(salesProfitability.summary?.averageMargin)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Top 10 Productos por Ingreso</h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesProfitability.products?.slice(0, 10)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <YAxis type="category" dataKey="productName" width={150} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)} />
                          <Legend />
                          <Bar dataKey="revenue" name="Ingreso" fill="#0088FE" />
                          <Bar dataKey="cost" name="Costo" fill="#FF8042" />
                          <Bar dataKey="grossProfit" name="Utilidad" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Detalle de Rentabilidad por Producto</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Codigo</th>
                              <th>Producto</th>
                              <th>Categoria</th>
                              <th className="text-end">Cantidad</th>
                              <th className="text-end">Ingreso</th>
                              <th className="text-end">Costo</th>
                              <th className="text-end">Utilidad</th>
                              <th className="text-end">Margen</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesProfitability.products?.map((product) => (
                              <tr key={product.productId}>
                                <td><code>{product.productCode}</code></td>
                                <td><strong>{product.productName}</strong></td>
                                <td><small className="text-muted">{product.categoryName}</small></td>
                                <td className="text-end">{product.quantitySold.toFixed(0)}</td>
                                <td className="text-end">{formatCurrency(product.revenue)}</td>
                                <td className="text-end text-muted">{formatCurrency(product.cost)}</td>
                                <td className="text-end text-success">
                                  <strong>{formatCurrency(product.grossProfit)}</strong>
                                </td>
                                <td className="text-end">
                                  <span className={`badge ${product.marginPercentage >= 30 ? 'bg-success' : product.marginPercentage >= 15 ? 'bg-warning' : 'bg-danger'}`}>
                                    {formatPercent(product.marginPercentage)}
                                  </span>
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
            ) : (
              <div className="alert alert-info">No hay datos de rentabilidad disponibles para este periodo</div>
            )}
          </div>
        )}

        {/* Sales Trend Tab */}
        {activeTab === 'trend' && (
          <div className="tab-pane fade show active">
            <div className="row g-4">
              {/* Group By Selector */}
              <div className="col-12">
                <div className="btn-group" role="group">
                  <button
                    className={`btn btn-outline-primary ${trendGroupBy === 'day' ? 'active' : ''}`}
                    onClick={() => setTrendGroupBy('day')}
                  >
                    Por Dia
                  </button>
                  <button
                    className={`btn btn-outline-primary ${trendGroupBy === 'week' ? 'active' : ''}`}
                    onClick={() => setTrendGroupBy('week')}
                  >
                    Por Semana
                  </button>
                  <button
                    className={`btn btn-outline-primary ${trendGroupBy === 'month' ? 'active' : ''}`}
                    onClick={() => setTrendGroupBy('month')}
                  >
                    Por Mes
                  </button>
                </div>
              </div>

              {loadingTrend ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : salesTrend ? (
                <>
                  {/* Summary */}
                  <div className="col-12">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <div className="card bg-primary text-white">
                          <div className="card-body">
                            <div className="small text-white-50">Total Ventas</div>
                            <div className="h3 mb-0">{formatCurrency(salesTrend.summary?.totalSales)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-info text-white">
                          <div className="card-body">
                            <div className="small text-white-50">Total Ordenes</div>
                            <div className="h3 mb-0">{salesTrend.summary?.totalOrders || 0}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-success text-white">
                          <div className="card-body">
                            <div className="small text-white-50">Promedio por {trendGroupBy === 'day' ? 'Dia' : trendGroupBy === 'week' ? 'Semana' : 'Mes'}</div>
                            <div className="h3 mb-0">{formatCurrency(salesTrend.summary?.averagePerPeriod)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-secondary text-white">
                          <div className="card-body">
                            <div className="small text-white-50">Periodos</div>
                            <div className="h3 mb-0">{salesTrend.summary?.totalPeriods || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line Chart */}
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Tendencia de Ventas</h6>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={salesTrend.trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip formatter={(value, name) =>
                              name === 'totalSales' ? formatCurrency(typeof value === 'number' ? value : 0) : value
                            } />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="totalSales" name="Ventas" stroke="#0088FE" strokeWidth={2} dot={{ r: 4 }} />
                            <Line yAxisId="right" type="monotone" dataKey="orderCount" name="Ordenes" stroke="#00C49F" strokeWidth={2} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Average Order Value */}
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Ticket Promedio por Periodo</h6>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={salesTrend.trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} />
                            <Tooltip formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)} />
                            <Bar dataKey="averageOrderValue" name="Ticket Promedio" fill="#FFBB28" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">No hay datos de tendencia disponibles para este periodo</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesAdvancedReportsPage
