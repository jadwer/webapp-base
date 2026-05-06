'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEmailTemplate, useEmailTemplateActions } from '../hooks/useEmailTemplates'
import VariablePicker from '../components/VariablePicker'
import SendTestDialog from '../components/SendTestDialog'
import PreviewDialog from '../components/PreviewDialog'
import { emailTemplateService } from '../services/emailTemplateService'
import { toast } from '@/lib/toast'
import type { Editor } from 'grapesjs'
import type { EmailTemplatePreview } from '../types/emailTemplate'

interface EmailTemplateEditorTemplateProps {
  templateId: string
  availableVariables?: Record<string, string>
}

export default function EmailTemplateEditorTemplate({ templateId, availableVariables }: EmailTemplateEditorTemplateProps) {
  const router = useRouter()
  const { template, isLoading } = useEmailTemplate(templateId)
  const { update, sendTest, isSubmitting } = useEmailTemplateActions()

  const editorRef = useRef<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(false)
  const [subject, setSubject] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('draft')
  const [showSendTest, setShowSendTest] = useState(false)
  const [previewData, setPreviewData] = useState<EmailTemplatePreview | null>(null)

  const defaultVariables: Record<string, string> = availableVariables || {
    customer_name: 'Nombre del cliente',
    customer_email: 'Email del cliente',
    company_name: 'Nombre de la empresa',
    quote_number: 'Numero de cotizacion',
    order_number: 'Numero de orden',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'IVA',
    currency: 'Moneda',
    date: 'Fecha',
    notes: 'Notas',
  }

  // Initialize GrapeJS editor
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return

    let mounted = true

    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default
      const presetNewsletter = (await import('grapesjs-preset-newsletter')).default
      const blocksBasic = (await import('grapesjs-blocks-basic')).default

      if (!mounted || !containerRef.current) return

      const editor = grapesjs.init({
        container: containerRef.current,
        height: '65vh',
        fromElement: false,
        storageManager: false,
        plugins: [presetNewsletter, blocksBasic],
        canvas: {
          styles: [],
        },
      })

      editorRef.current = editor
      setEditorReady(true)
    }

    initEditor()

    return () => {
      mounted = false
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [])

  // Load template content into editor
  useEffect(() => {
    if (!template || !editorRef.current || !editorReady) return

    setName(template.name)
    setSubject(template.subject)
    setStatus(template.status)

    const editor = editorRef.current

    // Load from GrapeJS JSON state if available, otherwise from HTML
    if (template.json && Object.keys(template.json).length > 0) {
      try {
        editor.loadProjectData(template.json as Parameters<typeof editor.loadProjectData>[0])
      } catch {
        // Fallback to HTML
        if (template.html) {
          editor.setComponents(template.html)
        }
        if (template.css) {
          editor.setStyle(template.css)
        }
      }
    } else {
      if (template.html) {
        editor.setComponents(template.html)
      }
      if (template.css) {
        editor.setStyle(template.css)
      }
    }
  }, [template, editorReady])

  const handleSave = useCallback(async () => {
    if (!editorRef.current || !template) return

    const editor = editorRef.current
    const html = editor.getHtml()
    const css = editor.getCss()
    const json = editor.getProjectData()

    try {
      await update(template.id, {
        name,
        subject,
        status,
        html: html || '',
        css: css || '',
        json: json as Record<string, unknown>,
      })
      toast.success('Template guardado')
    } catch {
      toast.error('Error al guardar')
    }
  }, [template, name, subject, status, update])

  const handlePreview = async () => {
    if (!template) return
    // Save first, then preview
    await handleSave()
    try {
      const preview = await emailTemplateService.preview(template.id)
      setPreviewData(preview)
    } catch {
      toast.error('Error al cargar vista previa')
    }
  }

  const handleInsertVariable = useCallback((variable: string) => {
    const editor = editorRef.current
    if (!editor) return

    // Insert at cursor position in the editor
    const selected = editor.getSelected()
    if (selected) {
      const content = selected.get('content') || ''
      selected.set('content', content + variable)
    } else {
      // Append to body if nothing selected
      editor.addComponents(variable)
    }
    toast.info(`Variable ${variable} insertada`)
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border"></span>
        <p className="mt-2">Cargando template...</p>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="alert alert-danger">Template no encontrado</div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push('/dashboard/mailer-manager')}>
            <i className="bi bi-arrow-left me-1"></i>Volver
          </button>
          <h1 className="h4 mb-0">
            <i className="bi bi-pencil-square me-2"></i>
            Editar Template
          </h1>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" onClick={handlePreview} disabled={isSubmitting}>
            <i className="bi bi-eye me-1"></i>Preview
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setShowSendTest(true)}>
            <i className="bi bi-send me-1"></i>Enviar Prueba
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>
            ) : (
              <><i className="bi bi-check-lg me-1"></i>Guardar</>
            )}
          </button>
        </div>
      </div>

      {/* Metadata bar */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nombre del template"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text">Asunto</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Asunto del email (soporta {{variables}})"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div className="col-md-2">
              <small className="text-muted">{template.slug}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Editor + Variable Picker */}
      <div className="row">
        <div className="col-md-9">
          <div className="card">
            <div ref={containerRef} />
          </div>
        </div>
        <div className="col-md-3">
          <VariablePicker
            variables={defaultVariables}
            onInsert={handleInsertVariable}
          />
        </div>
      </div>

      {/* Send Test Dialog */}
      <SendTestDialog
        isOpen={showSendTest}
        onClose={() => setShowSendTest(false)}
        onSend={(email) => sendTest(template.id, email)}
        title={`Enviar Prueba - ${template.name}`}
      />

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
