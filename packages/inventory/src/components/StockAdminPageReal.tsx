/**
 * STOCK ADMIN PAGE
 * Control de stock: KPIs reales del backend (meta.page.total) y filtros por
 * estado, nivel y sucursal. El nivel se puede abrir desde la URL
 * (?level=low | ?level=out) para los enlaces del dashboard.
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Alert, KpiCard, ListToolbar, PageHeader } from '@lwm/ui'
import { BranchFilter } from '@lwm/auth'
import { useStock } from '../hooks'
import { useStockCounts } from '../hooks/useInventoryCounts'
import { StockTableSimple } from './StockTableSimple'
import { PaginationSimple } from './PaginationSimple'
import { STOCK_STATUS } from '../utils/labels'
import { readPageMeta } from '../utils/listing'

const PAGE_SIZE = 20

type StockLevel = '' | 'low' | 'out'

const parseLevel = (value: string | null): StockLevel =>
  value === 'low' || value === 'out' ? value : ''

const StockAdminPageContent = () => {
  const searchParams = useSearchParams()
  const levelParam = parseLevel(searchParams.get('level'))

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [level, setLevel] = useState<StockLevel>(levelParam)
  const [branchId, setBranchId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Navegar a ?level=... con la pagina abierta tambien aplica el filtro
  useEffect(() => {
    setLevel(levelParam)
    setCurrentPage(1)
  }, [levelParam])

  const { stock, meta, isLoading, error } = useStock({
    filters: {
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      branchId: branchId || undefined,
      lowStock: level === 'low' ? true : undefined,
      outOfStock: level === 'out' ? true : undefined,
    },
    pagination: { page: currentPage, size: PAGE_SIZE },
    include: ['product', 'warehouse', 'location'],
  })
  const counts = useStockCounts({ branchId: branchId || undefined })

  const page = readPageMeta(meta, currentPage, PAGE_SIZE)

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Control de Stock"
        subtitle="Existencias por producto, almacén y ubicación"
        actions={
          <Link href="/dashboard/inventory/stock/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" />
            Nuevo registro de stock
          </Link>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <KpiCard
            label="Registros de stock"
            value={counts.total ?? '--'}
            icon="bi-boxes"
            variant="primary"
            isLoading={counts.isLoading}
          />
        </div>
        <div className="col-md-4">
          <KpiCard
            label="Stock bajo"
            value={counts.low ?? '--'}
            icon="bi-exclamation-triangle"
            variant="warning"
            isLoading={counts.isLoading}
            href="/dashboard/inventory/stock?level=low"
          />
        </div>
        <div className="col-md-4">
          <KpiCard
            label="Sin stock"
            value={counts.out ?? '--'}
            icon="bi-x-circle"
            variant="danger"
            isLoading={counts.isLoading}
            href="/dashboard/inventory/stock?level=out"
          />
        </div>
      </div>

      <ListToolbar
        search={{
          value: searchTerm,
          onChange: withReset(setSearchTerm),
          placeholder: 'Buscar por producto, SKU o almacén',
        }}
      >
        <select
          className="form-select w-auto"
          value={statusFilter}
          onChange={(e) => withReset(setStatusFilter)(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STOCK_STATUS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="form-select w-auto"
          value={level}
          onChange={(e) => withReset(setLevel)(parseLevel(e.target.value))}
          aria-label="Filtrar por nivel de stock"
        >
          <option value="">Todos los niveles</option>
          <option value="low">Stock bajo</option>
          <option value="out">Sin stock</option>
        </select>
        <BranchFilter className="form-select w-auto" value={branchId} onChange={withReset(setBranchId)} />
      </ListToolbar>

      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || 'Error al cargar el stock'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <StockTableSimple stock={stock} isLoading={isLoading} />
          {page.lastPage > 1 && (
            <PaginationSimple
              currentPage={page.currentPage}
              totalPages={page.lastPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={page.total}
              pageSize={page.perPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/** useSearchParams exige un limite de Suspense en paginas estaticas */
export const StockAdminPageReal = () => (
  <Suspense
    fallback={
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    }
  >
    <StockAdminPageContent />
  </Suspense>
)
