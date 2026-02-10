'use client'

import { useState, useEffect, useCallback } from 'react'
import { invoiceSeriesService, CFDI_TYPE_LABELS, SOURCE_TYPE_LABELS } from '@/modules/billing/services/invoiceSeriesService'
import type { InvoiceSeries, CreateInvoiceSeriesRequest, UpdateInvoiceSeriesRequest } from '@/modules/billing/services/invoiceSeriesService'
import { companySettingsService } from '@/modules/billing/services'
import type { CompanySetting } from '@/modules/billing/types'
import { toast } from '@/lib/toast'

export default function InvoiceSeriesSettingsPage() {
  const [series, setSeries] = useState<InvoiceSeries[]>([])
  const [companySetting, setCompanySetting] = useState<CompanySetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [initializing, setInitializing] = useState(false)

  const [createForm, setCreateForm] = useState<Partial<CreateInvoiceSeriesRequest>>({
    cfdiType: 'I',
    folioPadding: 6,
    includeYear: false,
    separator: '-',
    isActive: true,
    resetYearly: false,
  })

  const [editForm, setEditForm] = useState<UpdateInvoiceSeriesRequest & { initialFolioOverride?: number }>({})

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [seriesData, cs] = await Promise.all([
        invoiceSeriesService.getAll(),
        companySettingsService.getActive(),
      ])
      setSeries(seriesData)
      setCompanySetting(cs)
    } catch {
      toast.error('Error al cargar series de facturacion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleInitializeDefaults = async () => {
    if (!companySetting) {
      toast.error('No se encontro configuracion fiscal activa')
      return
    }
    setInitializing(true)
    try {
      const result = await invoiceSeriesService.initializeDefaults(companySetting.id)
      toast.success(result.message || 'Series inicializadas correctamente')
      await loadData()
    } catch {
      toast.error('Error al inicializar series')
    } finally {
      setInitializing(false)
    }
  }

  const handleCreate = async () => {
    if (!companySetting) {
      toast.error('No se encontro configuracion fiscal activa')
      return
    }
    if (!createForm.code || !createForm.name || !createForm.cfdiType) {
      toast.error('Completa los campos requeridos: Codigo, Nombre y Tipo CFDI')
      return
    }
    setSaving(true)
    try {
      await invoiceSeriesService.create({
        ...createForm as CreateInvoiceSeriesRequest,
        companySettingId: companySetting.id,
      })
      toast.success('Serie creada correctamente')
      setShowCreate(false)
      setCreateForm({ cfdiType: 'I', folioPadding: 6, includeYear: false, separator: '-', isActive: true, resetYearly: false })
      await loadData()
    } catch {
      toast.error('Error al crear la serie')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (s: InvoiceSeries) => {
    setEditingId(s.id)
    setEditForm({
      name: s.name,
      description: s.description || undefined,
      folioPadding: s.folioPadding,
      includeYear: s.includeYear,
      yearFormat: s.yearFormat,
      separator: s.separator,
      isActive: s.isActive,
      resetYearly: s.resetYearly,
      sourceType: s.sourceType,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      const { initialFolioOverride, ...updateData } = editForm
      await invoiceSeriesService.update(editingId, updateData)

      if (initialFolioOverride && initialFolioOverride > 0) {
        await invoiceSeriesService.setInitialFolio(editingId, initialFolioOverride)
      }

      toast.success('Serie actualizada correctamente')
      setEditingId(null)
      setEditForm({})
      await loadData()
    } catch {
      toast.error('Error al actualizar la serie')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await invoiceSeriesService.setAsDefault(id)
      toast.success('Serie marcada como predeterminada')
      await loadData()
    } catch {
      toast.error('Error al marcar como predeterminada')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Eliminar la serie "${code}"? Esta accion no se puede deshacer.`)) return
    try {
      await invoiceSeriesService.delete(id)
      toast.success('Serie eliminada')
      await loadData()
    } catch {
      toast.error('Error al eliminar la serie')
    }
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Cargando series de facturacion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Series de Facturacion</h4>
          <p className="text-muted mb-0">Administra las series CFDI para facturas, notas de credito y otros comprobantes.</p>
        </div>
        <div className="d-flex gap-2">
          {series.length === 0 && (
            <button className="btn btn-outline-success" onClick={handleInitializeDefaults} disabled={initializing}>
              {initializing ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-magic me-1" />}
              Inicializar Defaults
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <i className="bi bi-plus me-1" />
            Nueva Serie
          </button>
        </div>
      </div>

      {!companySetting && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          No se encontro una configuracion fiscal activa. Ve a{' '}
          <a href="/dashboard/billing/settings" className="alert-link">Configuracion Fiscal</a>{' '}
          para crear una.
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between">
            <span>Nueva Serie de Facturacion</span>
            <button className="btn btn-sm btn-outline-light" onClick={() => setShowCreate(false)}>
              <i className="bi bi-x" />
            </button>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-medium">Codigo *</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.code || ''}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
                  placeholder="FAC"
                  maxLength={10}
                />
                <small className="text-muted">Solo mayusculas, numeros y guiones</small>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.name || ''}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Factura Normal"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-medium">Tipo CFDI *</label>
                <select
                  className="form-select"
                  value={createForm.cfdiType || 'I'}
                  onChange={(e) => setCreateForm({ ...createForm, cfdiType: e.target.value })}
                >
                  {Object.entries(CFDI_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{key} - {label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-medium">Tipo Fuente</label>
                <select
                  className="form-select"
                  value={createForm.sourceType || ''}
                  onChange={(e) => setCreateForm({ ...createForm, sourceType: e.target.value || undefined })}
                >
                  <option value="">Todas</option>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label fw-medium">Descripcion</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.description || ''}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Serie para facturas de venta en mostrador"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-medium">Folio Inicial</label>
                <input
                  type="number"
                  className="form-control"
                  value={createForm.initialFolio || 1}
                  onChange={(e) => setCreateForm({ ...createForm, initialFolio: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-medium">Padding</label>
                <input
                  type="number"
                  className="form-control"
                  value={createForm.folioPadding || 6}
                  onChange={(e) => setCreateForm({ ...createForm, folioPadding: parseInt(e.target.value) || 6 })}
                  min={1}
                  max={10}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end gap-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={createForm.isActive ?? true}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                    id="create-active"
                  />
                  <label className="form-check-label" htmlFor="create-active">Activa</label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={createForm.resetYearly ?? false}
                    onChange={(e) => setCreateForm({ ...createForm, resetYearly: e.target.checked })}
                    id="create-reset"
                  />
                  <label className="form-check-label" htmlFor="create-reset">Reset Anual</label>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Crear Serie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Series table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Tipo CFDI</th>
                  <th>Folio Actual</th>
                  <th>Formato</th>
                  <th>Fuente</th>
                  <th>Estado</th>
                  <th style={{ width: '150px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {series.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No hay series configuradas. Usa &quot;Inicializar Defaults&quot; para crear las series estandar.
                    </td>
                  </tr>
                ) : (
                  series.map((s) => {
                    const isEditing = editingId === s.id
                    return (
                      <tr key={s.id}>
                        <td>
                          <span className="badge bg-primary">{s.code}</span>
                          {s.isDefault && <span className="badge bg-success ms-1" style={{ fontSize: '10px' }}>Default</span>}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          ) : (
                            <>
                              <div className="fw-medium">{s.name}</div>
                              {s.description && <small className="text-muted">{s.description}</small>}
                            </>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-secondary">{s.cfdiType}</span>
                          <small className="text-muted ms-1">{CFDI_TYPE_LABELS[s.cfdiType] || s.cfdiType}</small>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '90px' }}
                              value={editForm.initialFolioOverride ?? s.currentFolio + 1}
                              onChange={(e) => setEditForm({ ...editForm, initialFolioOverride: parseInt(e.target.value) || 1 })}
                              min={1}
                              title="Nuevo folio inicial"
                            />
                          ) : (
                            <span className="fw-bold">{s.currentFolio}</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="d-flex gap-1 align-items-center">
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ width: '60px' }}
                                value={editForm.folioPadding || 6}
                                onChange={(e) => setEditForm({ ...editForm, folioPadding: parseInt(e.target.value) || 6 })}
                                min={1}
                                max={10}
                                title="Padding"
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ width: '40px' }}
                                value={editForm.separator || '-'}
                                onChange={(e) => setEditForm({ ...editForm, separator: e.target.value })}
                                maxLength={2}
                                title="Separador"
                              />
                            </div>
                          ) : (
                            <small>Pad: {s.folioPadding} | Sep: &quot;{s.separator}&quot;</small>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className="form-select form-select-sm"
                              style={{ width: '100px' }}
                              value={editForm.sourceType || ''}
                              onChange={(e) => setEditForm({ ...editForm, sourceType: e.target.value || null })}
                            >
                              <option value="">Todas</option>
                              {Object.entries(SOURCE_TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            s.sourceType ? (
                              <span className="badge bg-info">{SOURCE_TYPE_LABELS[s.sourceType] || s.sourceType}</span>
                            ) : (
                              <span className="text-muted">Todas</span>
                            )
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={editForm.isActive ?? true}
                                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                              />
                            </div>
                          ) : (
                            s.isActive ? (
                              <span className="badge bg-success">Activa</span>
                            ) : (
                              <span className="badge bg-secondary">Inactiva</span>
                            )
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm btn-success" onClick={handleSaveEdit} disabled={saving}>
                                {saving ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check" />}
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setEditingId(null); setEditForm({}) }} disabled={saving}>
                                <i className="bi bi-x" />
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(s)} title="Editar">
                                <i className="bi bi-pencil" />
                              </button>
                              {!s.isDefault && (
                                <button className="btn btn-sm btn-outline-success" onClick={() => handleSetDefault(s.id)} title="Marcar como predeterminada">
                                  <i className="bi bi-star" />
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id, s.code)} title="Eliminar">
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h6 className="card-title">Tipos CFDI</h6>
          <div className="row" style={{ fontSize: '13px' }}>
            <div className="col-md-6">
              <ul className="mb-0">
                <li><strong>I - Ingreso:</strong> Facturas de venta (el tipo mas comun).</li>
                <li><strong>E - Egreso:</strong> Notas de credito y devoluciones.</li>
                <li><strong>P - Pago:</strong> Complementos de pago (parcialidades).</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="mb-0">
                <li><strong>N - Nomina:</strong> Comprobantes de nomina.</li>
                <li><strong>T - Traslado:</strong> Cartas porte.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
