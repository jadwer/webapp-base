'use client'

import { useState, useEffect, useCallback } from 'react'
import { folioSequenceService, DOCUMENT_TYPE_LABELS } from '@/modules/sales/services/folioSequenceService'
import type { FolioSequence, UpdateFolioSequenceRequest } from '@/modules/sales/services/folioSequenceService'
import { toast } from '@/lib/toast'

export default function FoliosSettingsPage() {
  const [sequences, setSequences] = useState<FolioSequence[]>([])
  const [loading, setLoading] = useState(true)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UpdateFolioSequenceRequest & { start_from?: number }>({})
  const [saving, setSaving] = useState(false)

  const loadSequences = useCallback(async () => {
    try {
      setLoading(true)
      const data = await folioSequenceService.getAll()
      setSequences(data)
    } catch {
      toast.error('Error al cargar secuencias de folios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSequences()
  }, [loadSequences])

  const handleEdit = (seq: FolioSequence) => {
    setEditingType(seq.documentType)
    setEditForm({
      prefix: seq.prefix,
      include_year: seq.includeYear,
      year_format: seq.yearFormat,
      separator: seq.separator,
      padding: seq.padding,
      reset_yearly: seq.resetYearly,
    })
  }

  const handleCancel = () => {
    setEditingType(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editingType) return
    setSaving(true)
    try {
      const { start_from, ...updateData } = editForm
      await folioSequenceService.update(editingType, updateData)

      if (start_from && start_from > 0) {
        await folioSequenceService.setInitial(editingType, start_from)
      }

      toast.success('Secuencia actualizada correctamente')
      setEditingType(null)
      setEditForm({})
      await loadSequences()
    } catch {
      toast.error('Error al actualizar la secuencia')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Cargando secuencias de folios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Configuracion de Folios</h4>
          <p className="text-muted mb-0">Administra los prefijos y consecutivos de los documentos del sistema.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tipo de Documento</th>
                  <th>Prefijo</th>
                  <th>Formato</th>
                  <th>Secuencia Actual</th>
                  <th>Proximo Folio</th>
                  <th>Reset Anual</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sequences.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No hay secuencias de folios configuradas.
                    </td>
                  </tr>
                ) : (
                  sequences.map((seq) => {
                    const isEditing = editingType === seq.documentType
                    return (
                      <tr key={seq.documentType}>
                        <td className="fw-medium">
                          {DOCUMENT_TYPE_LABELS[seq.documentType] || seq.documentType}
                          <br />
                          <small className="text-muted">{seq.documentType}</small>
                        </td>

                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              style={{ width: '100px' }}
                              value={editForm.prefix || ''}
                              onChange={(e) => setEditForm({ ...editForm, prefix: e.target.value.toUpperCase() })}
                              maxLength={10}
                            />
                          ) : (
                            <span className="badge bg-primary">{seq.prefix}</span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <div className="d-flex gap-2 align-items-center flex-wrap">
                              <label className="form-check form-check-inline mb-0">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={editForm.include_year ?? false}
                                  onChange={(e) => setEditForm({ ...editForm, include_year: e.target.checked })}
                                />
                                <span className="form-check-label" style={{ fontSize: '13px' }}>Ano</span>
                              </label>
                              {editForm.include_year && (
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: '80px' }}
                                  value={editForm.year_format || 'y'}
                                  onChange={(e) => setEditForm({ ...editForm, year_format: e.target.value })}
                                >
                                  <option value="y">2 dig</option>
                                  <option value="Y">4 dig</option>
                                </select>
                              )}
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ width: '50px' }}
                                value={editForm.separator || ''}
                                onChange={(e) => setEditForm({ ...editForm, separator: e.target.value })}
                                placeholder="-"
                                maxLength={2}
                                title="Separador"
                              />
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ width: '70px' }}
                                value={editForm.padding || 6}
                                onChange={(e) => setEditForm({ ...editForm, padding: parseInt(e.target.value) || 6 })}
                                min={1}
                                max={10}
                                title="Padding (ceros)"
                              />
                            </div>
                          ) : (
                            <span style={{ fontSize: '13px' }}>
                              {seq.includeYear ? `Ano (${seq.yearFormat === 'Y' ? '4 dig' : '2 dig'})` : 'Sin ano'}
                              {' | Sep: "'}
                              {seq.separator}
                              {'" | Pad: '}
                              {seq.padding}
                            </span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '100px' }}
                              value={editForm.start_from ?? seq.currentSequence + 1}
                              onChange={(e) => setEditForm({ ...editForm, start_from: parseInt(e.target.value) || 1 })}
                              min={1}
                              title="Iniciar desde..."
                            />
                          ) : (
                            <span className="fw-bold">{seq.currentSequence}</span>
                          )}
                        </td>

                        <td>
                          <code className="fs-6">{seq.nextFolio}</code>
                        </td>

                        <td>
                          {isEditing ? (
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={editForm.reset_yearly ?? false}
                                onChange={(e) => setEditForm({ ...editForm, reset_yearly: e.target.checked })}
                              />
                            </div>
                          ) : (
                            seq.resetYearly ? (
                              <span className="badge bg-success">Si</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm btn-success" onClick={handleSave} disabled={saving}>
                                {saving ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check" />}
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={handleCancel} disabled={saving}>
                                <i className="bi bi-x" />
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(seq)}>
                              <i className="bi bi-pencil" />
                            </button>
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
          <h6 className="card-title">Ayuda</h6>
          <ul className="mb-0" style={{ fontSize: '13px' }}>
            <li><strong>Prefijo:</strong> El texto que precede al numero (ej: COT, OV, OC, REM).</li>
            <li><strong>Ano:</strong> Si se incluye el ano en el folio (ej: COT-26000001 vs COT-000001).</li>
            <li><strong>Separador:</strong> Caracter entre el prefijo/ano y el numero (generalmente &quot;-&quot;).</li>
            <li><strong>Padding:</strong> Cantidad de ceros a la izquierda del numero (6 = 000001).</li>
            <li><strong>Secuencia Actual:</strong> Al editar, puedes cambiar el numero desde el cual se generara el proximo folio.</li>
            <li><strong>Reset Anual:</strong> Si esta activo, la secuencia se reinicia al iniciar un nuevo ano.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
