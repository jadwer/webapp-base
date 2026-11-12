'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LwResultModal, LwStatusPill, toast } from '@lwm/ui'
import { CellEditor } from './CellEditor'
import { designErrorMessage, documentDesignService } from './documentDesignService'
import { addRow, moveRow, removeCell, removeRow, setBlock, setLeftSpan, setOption, spanOf, splitRow } from './layoutOps'
import type { DocumentDesign, DocumentDesignSummary, RawLayout } from './types'

const PREVIEW_DELAY = 700

/**
 * Editor visual de documentos PDF (2026-11-12): por documento, sus secciones
 * en filas, las opciones de cada una, colores, pie de pagina y la vista previa
 * del PDF real con el documento mas reciente. Lo que ofrece sale del catalogo
 * del backend y lo que se guarda lo valida el backend con el formato de Atomo.
 */
export function DocumentDesigner() {
  const [types, setTypes] = useState<DocumentDesignSummary[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [design, setDesign] = useState<DocumentDesign | null>(null)
  const [draft, setDraft] = useState<RawLayout | null>(null)
  const [saved, setSaved] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [newBlock, setNewBlock] = useState('')
  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null)

  const dirty = draft !== null && JSON.stringify(draft) !== saved

  useEffect(() => {
    documentDesignService.list()
      .then((list) => {
        setTypes(list)
        setActive((current) => current ?? list[0]?.type ?? null)
      })
      .catch(async (err) => setLoadError(await designErrorMessage(err, 'No se pudo cargar la lista de documentos.')))
  }, [])

  const load = useCallback(async (type: string) => {
    setLoadError(null)
    setSaveError(null)
    // Sin esto el documento anterior queda en pantalla mientras carga el nuevo
    // y lo que se edite en ese instante se pierde.
    setDesign(null)
    setDraft(null)
    try {
      const data = await documentDesignService.get(type)
      setDesign(data)
      setDraft(data.layout)
      setSaved(JSON.stringify(data.layout))
    } catch (err) {
      setDesign(null)
      setDraft(null)
      setLoadError(await designErrorMessage(err, 'No se pudo cargar el diseño.'))
    }
  }, [])

  useEffect(() => {
    if (active) load(active)
  }, [active, load])

  const switchTo = (type: string) => {
    if (type === active) return
    if (dirty) {
      setPendingSwitch(type)
      return
    }
    setActive(type)
  }

  const save = async () => {
    if (!design || !draft) return
    setBusy(true)
    setSaveError(null)
    try {
      const res = await documentDesignService.save(design.type, draft)
      setDraft(res.layout)
      setSaved(JSON.stringify(res.layout))
      setDesign({ ...design, customized: res.customized, updatedAt: res.updatedAt })
      setTypes((list) => list.map((t) => (t.type === design.type ? { ...t, customized: true } : t)))
      toast.success('Diseño guardado. Los PDF nuevos ya salen así.')
    } catch (err) {
      setSaveError(await designErrorMessage(err, 'No se pudo guardar el diseño.'))
    } finally {
      setBusy(false)
    }
  }

  const restore = async () => {
    if (!design) return
    setBusy(true)
    try {
      const res = await documentDesignService.restore(design.type)
      setDraft(res.layout)
      setSaved(JSON.stringify(res.layout))
      setDesign({ ...design, customized: false, updatedAt: null })
      setTypes((list) => list.map((t) => (t.type === design.type ? { ...t, customized: false } : t)))
      toast.success('Se restauró el diseño de fábrica.')
    } catch (err) {
      toast.error(await designErrorMessage(err, 'No se pudo restaurar el diseño de fábrica.'))
    } finally {
      setBusy(false)
      setConfirmRestore(false)
    }
  }

  const setSetting = async (key: string, value: string | boolean, patch: Partial<DocumentDesignSummary>) => {
    if (!design) return
    try {
      await documentDesignService.setSetting(key, value)
      setDesign({ ...design, ...patch })
      // La cotizacion de la tienda comparte los colores con la cotizacion.
      setTypes((list) => list.map((t) => (t.enabledKey === key || t.modeKey === key ? { ...t, ...(t.enabledKey === key ? { enabled: Boolean(value) } : { mode: String(value) }) } : t)))
    } catch (err) {
      toast.error(await designErrorMessage(err, 'No se pudo guardar el ajuste.'))
    }
  }

  const blockLabel = useMemo(() => {
    const map = new Map((design?.catalog.blocks ?? []).map((b) => [b.key, b.label]))
    return (key: string) => map.get(key) ?? key
  }, [design])

  const addSection = () => {
    if (!draft || !design || !newBlock) return
    const defaults = newBlock === 'lines' ? { columns: design.catalog.columns.map((c) => c.key) } : {}
    setDraft(addRow(draft, newBlock, defaults))
    setNewBlock('')
  }

  return (
    <div>
      <p className="text-muted">
        Arma cada PDF por secciones: cambia el orden, junta dos en una fila, elige columnas y datos. A la derecha ves el
        PDF real con el documento más reciente. Los cambios aplican a los PDF que se generen después de guardar.
      </p>

      {types.length > 0 && (
        <ul className="nav nav-pills mb-3 flex-wrap gap-1" role="tablist" aria-label="Documento">
          {types.map((t) => (
            <li key={t.type} className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={active === t.type}
                className={`nav-link ${active === t.type ? 'active' : ''}`}
                onClick={() => switchTo(t.type)}
              >
                {t.label}
                {t.customized && <span className="badge bg-light text-dark ms-2">Personalizado</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}

      {!design && !loadError && active && <div className="text-muted small py-4">Cargando el diseño…</div>}

      {design && draft && (
        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h2 className="h6 mb-1">{design.label}</h2>
                    <LwStatusPill tone={design.customized ? 'info' : 'neutral'}>
                      {design.customized ? 'Diseño personalizado' : 'Diseño de fábrica'}
                    </LwStatusPill>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      id="designer-enabled"
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      checked={design.enabled}
                      onChange={(e) => setSetting(design.enabledKey, e.target.checked, { enabled: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="designer-enabled">
                      {design.enabled ? 'Los PDF salen con este diseño' : 'Apagado: los PDF salen con el formato anterior'}
                    </label>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-sm-6">
                    <label className="form-label small mb-1" htmlFor="designer-mode">Colores</label>
                    <select
                      id="designer-mode"
                      className="form-select form-select-sm"
                      value={design.mode}
                      onChange={(e) => setSetting(design.modeKey, e.target.value, { mode: e.target.value })}
                    >
                      {design.modes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    {design.type === 'cart_quote' && <div className="form-text">Los comparte con la cotización.</div>}
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small mb-1" htmlFor="designer-watermark">Marca de agua</label>
                    <input
                      id="designer-watermark"
                      className="form-control form-control-sm"
                      value={draft.page?.watermark ?? ''}
                      placeholder="Sin marca de agua"
                      onChange={(e) => setDraft({ ...draft, page: { ...draft.page, watermark: e.target.value === '' ? null : e.target.value } })}
                    />
                  </div>
                </div>
                <div className="d-flex gap-3 mt-2">
                  {([['legal', 'Leyenda legal al pie'], ['pageNumbers', 'Números de página']] as const).map(([key, label]) => (
                    <div key={key} className="form-check">
                      <input
                        id={`designer-footer-${key}`}
                        type="checkbox"
                        className="form-check-input"
                        checked={draft.page?.footer?.[key] ?? true}
                        onChange={(e) => setDraft({ ...draft, page: { ...draft.page, footer: { ...draft.page?.footer, [key]: e.target.checked } } })}
                      />
                      <label className="form-check-label small" htmlFor={`designer-footer-${key}`}>{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {draft.rows.map((row, r) => (
              <div key={r} className="card mb-2" data-testid={`designer-row-${r}`}>
                <div className="card-header py-1 d-flex align-items-center justify-content-between">
                  <span className="small fw-semibold">
                    Fila {r + 1}: {row.cells.map((c) => blockLabel(c.block)).join(' + ')}
                  </span>
                  <span className="text-nowrap">
                    <button type="button" className="btn btn-sm btn-link px-1" aria-label={`Subir fila ${r + 1}`} disabled={r === 0} onClick={() => setDraft(moveRow(draft, r, -1))}>
                      <i className="bi bi-arrow-up" aria-hidden="true" />
                    </button>
                    <button type="button" className="btn btn-sm btn-link px-1" aria-label={`Bajar fila ${r + 1}`} disabled={r === draft.rows.length - 1} onClick={() => setDraft(moveRow(draft, r, 1))}>
                      <i className="bi bi-arrow-down" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger px-1"
                      aria-label={`Quitar fila ${r + 1}`}
                      disabled={draft.rows.length === 1}
                      title={draft.rows.length === 1 ? 'El documento necesita al menos una fila' : undefined}
                      onClick={() => setDraft(removeRow(draft, r))}
                    >
                      <i className="bi bi-trash" aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="card-body py-2">
                  <div className="row g-3">
                    {row.cells.map((cell, c) => (
                      <div key={c} className={row.cells.length === 2 ? 'col-6' : 'col-12'}>
                        <CellEditor
                          cell={cell}
                          catalog={design.catalog}
                          shared={row.cells.length === 2}
                          idPrefix={`designer-${r}-${c}`}
                          onBlock={(block) => setDraft(setBlock(draft, r, c, block))}
                          onOption={(name, value) => setDraft(setOption(draft, r, c, name, value))}
                        />
                        {row.cells.length === 2 && (
                          <button type="button" className="btn btn-sm btn-link text-danger px-0 mt-1" onClick={() => setDraft(removeCell(draft, r, c as 0 | 1))}>
                            Quitar esta sección de la fila
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {row.cells.length === 2 ? (
                    <div className="mt-2">
                      <label className="form-label small mb-0" htmlFor={`designer-${r}-span`}>
                        Ancho: {Math.round((spanOf(row, 0) / 12) * 100)}% izquierda, {Math.round((spanOf(row, 1) / 12) * 100)}% derecha
                      </label>
                      <input
                        id={`designer-${r}-span`}
                        type="range"
                        className="form-range"
                        min={3}
                        max={9}
                        value={spanOf(row, 0)}
                        onChange={(e) => setDraft(setLeftSpan(draft, r, Number(e.target.value)))}
                      />
                    </div>
                  ) : (
                    row.cells[0].block !== 'lines' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary mt-2"
                        onClick={() => setDraft(splitRow(draft, r, design.catalog.blocks.find((b) => !b.alone && b.key !== row.cells[0].block)?.key ?? 'notes'))}
                      >
                        <i className="bi bi-layout-split me-1" aria-hidden="true" />Agregar otra sección al lado
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className="d-flex gap-2 align-items-center my-3">
              <select className="form-select form-select-sm" aria-label="Sección para la fila nueva" value={newBlock} onChange={(e) => setNewBlock(e.target.value)}>
                <option value="">Agregar una fila con la sección…</option>
                {design.catalog.blocks.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
              </select>
              <button type="button" className="btn btn-sm btn-outline-primary text-nowrap" disabled={!newBlock} onClick={addSection}>
                Agregar fila
              </button>
            </div>

            {saveError && <div className="alert alert-danger py-2" role="alert">{saveError}</div>}

            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" disabled={!dirty || busy} onClick={save}>
                {busy ? 'Guardando…' : 'Guardar diseño'}
              </button>
              <button type="button" className="btn btn-outline-secondary" disabled={!dirty || busy} onClick={() => { setDraft(JSON.parse(saved)); setSaveError(null) }}>
                Descartar cambios
              </button>
              <button
                type="button"
                className="btn btn-outline-danger ms-auto"
                disabled={!design.customized || busy}
                title={design.customized ? undefined : 'Ya usa el diseño de fábrica'}
                onClick={() => setConfirmRestore(true)}
              >
                Restaurar de fábrica
              </button>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <PreviewPane type={design.type} layout={draft} mode={design.mode} />
          </div>
        </div>
      )}

      <LwResultModal
        open={pendingSwitch !== null}
        tone="warning"
        title="Hay cambios sin guardar"
        message="Si cambias de documento se descartan los cambios de este."
        confirmLabel="Descartar y cambiar"
        cancelLabel="Seguir editando"
        onConfirm={() => { setActive(pendingSwitch); setPendingSwitch(null) }}
        onCancel={() => setPendingSwitch(null)}
      />

      <LwResultModal
        open={confirmRestore}
        tone="danger"
        title="¿Restaurar el diseño de fábrica?"
        message="Se pierde el diseño personalizado de este documento. Los PDF nuevos saldrán con el de fábrica."
        confirmLabel="Restaurar"
        cancelLabel="Regresar"
        busy={busy}
        onConfirm={restore}
        onCancel={() => setConfirmRestore(false)}
      />
    </div>
  )
}

function PreviewPane({ type, layout, mode }: { type: string; layout: RawLayout; mode: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const seq = useRef(0)
  const body = JSON.stringify(layout)

  useEffect(() => {
    const mine = ++seq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const blob = await documentDesignService.preview(type, JSON.parse(body), mode)
        if (mine !== seq.current) return
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old)
          return URL.createObjectURL(blob)
        })
        setError(null)
      } catch (err) {
        if (mine !== seq.current) return
        setError(await designErrorMessage(err, 'No se pudo generar la vista previa.'))
      } finally {
        if (mine === seq.current) setLoading(false)
      }
    }, PREVIEW_DELAY)
    return () => clearTimeout(timer)
  }, [type, body, mode])

  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  return (
    <div className="card position-sticky" style={{ top: 16 }}>
      <div className="card-header py-2 d-flex justify-content-between align-items-center">
        <span className="small fw-semibold">Vista previa (PDF real, sin guardar)</span>
        {loading && <span className="spinner-border spinner-border-sm" role="status" aria-label="Generando vista previa" />}
      </div>
      {error && <div className="alert alert-warning m-2 py-2" role="alert">{error}</div>}
      {url ? (
        <iframe title="Vista previa del PDF" src={url} style={{ width: '100%', height: '80vh', border: 0 }} />
      ) : (
        !error && <div className="p-4 text-muted small">Generando la vista previa…</div>
      )}
    </div>
  )
}
