'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEmailTemplates, useEmailTemplateActions } from '../hooks/useEmailTemplates'
import { emailTemplateService } from '../services/emailTemplateService'
import SendTestDialog from '../components/SendTestDialog'
import PreviewDialog from '../components/PreviewDialog'
import { toast } from '@/lib/toast'
import type { EmailTemplate, EmailTemplateFilters, EmailTemplatePreview } from '../types/emailTemplate'

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-secondary' },
  active: { label: 'Activo', className: 'bg-success' },
  archived: { label: 'Archivado', className: 'bg-warning text-dark' },
}

const CATEGORY_LABELS: Record<string, string> = {
  transactional: 'Transaccional',
  notification: 'Notificacion',
  marketing: 'Marketing',
}

export default function EmailTemplatesAdminTemplate() {
  const router = useRouter()
  const [filters, setFilters] = useState<EmailTemplateFilters>({})
  const { templates, isLoading, mutate } = useEmailTemplates(filters)
  const { remove, isSubmitting } = useEmailTemplateActions()

  const [sendTestTarget, setSendTestTarget] = useState<EmailTemplate | null>(null)
  const [previewData, setPreviewData] = useState<EmailTemplatePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Eliminar template "${template.name}"?`)) return
    try {
      await remove(template.id)
      toast.success('Template eliminado')
      mutate()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const handlePreview = async (template: EmailTemplate) => {
    setPreviewLoading(true)
    try {
      const preview = await emailTemplateService.preview(template.id)
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
            <i className="bi bi-palette me-2"></i>
            Plantillas de Email
          </h1>
          <p className="text-muted mb-0">Gestiona los templates de correo electronico del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard/mailer-manager/create')}>
          <i className="bi bi-plus-lg me-2"></i>
          Nueva Plantilla
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as EmailTemplateFilters['status'] || undefined })}
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as EmailTemplateFilters['category'] || undefined })}
              >
                <option value="">Todas las categorias</option>
                <option value="transactional">Transaccional</option>
                <option value="notification">Notificacion</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            {(filters.status || filters.category) && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilters({})}>
                  <i className="bi bi-x-lg me-1"></i>Limpiar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Asunto</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cargando...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No hay plantillas de email
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id}>
                    <td>
                      <strong>{tpl.name}</strong>
                      <br />
                      <small className="text-muted">{tpl.slug}</small>
                    </td>
                    <td><small>{tpl.subject}</small></td>
                    <td>
                      {tpl.category && (
                        <span className="badge bg-light text-dark">{CATEGORY_LABELS[tpl.category] || tpl.category}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGES[tpl.status]?.className || 'bg-secondary'}`}>
                        {STATUS_BADGES[tpl.status]?.label || tpl.status}
                      </span>
                    </td>
                    <td><small className="text-muted">{new Date(tpl.updatedAt).toLocaleDateString('es-MX')}</small></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          title="Vista previa"
                          onClick={() => handlePreview(tpl)}
                          disabled={previewLoading}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="Enviar prueba"
                          onClick={() => setSendTestTarget(tpl)}
                        >
                          <i className="bi bi-send"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          title="Editar"
                          onClick={() => router.push(`/dashboard/mailer-manager/${tpl.id}/edit`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Eliminar"
                          onClick={() => handleDelete(tpl)}
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-trash"></i>
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
          onSend={(email) => emailTemplateService.sendTest(sendTestTarget.id, email)}
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
