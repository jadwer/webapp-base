/**
 * Historico de Ventas (Sales History) - v1
 *
 * Daily work screen for sales reporting (Bind ERP migration parity):
 * - Collapsible filter bar (date presets, customer, salesperson, product,
 *   category, brand, status multi-select, currency, IVA, order number)
 * - "Agrupar por" (group by) with aggregated table
 * - Detail table with fixed totals row and global total at top right
 * - Server-side pagination and export (CSV / Excel / PDF)
 */

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useContacts } from '@lwm/contacts'
import { useProducts, useCategories, useBrands } from '@lwm/products'
import { OrderStatusBadge, type OrderStatus } from '@lwm/ecommerce'
import { useUsers } from '@lwm/permissions'
import { formatCurrency } from '@/lib/formatters'
import { useSalesHistory } from '../hooks'
import { DATE_PRESETS, getPresetDates } from '../utils/datePresets'
import { ReportExportButton } from './ReportExportButton'
import { PaginationSimple } from './PaginationSimple'
import type { SalesHistoryFilters, SalesHistoryGroupBy } from '../types'

// Order statuses (same catalog as @lwm/ecommerce OrderStatusBadge)
const ORDER_STATUSES: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
]

const GROUP_BY_OPTIONS: { value: SalesHistoryGroupBy; label: string }[] = [
  { value: 'none', label: 'Sin agrupar' },
  { value: 'customer', label: 'Cliente' },
  { value: 'salesperson', label: 'Vendedor' },
  { value: 'status', label: 'Estatus' },
  { value: 'day', label: 'Dia' },
  { value: 'month', label: 'Mes' },
]

const PAGE_SIZES = [25, 50, 100]

// Small debounce helper (same 300ms pattern used by products filters)
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export const SalesHistoryPage = () => {
  // Date range (same presets as SalesAdvancedReportsPage)
  const [datePreset, setDatePreset] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Filter bar state
  const [showFilters, setShowFilters] = useState(false)
  const [contactId, setContactId] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [productId, setProductId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [currency, setCurrency] = useState('')
  const [iva, setIva] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [groupBy, setGroupBy] = useState<SalesHistoryGroupBy>('none')

  // Server-side pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const debouncedOrderNumber = useDebouncedValue(orderNumber)
  const debouncedContactSearch = useDebouncedValue(contactSearch)
  const debouncedProductSearch = useDebouncedValue(productSearch)

  const { startDate, endDate } = useMemo(() => {
    if (datePreset === 'custom') {
      const today = new Date().toISOString().split('T')[0]
      return {
        startDate: customStartDate || today,
        endDate: customEndDate || today,
      }
    }
    return getPresetDates(datePreset)
  }, [datePreset, customStartDate, customEndDate])

  // Report filters (camelCase; service maps to snake_case query params)
  const filters: SalesHistoryFilters = useMemo(() => ({
    startDate,
    endDate,
    ...(contactId ? { contactId: parseInt(contactId) } : {}),
    ...(assignedTo ? { assignedTo: parseInt(assignedTo) } : {}),
    ...(productId ? { productId: parseInt(productId) } : {}),
    ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
    ...(brandId ? { brandId: parseInt(brandId) } : {}),
    ...(selectedStatuses.length ? { status: selectedStatuses } : {}),
    ...(currency ? { currency } : {}),
    ...(iva ? { iva } : {}),
    ...(debouncedOrderNumber ? { orderNumber: debouncedOrderNumber } : {}),
    groupBy,
    pageNumber: page,
    pageSize,
  }), [
    startDate, endDate, contactId, assignedTo, productId, categoryId, brandId,
    selectedStatuses, currency, iva, debouncedOrderNumber, groupBy, page, pageSize,
  ])

  // Reset to first page whenever a filter (not the page itself) changes
  const filterSignature = JSON.stringify({ ...filters, pageNumber: undefined })
  useEffect(() => {
    setPage(1)
  }, [filterSignature])

  const { rows, totals, grouped, isLoading, error } = useSalesHistory(filters)

  // Filter data sources
  const { contacts } = useContacts({
    filters: {
      isCustomer: true,
      ...(debouncedContactSearch ? { search: debouncedContactSearch } : {}),
    },
    pagination: { page: 1, size: 50 },
  })
  const { users } = useUsers()
  const { products } = useProducts({
    page: { number: 1, size: 20 },
    ...(debouncedProductSearch ? { filters: { name: debouncedProductSearch } } : {}),
  })
  const { categories } = useCategories({ page: { size: 100 } })
  const { brands } = useBrands({ page: { size: 100 } })

  const isGrouped = groupBy !== 'none'
  const totalPages = useMemo(() => {
    if (!totals?.count || isGrouped) return 1
    return Math.max(1, Math.ceil(totals.count / pageSize))
  }, [totals?.count, pageSize, isGrouped])

  // Export params (snake_case, same contract as the report endpoint)
  const exportParams = useMemo(() => {
    const params: Record<string, string | number> = {
      start_date: startDate,
      end_date: endDate,
    }
    if (contactId) params.contact_id = parseInt(contactId)
    if (assignedTo) params.assigned_to = parseInt(assignedTo)
    if (productId) params.product_id = parseInt(productId)
    if (categoryId) params.category_id = parseInt(categoryId)
    if (brandId) params.brand_id = parseInt(brandId)
    if (selectedStatuses.length) params.status = selectedStatuses.join(',')
    if (currency) params.currency = currency
    if (iva) params.iva = iva
    if (debouncedOrderNumber) params.order_number = debouncedOrderNumber
    if (groupBy !== 'none') params.group_by = groupBy
    return params
  }, [
    startDate, endDate, contactId, assignedTo, productId, categoryId, brandId,
    selectedStatuses, currency, iva, debouncedOrderNumber, groupBy,
  ])

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setContactId('')
    setContactSearch('')
    setAssignedTo('')
    setProductId('')
    setProductSearch('')
    setCategoryId('')
    setBrandId('')
    setSelectedStatuses([])
    setCurrency('')
    setIva('')
    setOrderNumber('')
  }

  const hasActiveFilters = Boolean(
    contactId || assignedTo || productId || categoryId || brandId ||
    selectedStatuses.length || currency || iva || orderNumber
  )

  const groupLabelHeader = GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label || 'Grupo'

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-receipt me-3" />
                Historico de Ventas
              </h1>
              <p className="text-muted mb-0">
                Reporte detallado de ventas con costo, utilidad y totales del periodo
              </p>
            </div>
            {/* Global amount, top right (Bind-style) */}
            {totals && (
              <div className="text-end">
                <div className="small text-muted">
                  Total del conjunto ({totals.count} {totals.count === 1 ? 'orden' : 'ordenes'})
                </div>
                <div className="h3 mb-0 text-success">{formatCurrency(totals.total)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3 col-lg-2">
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
                <div className="col-6 col-md-2">
                  <label className="form-label small text-muted mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-2">
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

            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted mb-1">Folio</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: OV-000123"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted mb-1">Agrupar por</label>
              <select
                className="form-select"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as SalesHistoryGroupBy)}
              >
                {GROUP_BY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <button
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-funnel me-1" />
                Filtros
                {hasActiveFilters && <span className="badge bg-danger ms-1">!</span>}
              </button>
            </div>

            <div className="col-auto ms-auto">
              <ReportExportButton
                reportType="sales-history/export"
                params={exportParams}
                filename={`historico-ventas_${startDate}_${endDate}`}
                formatParamMap={{ xlsx: 'excel' }}
              />
            </div>
          </div>

          {/* Collapsible advanced filters */}
          {showFilters && (
            <div className="row g-3 mt-2 pt-3 border-top">
              {/* Customer */}
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-person me-1" />
                  Cliente
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm mb-1"
                  placeholder="Buscar cliente..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
                <select
                  className="form-select"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                >
                  <option value="">Todos los clientes</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salesperson */}
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-person-badge me-1" />
                  Vendedor
                </label>
                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Todos los vendedores</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-box me-1" />
                  Producto
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm mb-1"
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <select
                  className="form-select"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Todos los productos</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku ? `${product.sku} - ${product.name}` : product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status multi-select */}
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-flag me-1" />
                  Estatus
                </label>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                  >
                    {selectedStatuses.length
                      ? `${selectedStatuses.length} seleccionado(s)`
                      : 'Todos los estatus'}
                  </button>
                  <ul className="dropdown-menu w-100 px-3">
                    {ORDER_STATUSES.map((status) => (
                      <li key={status.value} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`status-${status.value}`}
                          checked={selectedStatuses.includes(status.value)}
                          onChange={() => toggleStatus(status.value)}
                        />
                        <label className="form-check-label" htmlFor={`status-${status.value}`}>
                          {status.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Category */}
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-tags me-1" />
                  Categoria
                </label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Todas las categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-award me-1" />
                  Marca
                </label>
                <select
                  className="form-select"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                >
                  <option value="">Todas las marcas</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="col-6 col-md-3 col-lg-2">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-currency-exchange me-1" />
                  Moneda
                </label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              {/* IVA */}
              <div className="col-6 col-md-3 col-lg-2">
                <label className="form-label small text-muted mb-1">
                  <i className="bi bi-percent me-1" />
                  IVA
                </label>
                <select
                  className="form-select"
                  value={iva}
                  onChange={(e) => setIva(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="1">Con IVA</option>
                  <option value="0">Sin IVA</option>
                </select>
              </div>

              {hasActiveFilters && (
                <div className="col-12">
                  <button className="btn btn-sm btn-outline-danger" onClick={clearFilters}>
                    <i className="bi bi-x-circle me-1" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el reporte. Intenta de nuevo o ajusta los filtros.
        </div>
      )}

      {/* Results */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="mb-0">
            {isGrouped ? `Ventas agrupadas por ${groupLabelHeader}` : 'Detalle de Ventas'}
          </h6>
          <div className="d-flex align-items-center gap-3">
            {!isGrouped && (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Por pagina:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            {totals && (
              <span className="badge bg-success fs-6">
                Total: {formatCurrency(totals.total)}
              </span>
            )}
          </div>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : isGrouped ? (
            /* Grouped table */
            grouped?.length ? (
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>{groupLabelHeader}</th>
                      <th className="text-center">Ordenes</th>
                      <th className="text-end">Costo</th>
                      <th className="text-end">Utilidad</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-end">Descuento</th>
                      <th className="text-end">IVA</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.map((group) => (
                      <tr key={group.groupKey}>
                        <td><strong>{group.groupLabel}</strong></td>
                        <td className="text-center">
                          <span className="badge bg-primary">{group.count}</span>
                        </td>
                        <td className="text-end text-muted">{formatCurrency(group.cost)}</td>
                        <td className="text-end text-success">
                          <strong>{formatCurrency(group.profit)}</strong>
                        </td>
                        <td className="text-end">{formatCurrency(group.subtotal)}</td>
                        <td className="text-end">{formatCurrency(group.discount)}</td>
                        <td className="text-end">{formatCurrency(group.iva)}</td>
                        <td className="text-end"><strong>{formatCurrency(group.total)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  {totals && (
                    <tfoot className="table-light fw-bold">
                      <tr>
                        <td>Totales</td>
                        <td className="text-center">{totals.count}</td>
                        <td className="text-end">{formatCurrency(totals.cost)}</td>
                        <td className="text-end text-success">{formatCurrency(totals.profit)}</td>
                        <td className="text-end">{formatCurrency(totals.subtotal)}</td>
                        <td className="text-end">{formatCurrency(totals.discount)}</td>
                        <td className="text-end">{formatCurrency(totals.iva)}</td>
                        <td className="text-end">{formatCurrency(totals.total)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ) : (
              <div className="alert alert-info mb-0">
                No hay ventas para agrupar en este periodo con los filtros seleccionados
              </div>
            )
          ) : rows.length ? (
            /* Detail table */
            <>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Folio</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Vendedor</th>
                      <th className="text-end">Costo</th>
                      <th className="text-end">Utilidad</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-end">Descuento</th>
                      <th className="text-end">IVA</th>
                      <th className="text-end">Total</th>
                      <th className="text-center">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.orderId}>
                        <td><code className="text-primary">{row.orderNumber}</code></td>
                        <td>{row.date?.slice(0, 10)}</td>
                        <td>{row.customerName}</td>
                        <td>
                          {row.salespersonName || <span className="text-muted">Sin asignar</span>}
                        </td>
                        <td className="text-end text-muted">{formatCurrency(row.cost)}</td>
                        <td className={`text-end ${row.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                          <strong>{formatCurrency(row.profit)}</strong>
                        </td>
                        <td className="text-end">{formatCurrency(row.subtotal)}</td>
                        <td className="text-end">{formatCurrency(row.discount)}</td>
                        <td className="text-end">{formatCurrency(row.iva)}</td>
                        <td className="text-end"><strong>{formatCurrency(row.total)}</strong></td>
                        <td className="text-center">
                          <OrderStatusBadge status={row.status as OrderStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Fixed totals row (whole filtered set, not just the page) */}
                  {totals && (
                    <tfoot className="table-light fw-bold">
                      <tr>
                        <td colSpan={4}>
                          Totales ({totals.count} {totals.count === 1 ? 'orden' : 'ordenes'})
                        </td>
                        <td className="text-end">{formatCurrency(totals.cost)}</td>
                        <td className="text-end text-success">{formatCurrency(totals.profit)}</td>
                        <td className="text-end">{formatCurrency(totals.subtotal)}</td>
                        <td className="text-end">{formatCurrency(totals.discount)}</td>
                        <td className="text-end">{formatCurrency(totals.iva)}</td>
                        <td className="text-end">{formatCurrency(totals.total)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Server-side pagination */}
              <div className="mt-3">
                <PaginationSimple
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="alert alert-info mb-0">
              No hay ventas en este periodo con los filtros seleccionados
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SalesHistoryPage
