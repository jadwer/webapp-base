'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAudits } from '../hooks/useAudits'
import AuditTable from './AuditTable'
import AuditFilters from './AuditFilters'
import type { Audit, AuditFilters as AuditFiltersType } from '../types'

const INITIAL_FILTERS: AuditFiltersType = {
  event: '',
  auditableType: '',
  causer: '',
  auditableId: '',
}

const PAGE_SIZE = 20

export default function AuditAdminPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<AuditFiltersType>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)

  const { audits, isLoading, meta } = useAudits({
    filters,
    sort: '-createdAt',
    page,
    pageSize: PAGE_SIZE,
  })

  const handleFilterChange = useCallback((newFilters: AuditFiltersType) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }, [])

  const handleRowClick = useCallback(
    (audit: Audit) => {
      router.push(`/dashboard/audit/${audit.id}`)
    },
    [router]
  )

  const totalPages = meta?.page?.lastPage || 1
  const currentPage = meta?.page?.currentPage || page
  const total = meta?.page?.total || audits.length

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 fw-bold">
            <i className="bi bi-clipboard-data text-primary me-2" />
            Auditoria del Sistema
          </h1>
          <p className="text-muted mb-0">
            Registro de todas las acciones realizadas en el sistema
          </p>
        </div>
        <div className="text-muted">
          <i className="bi bi-list-ul me-1" />
          {total} registros
        </div>
      </div>

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <AuditTable
            audits={audits}
            isLoading={isLoading}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Pagina {currentPage} de {totalPages}
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-double-left" />
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left" />
                    </button>
                  </li>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    )
                  })}

                  <li
                    className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right" />
                    </button>
                  </li>
                  <li
                    className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-double-right" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
