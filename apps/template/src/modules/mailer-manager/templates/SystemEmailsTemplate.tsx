'use client'

import { useState } from 'react'
import { useSystemEmails, useSystemEmailActions } from '../hooks/useSystemEmails'
import { useEmailTemplates } from '../hooks/useEmailTemplates'
import { systemEmailService } from '../services/systemEmailService'
import SendTestDialog from '../components/SendTestDialog'
import PreviewDialog from '../components/PreviewDialog'
import { toast } from '@/lib/toast'
import type { SystemEmail, SystemEmailFilters, SystemEmailPreview } from '../types/systemEmail'

const MODULE_COLORS: Record<string, string> = {
  Ecommerce: 'bg-purple text-white',
  Sales: 'bg-primary',
  Auth: 'bg-info text-dark',
  Billing: 'bg-warning text-dark',
  Inventory: 'bg-secondary',
}

export default function SystemEmailsTemplate() {
  const [moduleFilter, setModuleFilter] = useState<string>('')
  const filters: SystemEmailFilters = moduleFilter ? { module: moduleFilter } : {}
  const { systemEmails, isLoading, mutate } = useSystemEmails(filters)
  const { templates } = useEmailTemplates({ status: 'active' })
  const { toggleEnabled, assignTemplate, isSubmitting } = useSystemEmailActions()

  const [sendTestTarget, setSendTestTarget] = useState<SystemEmail | null>(null)
  const [previewData, setPreviewData] = useState<SystemEmailPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const modules = [...new Set(systemEmails.map((se) => se.module))].sort()

  const handleToggle = async (se: SystemEmail) => {
    try {
      await toggleEnabled(se)
      toast.success(`${se.name}: ${se.isEnabled ? 'Deshabilitado' : 'Habilitado'}`)
      mutate()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const handleAssignTemplate = async (se: SystemEmail, templateId: string) => {
    try {
      await assignTemplate(se.id, templateId || null)
      toast.success(templateId ? 'Template asignado' : 'Template removido')
      mutate()
    } catch {
      toast.error('Error al asignar template')
    }
  }

  const handlePreview = async (se: SystemEmail) => {
    setPreviewLoading(true)
    try {
      const preview = await systemEmailService.preview(se.id)
      setPreviewData(preview)
    } catch {
      toast.error('Error al cargar vista previa')
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-gear me-2"></i>
            Emails del Sistema
          </h1>
          <p className="text-muted mb-0">Configura que emails se envian, cuales no, y asigna templates personalizados</p>
        </div>
      </div>

      {/* Module filter */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="d-flex gap-2 align-items-center">
            <span className="text-muted small">Filtrar por modulo:</span>
            <button
              className={`btn btn-sm ${!moduleFilter ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setModuleFilter('')}
            >
              Todos ({systemEmails.length})
            </button>
            {modules.map((mod) => (
              <button
                key={mod}
                className={`btn btn-sm ${moduleFilter === mod ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setModuleFilter(mod)}
              >
                {mod} ({systemEmails.filter((se) => se.module === mod).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Estado</th>
                <th>Modulo</th>
                <th>Email</th>
                <th style={{ width: '250px' }}>Template Asignado</th>
                <th className="text-end" style={{ width: '120px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <span className="spinner-border spinner-border-sm me-2"></span>Cargando...
                  </td>
                </tr>
              ) : systemEmails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">No hay emails del sistema registrados</td>
                </tr>
              ) : (
                systemEmails.map((se) => (
                  <tr key={se.id} className={!se.isEnabled ? 'table-light text-muted' : ''}>
                    <td className="text-center">
                      <div className="form-check form-switch d-inline-block">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={se.isEnabled}
                          onChange={() => handleToggle(se)}
                          disabled={isSubmitting}
                          title={se.isEnabled ? 'Deshabilitar' : 'Habilitar'}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${MODULE_COLORS[se.module] || 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                        {se.module}
                      </span>
                    </td>
                    <td>
                      <strong className={!se.isEnabled ? 'text-muted' : ''}>{se.name}</strong>
                      <br />
                      <small className="text-muted">{se.description}</small>
                      <br />
                      <code className="small" style={{ fontSize: '0.65rem' }}>{se.key}</code>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={se.emailTemplateId || ''}
                        onChange={(e) => handleAssignTemplate(se, e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="">-- Template por defecto (Blade) --</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          title="Vista previa"
                          onClick={() => handlePreview(se)}
                          disabled={previewLoading}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="Enviar prueba"
                          onClick={() => setSendTestTarget(se)}
                        >
                          <i className="bi bi-send"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Test Dialog */}
      {sendTestTarget && (
        <SendTestDialog
          isOpen={true}
          onClose={() => setSendTestTarget(null)}
          onSend={(email) => systemEmailService.sendTest(sendTestTarget.id, email)}
          title={`Enviar Prueba - ${sendTestTarget.name}`}
        />
      )}

      {/* Preview Dialog */}
      {previewData && (
        <PreviewDialog
          isOpen={true}
          onClose={() => setPreviewData(null)}
          subject={previewData.subject}
          html={previewData.html}
        />
      )}
    </div>
  )
}
