'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LwResultModal, LwStatusPill, toast } from '@lwm/ui'
import { designErrorMessage, documentDesignService } from './documentDesignService'
import { pageValue, setCellStyle, setPageStyle, setThemeStyle } from './layoutOps'
import type { DesignStyle, DocumentDesign, DocumentDesignSummary, RawLayout, StyleOption } from './types'

const PREVIEW_DELAY = 700

/**
 * Diseno de los PDF (2026-11-12): por documento, se escoge una plantilla de
 * la galeria y se ajusta el estilo fila por fila (logo, fondo del titulo,
 * encabezado de la tabla, marcos, titulos de seccion, total), con la vista
 * previa del PDF real. El contenido no se edita aqui. Plantillas, opciones y
 * miniaturas salen del backend (atomo/documents).
 */
export function DocumentDesigner() {
  const [types, setTypes] = useState<DocumentDesignSummary[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [design, setDesign] = useState<DocumentDesign | null>(null)
  const [draft, setDraft] = useState<RawLayout | null>(null)
  const [style, setStyle] = useState('standard')
  const [saved, setSaved] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null)

  const snapshot = (layout: RawLayout | null, s: string) => JSON.stringify({ layout, s })
  const dirty = draft !== null && snapshot(draft, style) !== saved

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
    // Sin esto el documento anterior queda en pantalla mientras carga el nuevo.
    setDesign(null)
    setDraft(null)
    try {
      const data = await documentDesignService.get(type)
      setDesign(data)
      setDraft(data.layout)
      setStyle(data.style)
      setSaved(snapshot(data.layout, data.style))
    } catch (err) {
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

  const pickStyle = async (key: string) => {
    if (!design) return
    setSaveError(null)
    try {
      const res = await documentDesignService.applyStyle(design.type, key)
      setDraft(res.layout)
      setStyle(res.style)
    } catch (err) {
      toast.error(await designErrorMessage(err, 'No se pudo aplicar la plantilla.'))
    }
  }

  const save = async () => {
    if (!design || !draft) return
    setBusy(true)
    setSaveError(null)
    try {
      const res = await documentDesignService.save(design.type, draft, style)
      setDraft(res.layout)
      setStyle(res.style)
      setSaved(snapshot(res.layout, res.style))
      setDesign({ ...design, customized: res.customized, updatedAt: res.updatedAt, style: res.style })
      setTypes((list) => list.map((t) => (t.type === design.type ? { ...t, customized: true, style: res.style } : t)))
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
      setStyle(res.style)
      setSaved(snapshot(res.layout, res.style))
      setDesign({ ...design, customized: false, updatedAt: null, style: res.style })
      setTypes((list) => list.map((t) => (t.type === design.type ? { ...t, customized: false, style: res.style } : t)))
      toast.success('Se restauró el diseño de fábrica.')
    } catch (err) {
      toast.error(await designErrorMessage(err, 'No se pudo restaurar el diseño de fábrica.'))
    } finally {
      setBusy(false)
      setConfirmRestore(false)
    }
  }

  const toggleEnabled = async (value: boolean) => {
    if (!design) return
    try {
      await documentDesignService.setSetting(design.enabledKey, value)
      setDesign({ ...design, enabled: value })
      setTypes((list) => list.map((t) => (t.type === design.type ? { ...t, enabled: value } : t)))
    } catch (err) {
      toast.error(await designErrorMessage(err, 'No se pudo guardar el ajuste.'))
    }
  }

  const styleLabel = design?.styles.find((s) => s.key === style)?.label ?? style

  return (
    <div>
      <p className="text-muted">
        Escoge una plantilla para cada documento y, si quieres, ajusta el estilo fila por fila: tamaño del logo, fondo del
        título, encabezados remarcados, marcos y color. La información del documento es la misma; cambia cómo se ve. A la
        derecha ves el PDF real con el documento más reciente.
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
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h2 className="h6 mb-1">{design.label}</h2>
                    <LwStatusPill tone={design.customized ? 'info' : 'neutral'}>
                      {design.customized ? `Personalizado (${styleLabel})` : 'Diseño de fábrica'}
                    </LwStatusPill>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      id="designer-enabled"
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      checked={design.enabled}
                      onChange={(e) => toggleEnabled(e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="designer-enabled">
                      {design.enabled ? 'Los PDF salen con este diseño' : 'Apagado: los PDF salen con el formato anterior'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="h6">Plantilla</h3>
            <div className="row g-2 mb-4" role="radiogroup" aria-label="Plantilla">
              {design.styles.map((s) => (
                <div key={s.key} className="col-6">
                  <StyleCard type={design.type} item={s} selected={style === s.key} onPick={() => pickStyle(s.key)} />
                </div>
              ))}
            </div>

            <h3 className="h6">Ajustar fila por fila</h3>
            <div className="card mb-2">
              <div className="card-header py-1 small fw-semibold">Todo el documento</div>
              <div className="card-body py-2">
                <div className="row g-2">
                  {design.catalog.theme.map((opt) => (
                    <div key={opt.key} className="col-sm-6">
                      <OptionField
                        id={`designer-theme-${opt.key}`}
                        option={opt}
                        value={draft.theme?.[opt.key as 'mode' | 'accent']}
                        onChange={(v) => setDraft(setThemeStyle(draft, opt.key as 'mode' | 'accent', v as string | undefined))}
                      />
                    </div>
                  ))}
                  {design.catalog.page.map((opt) => (
                    <div key={opt.key} className="col-sm-6">
                      <OptionField
                        id={`designer-page-${opt.key.replace('.', '-')}`}
                        option={opt}
                        value={pageValue(draft, opt.key)}
                        onChange={(v) => setDraft(setPageStyle(draft, opt.key, v))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {draft.rows.map((row, r) => {
              const cells = row.cells.map((cell, c) => ({ cell, c, block: design.catalog.blocks[cell.block] }))
              const withOptions = cells.filter((x) => x.block && x.block.options.length > 0)
              const title = cells.map((x) => x.block?.label ?? x.cell.block).join(' + ')
              return (
                <div key={r} className="card mb-2" data-testid={`designer-row-${r}`}>
                  <div className="card-header py-1 small fw-semibold">Fila {r + 1}: {title}</div>
                  <div className="card-body py-2">
                    {withOptions.length === 0 ? (
                      <div className="small text-muted">Sin opciones de estilo; toma el color del documento.</div>
                    ) : (
                      <div className="row g-2">
                        {withOptions.map(({ cell, c, block }) => (
                          <div key={c} className={withOptions.length > 1 ? 'col-sm-6' : 'col-12'}>
                            {withOptions.length > 1 && <div className="small fw-semibold mb-1">{block.label}</div>}
                            {block.options.map((opt) => (
                              <OptionField
                                key={opt.key}
                                id={`designer-${r}-${c}-${opt.key}`}
                                option={opt}
                                value={cell.options?.[opt.key]}
                                onChange={(v) => setDraft(setCellStyle(draft, r, c, opt.key, v))}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {saveError && <div className="alert alert-danger py-2" role="alert">{saveError}</div>}

            <div className="d-flex flex-wrap gap-2 mt-3">
              <button type="button" className="btn btn-primary" disabled={!dirty || busy} onClick={save}>
                {busy ? 'Guardando…' : 'Guardar diseño'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={!dirty || busy}
                onClick={() => { const s = JSON.parse(saved); setDraft(s.layout); setStyle(s.s); setSaveError(null) }}
              >
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
            <PreviewPane type={design.type} layout={draft} />
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

/** Un campo de estilo; el valor vacio es "de fabrica" (la omision del catalogo). */
function OptionField({ id, option, value, onChange }: { id: string; option: StyleOption; value: unknown; onChange: (v: unknown) => void }) {
  const defaultLabel = option.values?.find((v) => v.value === option.default)?.label
  if (option.type === 'color') {
    const color = typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : ''
    return (
      <div className="mb-2">
        <label className="form-label small mb-1" htmlFor={id}>{option.label}</label>
        <div className="d-flex gap-2 align-items-center">
          <input id={id} type="color" className="form-control form-control-color form-control-sm" value={color || '#0094ff'} onChange={(e) => onChange(e.target.value)} />
          <span className="small text-muted">{color ? color : 'El de la marca'}</span>
          {color && (
            <button type="button" className="btn btn-sm btn-link px-0" onClick={() => onChange(undefined)}>Usar el de la marca</button>
          )}
        </div>
      </div>
    )
  }
  if (option.type === 'bool') {
    return (
      <div className="form-check mb-2">
        <input id={id} type="checkbox" className="form-check-input" checked={value === undefined ? Boolean(option.default) : Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <label className="form-check-label small" htmlFor={id}>{option.label}</label>
      </div>
    )
  }
  return (
    <div className="mb-2">
      <label className="form-label small mb-1" htmlFor={id}>{option.label}</label>
      <select
        id={id}
        className="form-select form-select-sm"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      >
        <option value="">{defaultLabel ? `${defaultLabel} (de fábrica)` : 'De fábrica'}</option>
        {(option.values ?? []).map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
      </select>
    </div>
  )
}

function StyleCard({ type, item, selected, onPick }: { type: string; item: DesignStyle; selected: boolean; onPick: () => void }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!item.thumbnail) return
    let url: string | null = null
    let alive = true
    documentDesignService.thumbnail(type, item.key)
      .then((blob) => {
        if (!alive) return
        url = URL.createObjectURL(blob)
        setSrc(url)
      })
      .catch(() => undefined)
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [type, item.key, item.thumbnail])

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`Plantilla ${item.label}`}
      onClick={onPick}
      className={`card w-100 h-100 text-start p-2 ${selected ? 'border-primary border-2' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="bg-light rounded mb-2 d-flex align-items-center justify-content-center w-100" style={{ aspectRatio: '8.5 / 11', overflow: 'hidden' }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`Miniatura de la plantilla ${item.label}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        ) : (
          <span className="small text-muted">Sin miniatura</span>
        )}
      </div>
      <div className="d-flex justify-content-between align-items-center w-100">
        <span className="fw-semibold small">{item.label}</span>
        {selected && <span className="badge bg-primary">Elegida</span>}
      </div>
      <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{item.description}</span>
    </button>
  )
}

function PreviewPane({ type, layout }: { type: string; layout: RawLayout }) {
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
        const blob = await documentDesignService.preview(type, JSON.parse(body))
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
  }, [type, body])

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
