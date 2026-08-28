'use client'

/**
 * Configuracion de Documentos
 *
 * Pantalla unificada (estilo Bind) con pestañas:
 *  - Leyendas: texto configurable por tipo de documento, impreso en el PDF
 *  - Folios: consecutivos COT/OV/OC/REM (pantalla existente montada como pestaña)
 *  - Series: series de facturacion CFDI (pantalla existente montada como pestaña)
 *
 * Las rutas viejas /settings/folios y /settings/invoice-series siguen vivas;
 * el menu apunta aqui.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  documentLegendsService,
  LEGEND_DOCUMENT_TYPE_LABELS,
} from '@/modules/billing/services/documentLegendsService'
import type {
  DocumentLegend,
  DocumentLegendPlaceholder,
  LegendDocumentType,
} from '@/modules/billing/services/documentLegendsService'
import { toast } from '@/lib/toast'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import FoliosSettingsPage from '../folios/page'
import InvoiceSeriesSettingsPage from '../invoice-series/page'

type TabKey = 'leyendas' | 'folios' | 'series'

const LEGEND_TYPES = Object.keys(LEGEND_DOCUMENT_TYPE_LABELS) as LegendDocumentType[]

/**
 * Valores de ejemplo SOLO para la vista previa (el render real lo hace el
 * backend al generar cada PDF; esto es cosmetico).
 */
const PREVIEW_SAMPLES: Record<string, string> = {
  '{folio}': 'COT-26000123',
  '{fecha_emision}': '25/08/2026',
  '{fecha_vencimiento}': '24/09/2026',
  '{total}': '$11,600.00 MXN',
  '{total_letra}': 'ONCE MIL SEISCIENTOS PESOS 00/100 M.N.',
  '{cliente}': 'ACME Laboratorios SA de CV',
  '{rfc_cliente}': 'ACM010101AB1',
  '{empresa}': 'Mi Empresa SA de CV',
  '{dias_credito}': '30',
}

function extractJsonApiErrors(error: unknown): string[] {
  const err = error as { response?: { data?: { errors?: Array<{ detail?: string; title?: string }> } } }
  const errors = err.response?.data?.errors
  if (!Array.isArray(errors) || errors.length === 0) return []
  return errors.map(e => e.detail || e.title || '').filter(Boolean)
}

function DocumentLegendsTab() {
  const [legends, setLegends] = useState<Record<string, DocumentLegend>>({})
  const [placeholders, setPlaceholders] = useState<DocumentLegendPlaceholder[]>([])
  const [selectedType, setSelectedType] = useState<LegendDocumentType>('quote')
  const [body, setBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [legendList, placeholderList] = await Promise.all([
        documentLegendsService.getAll(),
        documentLegendsService.getPlaceholders(),
      ])
      const byType: Record<string, DocumentLegend> = {}
      for (const legend of legendList) {
        byType[legend.documentType] = legend
      }
      setLegends(byType)
      setPlaceholders(placeholderList)
    } catch {
      toast.error('Error al cargar las leyendas de documentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const legend = legends[selectedType]
    setBody(legend?.body ?? '')
    setIsActive(legend?.isActive ?? true)
  }, [selectedType, legends])

  const currentLegend = legends[selectedType]
  const hasActiveLegend = Boolean(currentLegend && currentLegend.isActive && currentLegend.body.trim())
  const usesConditionsFallback = selectedType === 'quote' || selectedType === 'sales_order'

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setBody(prev => prev + placeholder)
      return
    }
    const start = textarea.selectionStart ?? body.length
    const end = textarea.selectionEnd ?? body.length
    const next = body.slice(0, start) + placeholder + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + placeholder.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const knownPlaceholders = new Set(placeholders.map(p => p.placeholder))

  const renderPreview = () => {
    if (!body.trim()) return null
    const parts = body.split(/(\{[a-z_]+\})/g)
    return parts.map((part, index) => {
      if (/^\{[a-z_]+\}$/.test(part)) {
        if (knownPlaceholders.has(part)) {
          return (
            <span key={index} className="text-primary">
              {PREVIEW_SAMPLES[part] ?? part}
            </span>
          )
        }
        return (
          <mark key={index} className="bg-warning-subtle" title="Placeholder desconocido: se imprime tal cual">
            {part}
          </mark>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const handleSave = async () => {
    if (!body.trim()) {
      toast.error('Escribe el texto de la leyenda antes de guardar')
      return
    }
    try {
      setSaving(true)
      let saved: DocumentLegend
      if (currentLegend) {
        saved = await documentLegendsService.update(currentLegend.id, { body, isActive })
      } else {
        saved = await documentLegendsService.create({ documentType: selectedType, body, isActive })
      }
      setLegends(prev => ({ ...prev, [selectedType]: saved }))
      toast.success(`Leyenda de ${LEGEND_DOCUMENT_TYPE_LABELS[selectedType]} guardada`)
    } catch (error) {
      const details = extractJsonApiErrors(error)
      if (details.length > 0) {
        toast.error(details.join('\n'), { duration: 0 })
      } else {
        toast.error('Error al guardar la leyenda')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!currentLegend) return
    const confirmed = await confirmModalRef.current?.confirm(
      `La leyenda de ${LEGEND_DOCUMENT_TYPE_LABELS[selectedType]} se eliminara y el documento volvera a su texto por defecto. ¿Continuar?`,
      { title: 'Eliminar leyenda', confirmVariant: 'danger' }
    )
    if (!confirmed) return

    try {
      setSaving(true)
      await documentLegendsService.delete(currentLegend.id)
      setLegends(prev => {
        const next = { ...prev }
        delete next[selectedType]
        return next
      })
      toast.success('Leyenda eliminada')
    } catch (error) {
      const details = extractJsonApiErrors(error)
      toast.error(details.join('\n') || 'Error al eliminar la leyenda', { duration: details.length ? 0 : undefined })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="card mb-3">
          <div className="card-header d-flex align-items-center justify-content-between">
            <span>
              <i className="bi bi-card-text me-2" aria-hidden="true" />
              Leyenda por tipo de documento
            </span>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="legend-doc-type">Tipo de documento</label>
              <select
                id="legend-doc-type"
                className="form-select"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as LegendDocumentType)}
              >
                {LEGEND_TYPES.map(type => (
                  <option key={type} value={type}>
                    {LEGEND_DOCUMENT_TYPE_LABELS[type]}
                    {legends[type]?.isActive && legends[type]?.body.trim() ? ' (con leyenda)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="legend-body">Texto de la leyenda</label>
              <textarea
                id="legend-body"
                ref={textareaRef}
                className="form-control"
                rows={5}
                maxLength={2000}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Ej. Cotizacion {folio} valida hasta {fecha_vencimiento}. Precios mas IVA."
              />
              <div className="form-text">
                Cada linea se imprime como un renglon en el PDF. Maximo 2000 caracteres ({body.length}/2000).
              </div>
            </div>

            <div className="mb-3">
              <div className="small text-muted mb-1">Haz clic para insertar un dato del documento:</div>
              <div className="d-flex flex-wrap gap-1">
                {placeholders.map(item => (
                  <button
                    key={item.placeholder}
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    title={item.description}
                    onClick={() => insertPlaceholder(item.placeholder)}
                  >
                    {item.placeholder}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="legend-active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="legend-active">
                Leyenda activa (se imprime en el PDF)
              </label>
            </div>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar leyenda'}
              </button>
              {currentLegend && (
                <button type="button" className="btn btn-outline-danger" onClick={handleDelete} disabled={saving}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card mb-3">
          <div className="card-header">
            <i className="bi bi-eye me-2" aria-hidden="true" />
            Vista previa (datos de ejemplo)
          </div>
          <div className="card-body" style={{ whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
            {body.trim() ? renderPreview() : <span className="text-muted">Escribe la leyenda para ver la vista previa.</span>}
          </div>
        </div>

        {!hasActiveLegend && (
          <div className="alert alert-info small mb-3">
            <i className="bi bi-info-circle me-1" aria-hidden="true" />
            {usesConditionsFallback
              ? 'Sin leyenda activa, este documento imprime las condiciones comerciales generales (o los textos por defecto del sistema).'
              : 'Sin leyenda activa, este documento no imprime ninguna leyenda.'}
          </div>
        )}

        <div className="alert alert-light border small">
          Un dato entre llaves que no este en la lista se imprime tal cual (no rompe el PDF); la vista previa lo marca en amarillo.
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default function DocumentsSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('leyendas')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'folios' || tab === 'series') {
      setActiveTab(tab)
    }
  }, [])

  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'leyendas', label: 'Leyendas', icon: 'bi-card-text' },
    { key: 'folios', label: 'Folios', icon: 'bi-123' },
    { key: 'series', label: 'Series', icon: 'bi-collection' },
  ]

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h3 mb-1">Configuracion de Documentos</h1>
          <p className="text-muted mb-0">
            Leyendas, folios y series de los documentos que emite el sistema
          </p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3" role="tablist">
        {tabs.map(tab => (
          <li key={tab.key} className="nav-item" role="presentation">
            <button
              type="button"
              role="tab"
              className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi ${tab.icon} me-2`} aria-hidden="true" />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {activeTab === 'leyendas' && <DocumentLegendsTab />}
        {activeTab === 'folios' && <FoliosSettingsPage />}
        {activeTab === 'series' && <InvoiceSeriesSettingsPage />}
      </div>
    </div>
  )
}
