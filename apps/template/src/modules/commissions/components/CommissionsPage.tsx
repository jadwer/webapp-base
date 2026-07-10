/**
 * Comisiones - Pantalla principal
 *
 * Filtros (periodo con presets, vendedor, estado multi), tabla de
 * comisiones con seleccion de filas "earned" para pago en lote, accion
 * individual de marcar como pagada, y card de configuracion (solo admin).
 */

'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth, hasAnyRole } from '@lwm/auth'
import { useUsers } from '@lwm/permissions'
import { formatCurrency } from '@/lib/formatters'
import { useCommissionsByPeriod, useCommissionMutations } from '../hooks'
import { DATE_PRESETS, getPresetDates } from '@/modules/reports/utils/datePresets'
import { CommissionStatusBadge } from './CommissionStatusBadge'
import { CommissionsSettingsCard } from './CommissionsSettingsCard'
import { PayBatchModal } from './PayBatchModal'
import type { CommissionStatus } from '../types'

const STATUS_OPTIONS: { value: CommissionStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'earned', label: 'Ganada' },
  { value: 'paid', label: 'Pagada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export const CommissionsPage: React.FC = () => {
  const { user } = useAuth()
  const isAdminUser = hasAnyRole(user ?? null, ['god', 'admin', 'administrator'])

  // Period filter (reuses the reports date presets)
  const [datePreset, setDatePreset] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [userId, setUserId] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<CommissionStatus[]>([])

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

  // Backend by-period only accepts a single status value; when multiple are
  // selected we fetch the full period and filter client-side (noted in UI).
  const singleStatusFilter = selectedStatuses.length === 1 ? selectedStatuses[0] : undefined

  const { commissions, isLoading, error, mutate } = useCommissionsByPeriod({
    startDate,
    endDate,
    ...(userId ? { userId: parseInt(userId) } : {}),
    ...(singleStatusFilter ? { status: singleStatusFilter } : {}),
  })

  const { users } = useUsers()

  const { markPaid, payBatch, isLoading: isMutating } = useCommissionMutations()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchError, setBatchError] = useState<string | null>(null)
  const [individualPayId, setIndividualPayId] = useState<string | null>(null)

  const visibleRows = useMemo(() => {
    if (selectedStatuses.length <= 1) return commissions
    return commissions.filter((c) => selectedStatuses.includes(c.status))
  }, [commissions, selectedStatuses])

  // Totals by status, computed from the currently filtered set (the
  // by-period endpoint only returns a total for the whole response, so we
  // aggregate client-side per status here — note reflected in the UI).
  const totalsByStatus = useMemo(() => {
    const totals: Record<CommissionStatus, number> = { pending: 0, earned: 0, paid: 0, cancelled: 0 }
    for (const row of visibleRows) {
      totals[row.status] += row.commissionAmount
    }
    return totals
  }, [visibleRows])

  const earnedRows = visibleRows.filter((c) => c.status === 'earned')
  const selectedEarnedIds = useMemo(
    () => earnedRows.filter((c) => selectedIds.has(c.id)).map((c) => c.id),
    [earnedRows, selectedIds]
  )
  const selectedTotal = useMemo(
    () => earnedRows.filter((c) => selectedIds.has(c.id)).reduce((sum, c) => sum + c.commissionAmount, 0),
    [earnedRows, selectedIds]
  )

  const toggleStatus = (status: CommissionStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllEarned = () => {
    setSelectedIds((prev) => {
      if (earnedRows.every((c) => prev.has(c.id)) && earnedRows.length > 0) {
        return new Set()
      }
      return new Set(earnedRows.map((c) => c.id))
    })
  }

  const handleConfirmBatchPay = async (paymentReference: string) => {
    setBatchError(null)
    try {
      if (individualPayId) {
        await markPaid(individualPayId, paymentReference)
      } else {
        await payBatch({ ids: selectedEarnedIds, paymentReference })
      }
      setSelectedIds(new Set())
      setShowBatchModal(false)
      setIndividualPayId(null)
      mutate()
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'No se pudo registrar el pago. Verifica que las comisiones sigan en estado "Ganada".'
      setBatchError(message)
    }
  }

  const openIndividualPay = (id: string) => {
    setIndividualPayId(id)
    setBatchError(null)
    setShowBatchModal(true)
  }

  const openBatchPay = () => {
    setIndividualPayId(null)
    setBatchError(null)
    setShowBatchModal(true)
  }

  const closeModal = () => {
    setShowBatchModal(false)
    setIndividualPayId(null)
    setBatchError(null)
  }

  const modalCount = individualPayId ? 1 : selectedEarnedIds.length
  const modalTotal = individualPayId
    ? (visibleRows.find((c) => c.id === individualPayId)?.commissionAmount ?? 0)
    : selectedTotal

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-percent me-3" />
                Comisiones
              </h1>
              <p className="text-muted mb-0">
                Comisiones de vendedores por periodo, con pago individual y en lote
              </p>
            </div>
            <Link href="/dashboard/commissions/by-employee" className="btn btn-outline-primary">
              <i className="bi bi-bar-chart me-1" />
              Reporte por vendedor
            </Link>
          </div>
        </div>
      </div>

      {isAdminUser && <CommissionsSettingsCard />}

      {/* Filter bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted mb-1">Periodo</label>
              <select className="form-select" value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
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
              <label className="form-label small text-muted mb-1">Vendedor</label>
              <select className="form-select" value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Todos los vendedores</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label small text-muted mb-1">Estado</label>
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  {selectedStatuses.length ? `${selectedStatuses.length} seleccionado(s)` : 'Todos los estados'}
                </button>
                <ul className="dropdown-menu w-100 px-3">
                  {STATUS_OPTIONS.map((status) => (
                    <li key={status.value} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`commission-status-${status.value}`}
                        checked={selectedStatuses.includes(status.value)}
                        onChange={() => toggleStatus(status.value)}
                      />
                      <label className="form-check-label" htmlFor={`commission-status-${status.value}`}>
                        {status.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedStatuses.length > 1 && (
                <div className="form-text">
                  Con multiples estados, el filtro se aplica sobre la pagina cargada del periodo.
                </div>
              )}
            </div>

            {selectedEarnedIds.length > 0 && (
              <div className="col-auto ms-auto">
                <button className="btn btn-success" onClick={openBatchPay} disabled={isMutating}>
                  <i className="bi bi-cash-stack me-1" />
                  Pagar seleccionadas ({selectedEarnedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Totals row */}
      <div className="row g-3 mb-4">
        {STATUS_OPTIONS.map((status) => (
          <div className="col-6 col-md-3" key={status.value}>
            <div className="card h-100">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">{status.label}</span>
                  <CommissionStatusBadge status={status.value} />
                </div>
                <div className="h5 mb-0 mt-2">{formatCurrency(totalsByStatus[status.value])}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar las comisiones. Intenta de nuevo o ajusta los filtros.
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Comisiones del periodo</h6>
          <span className="small text-muted">{visibleRows.length} registro(s)</span>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : visibleRows.length ? (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={earnedRows.length > 0 && earnedRows.every((c) => selectedIds.has(c.id))}
                        onChange={toggleSelectAllEarned}
                        disabled={earnedRows.length === 0}
                        title="Seleccionar todas las comisiones ganadas"
                      />
                    </th>
                    <th>Orden</th>
                    <th>Vendedor</th>
                    <th className="text-end">Base</th>
                    <th className="text-end">%</th>
                    <th className="text-end">Comision</th>
                    <th className="text-center">Estado</th>
                    <th>Ganada</th>
                    <th>Pagada</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.status === 'earned' && (
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedIds.has(row.id)}
                            onChange={() => toggleRowSelection(row.id)}
                          />
                        )}
                      </td>
                      <td>
                        <code className="text-primary">#{row.salesOrderId}</code>
                      </td>
                      <td>{row.userName || <span className="text-muted">Sin asignar</span>}</td>
                      <td className="text-end">{formatCurrency(row.baseAmount)}</td>
                      <td className="text-end">{row.commissionPct}%</td>
                      <td className="text-end">
                        <strong>{formatCurrency(row.commissionAmount)}</strong>
                      </td>
                      <td className="text-center">
                        <CommissionStatusBadge status={row.status} />
                      </td>
                      <td>{row.earnedAt ? row.earnedAt.slice(0, 10) : '-'}</td>
                      <td>{row.paidAt ? row.paidAt.slice(0, 10) : '-'}</td>
                      <td className="text-center">
                        {row.status === 'earned' && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => openIndividualPay(row.id)}
                            title="Marcar como pagada"
                          >
                            <i className="bi bi-cash" />
                          </button>
                        )}
                        {row.status === 'paid' && row.paymentReference && (
                          <span className="small text-muted">{row.paymentReference}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info mb-0">
              No hay comisiones en este periodo con los filtros seleccionados
            </div>
          )}
        </div>
      </div>

      <PayBatchModal
        show={showBatchModal}
        count={modalCount}
        totalAmount={modalTotal}
        isSubmitting={isMutating}
        errorMessage={batchError}
        onConfirm={handleConfirmBatchPay}
        onClose={closeModal}
      />
    </div>
  )
}

export default CommissionsPage
