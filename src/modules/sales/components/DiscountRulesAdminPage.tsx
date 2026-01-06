/**
 * DISCOUNT RULES ADMIN PAGE
 *
 * Pagina de gestion de reglas de descuento automaticas.
 * Incluye metricas, filtros, acciones rapidas y tabla con operaciones CRUD.
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDiscountRules } from '../hooks/useDiscountRules'
import { useDiscountRuleMutations } from '../hooks/useDiscountRuleMutations'
import { DiscountRulesTable } from './DiscountRulesTable'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { DiscountRuleFilters, DiscountType, DiscountAppliesTo, ParsedDiscountRule } from '../types'

export const DiscountRulesAdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<DiscountType | null>(null)
  const [appliesToFilter, setAppliesToFilter] = useState<DiscountAppliesTo | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const pageSize = 20
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Mutations hook
  const { deleteDiscountRule, toggleActive, isLoading: isMutating } = useDiscountRuleMutations()

  // Build filters
  const filters: DiscountRuleFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(typeFilter && { discountType: typeFilter }),
    ...(appliesToFilter && { appliesTo: appliesToFilter }),
    ...(activeFilter !== null && { isActive: activeFilter })
  }

  // Hooks con paginacion real del backend
  const { discountRules, meta, isLoading, error, mutate } = useDiscountRules({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    page: currentPage,
    pageSize: pageSize
  })

  // Paginacion desde meta structure
  const totalPages = meta?.lastPage || 1
  const totalItems = meta?.total || 0

  // Calculate metrics dynamically
  const ruleMetrics = React.useMemo(() => {
    const now = new Date()

    return {
      total: discountRules.length,
      active: discountRules.filter(r => r.isActive && r.isValid && !r.isExpired).length,
      inactive: discountRules.filter(r => !r.isActive).length,
      expired: discountRules.filter(r => r.isExpired).length,
      percentage: discountRules.filter(r => r.discountType === 'percentage').length,
      fixed: discountRules.filter(r => r.discountType === 'fixed').length,
      buyXGetY: discountRules.filter(r => r.discountType === 'buy_x_get_y').length,
      expiringSoon: discountRules.filter(r => {
        if (!r.endDate || r.isExpired) return false
        const endDate = new Date(r.endDate)
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
      }).length
    }
  }, [discountRules])

  // Reset to page 1 when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (type: DiscountType | null) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const handleActiveFilter = (active: boolean | null) => {
    setActiveFilter(active)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter(null)
    setAppliesToFilter(null)
    setActiveFilter(null)
    setCurrentPage(1)
  }

  // Action handlers
  const handleEdit = useCallback(
    (rule: ParsedDiscountRule) => {
      navigation.push(`/dashboard/sales/discount-rules/${rule.id}/edit`)
    },
    [navigation]
  )

  const handleView = useCallback(
    (rule: ParsedDiscountRule) => {
      navigation.push(`/dashboard/sales/discount-rules/${rule.id}`)
    },
    [navigation]
  )

  const handleDelete = useCallback(
    async (ruleId: string) => {
      try {
        await deleteDiscountRule(ruleId)
        mutate()
      } catch (error) {
        console.error('Error deleting discount rule:', error)
      }
    },
    [deleteDiscountRule, mutate]
  )

  const handleToggleActive = useCallback(
    async (ruleId: string, isActive: boolean) => {
      try {
        await toggleActive(ruleId, isActive)
        mutate()
      } catch (error) {
        console.error('Error toggling discount rule:', error)
      }
    },
    [toggleActive, mutate]
  )

  const hasFilters = searchTerm || typeFilter || appliesToFilter || activeFilter !== null

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Reglas de Descuento</h1>
          <p className="text-muted mb-0">Gestion de descuentos automaticos para ventas</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigation.push('/dashboard/sales/discount-rules/create')}>
            <i className="bi bi-plus-lg me-2" />
            Nueva Regla
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total</h6>
                  <h3 className="mb-0">{totalItems || '--'}</h3>
                </div>
                <i className="bi bi-percent" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-success text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleActiveFilter(true)}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Activas</h6>
                  <h3 className="mb-0">{ruleMetrics.active}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-secondary text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleActiveFilter(false)}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Inactivas</h6>
                  <h3 className="mb-0">{ruleMetrics.inactive}</h3>
                </div>
                <i className="bi bi-pause-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card border-0 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Expiradas</h6>
                  <h3 className="mb-0">{ruleMetrics.expired}</h3>
                </div>
                <i className="bi bi-calendar-x" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-info text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTypeFilter('percentage')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Porcentaje</h6>
                  <h3 className="mb-0">{ruleMetrics.percentage}</h3>
                </div>
                <i className="bi bi-percent" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-warning text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTypeFilter('buy_x_get_y')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Compra X Lleva Y</h6>
                  <h3 className="mb-0">{ruleMetrics.buyXGetY}</h3>
                </div>
                <i className="bi bi-gift" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body py-3">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted me-2">Filtros rapidos:</span>
                <Button
                  variant={activeFilter === true ? 'success' : 'secondary'}
                  size="small"
                  onClick={() => handleActiveFilter(activeFilter === true ? null : true)}
                >
                  <i className="bi bi-check-circle me-1" />
                  Activas
                </Button>
                <Button
                  variant={activeFilter === false ? 'secondary' : 'secondary'}
                  size="small"
                  onClick={() => handleActiveFilter(activeFilter === false ? null : false)}
                >
                  <i className="bi bi-pause-circle me-1" />
                  Inactivas
                </Button>
                <Button
                  variant={typeFilter === 'percentage' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleTypeFilter(typeFilter === 'percentage' ? null : 'percentage')}
                >
                  <i className="bi bi-percent me-1" />
                  Porcentaje
                </Button>
                <Button
                  variant={typeFilter === 'fixed' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleTypeFilter(typeFilter === 'fixed' ? null : 'fixed')}
                >
                  <i className="bi bi-currency-dollar me-1" />
                  Monto Fijo
                </Button>
                <Button
                  variant={typeFilter === 'buy_x_get_y' ? 'warning' : 'secondary'}
                  size="small"
                  onClick={() => handleTypeFilter(typeFilter === 'buy_x_get_y' ? null : 'buy_x_get_y')}
                >
                  <i className="bi bi-gift me-1" />
                  Compra X Lleva Y
                </Button>
                {hasFilters && (
                  <Button variant="secondary" size="small" onClick={handleClearFilters}>
                    <i className="bi bi-x-lg me-1" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, codigo o descripcion..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar las reglas de descuento'}
        </Alert>
      )}

      {/* Alerts for critical situations */}
      {ruleMetrics.expiringSoon > 0 && (
        <Alert variant="warning" className="mb-3">
          <i className="bi bi-clock me-2" />
          <strong>Atencion:</strong> Tienes {ruleMetrics.expiringSoon} regla(s) de descuento que expiraran en los
          proximos 7 dias.
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <DiscountRulesTable
            discountRules={discountRules}
            isLoading={isLoading || isMutating}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted">
                Mostrando {discountRules.length} de {totalItems} reglas
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      Primera
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">
                      {currentPage} / {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Ultima
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default DiscountRulesAdminPage
