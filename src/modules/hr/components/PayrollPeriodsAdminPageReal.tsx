/**
 * Payroll Periods Admin Page - Complete Implementation
 *
 * Full-featured admin page for payroll period management
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { usePayrollPeriods, usePayrollPeriodsMutations } from '../hooks'
import type { PayrollPeriod, PayrollPeriodFormData, PayrollPeriodsFilters as FiltersType, PeriodType, PayrollStatus } from '../types'

const StatusBadge: React.FC<{ status: PayrollStatus }> = ({ status }) => {
  const config = {
    draft: { color: 'secondary', text: 'Borrador', icon: 'file-earmark' },
    processing: { color: 'info', text: 'Procesando', icon: 'hourglass-split' },
    approved: { color: 'success', text: 'Aprobado', icon: 'check-circle' },
    paid: { color: 'primary', text: 'Pagado', icon: 'cash-stack' },
    closed: { color: 'dark', text: 'Cerrado', icon: 'lock' },
  }
  const c = config[status]
  return <span className={`badge bg-${c.color} bg-opacity-10 text-${c.color}`}><i className={`bi bi-${c.icon} me-1`} />{c.text}</span>
}

export const PayrollPeriodsAdminPageReal: React.FC = () => {
  const [filters] = useState<FiltersType>({})
  const { payrollPeriods, isLoading, mutate } = usePayrollPeriods(filters)
  const { createPayrollPeriod, updatePayrollPeriod, deletePayrollPeriod } = usePayrollPeriodsMutations()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const [formData, setFormData] = useState<PayrollPeriodFormData>({
    name: '',
    periodType: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
  })

  const handleCreate = useCallback(async () => {
    try {
      await createPayrollPeriod(formData)
      setShowCreateModal(false)
      mutate()
      const toast = document.createElement('div')
      toast.className = 'alert alert-success position-fixed top-0 end-0 m-3'
      toast.style.zIndex = '9999'
      toast.textContent = 'Período de nómina creado exitosamente'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 4000)
    } catch (error) {
      console.error('Error:', error)
    }
  }, [formData, createPayrollPeriod, mutate])

  const handleStatusChange = useCallback(async (period: PayrollPeriod, newStatus: PayrollStatus) => {
    try {
      await updatePayrollPeriod(period.id, { ...period, status: newStatus })
      mutate()
    } catch (error) {
      console.error('Error:', error)
    }
  }, [updatePayrollPeriod, mutate])

  const handleDelete = useCallback(async (period: PayrollPeriod) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el período ${period.name}?`,
      {
        title: 'Confirmar Eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
      }
    )

    if (!confirmed) return

    try {
      await deletePayrollPeriod(period.id)
      mutate()
    } catch (error) {
      console.error('Error:', error)
    }
  }, [deletePayrollPeriod, mutate])

  const totalGross = payrollPeriods.reduce((sum, p) => sum + p.totalGross, 0)
  const totalDeductions = payrollPeriods.reduce((sum, p) => sum + p.totalDeductions, 0)
  const totalNet = payrollPeriods.reduce((sum, p) => sum + p.totalNet, 0)

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2"><i className="bi bi-cash-stack me-3" />Gestión de Nómina</h1>
              <p className="text-muted">Administración de períodos de nómina y pagos</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)} startIcon={<i className="bi bi-plus-circle" />}>
              Nuevo Período
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Total Períodos</h6>
              <h3>{payrollPeriods.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Total Bruto</h6>
              <h4>${totalGross.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Total Deducciones</h6>
              <h4 className="text-danger">${totalDeductions.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted small">Total Neto</h6>
              <h4 className="text-success">${totalNet.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : payrollPeriods.length === 0 ? (
            <div className="alert alert-info">No se encontraron períodos de nómina.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Período</th>
                    <th>Tipo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Fecha Pago</th>
                    <th>Total Bruto</th>
                    <th>Total Neto</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollPeriods.map((period) => (
                    <tr key={period.id}>
                      <td><strong>{period.name}</strong></td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary">
                          {period.periodType === 'weekly' ? 'Semanal' : period.periodType === 'biweekly' ? 'Quincenal' : 'Mensual'}
                        </span>
                      </td>
                      <td>{new Date(period.startDate).toLocaleDateString('es-MX')}</td>
                      <td>{new Date(period.endDate).toLocaleDateString('es-MX')}</td>
                      <td><strong>{new Date(period.paymentDate).toLocaleDateString('es-MX')}</strong></td>
                      <td>${period.totalGross.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                      <td className="text-success fw-medium">${period.totalNet.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                      <td><StatusBadge status={period.status} /></td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {period.status === 'draft' && (
                            <Button size="small" variant="info" buttonStyle="outline" onClick={() => handleStatusChange(period, 'processing')} title="Procesar">
                              <i className="bi bi-play-fill" />
                            </Button>
                          )}
                          {period.status === 'processing' && (
                            <Button size="small" variant="success" buttonStyle="outline" onClick={() => handleStatusChange(period, 'approved')} title="Aprobar">
                              <i className="bi bi-check-lg" />
                            </Button>
                          )}
                          {period.status === 'approved' && (
                            <Button size="small" variant="primary" buttonStyle="outline" onClick={() => handleStatusChange(period, 'paid')} title="Marcar como Pagado">
                              <i className="bi bi-cash" />
                            </Button>
                          )}
                          <Button size="small" variant="danger" buttonStyle="outline" onClick={() => handleDelete(period)}>
                            <i className="bi bi-trash" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Período de Nómina</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Nombre del Período *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ej: Nómina Enero 2025" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tipo *</label>
                    <select className="form-select" value={formData.periodType} onChange={(e) => setFormData({...formData, periodType: e.target.value as PeriodType})}>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Fecha Inicio *</label>
                    <input type="date" className="form-control" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Fecha Fin *</label>
                    <input type="date" className="form-control" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Fecha de Pago *</label>
                    <input type="date" className="form-control" value={formData.paymentDate} onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" rows={2} value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" buttonStyle="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleCreate}>Crear Período</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default PayrollPeriodsAdminPageReal
