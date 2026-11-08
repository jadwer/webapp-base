'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatDateTime, toast } from '@lwm/ui'
import { useGuide } from '../hooks/useGuide'
import { apiMessage } from '../lib/apiMessage'
import { runGuideAction } from '../lib/runGuideAction'
import { defaultHrefFor, departmentLabel, statusLabel, typeLabel } from '../labels'
import type { GuideAction, GuideTrailEntry } from '../types'
import { GuideActionModal } from './GuideActionModal'

export interface GuidePanelProps {
  /** Tipo JSON:API del documento ("quotes", "sales-orders", "remissions"). */
  type: string
  id: string | number
  /** Cambia cuando el documento cambia en la pantalla (updatedAt o estado): la guia se vuelve a pedir. */
  revision?: string | null
  /**
   * La pagina toma la accion (abre su modal de convertir, de enviar, de
   * rechazar). Devuelve true si la tomo. Toda accion con `asks` debe pasar por
   * aqui: la barra nunca inventa el formulario (D10).
   */
  onAction?: (action: GuideAction) => boolean | void
  /** Despues de ejecutar una accion generica: la pagina recarga su documento. */
  onDone?: () => void
  /** Ruta de cada documento del expediente; por omision las del panel de LWM. */
  hrefFor?: (entry: GuideTrailEntry) => string | null
  title?: string
  className?: string
}

/**
 * Siguiente paso y expediente de un documento (flujo guiado, F4). La barra
 * muestra lo que el backend dice (frase, quien, que falta) y enruta cada
 * accion a la pagina; solo ejecuta directo las que no piden datos.
 */
export function GuidePanel({ type, id, revision, onAction, onDone, hrefFor = defaultHrefFor, title = 'Siguiente paso', className = 'card mb-4' }: GuidePanelProps) {
  const { guide, error, refresh } = useGuide(type, id, revision)
  const [pending, setPending] = useState<GuideAction | null>(null)
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  // Sin guia (modulo apagado, 404 por permiso o error) la pagina sigue igual que antes.
  if (!guide || error) return null

  const primary = guide.next.filter((a) => a.kind === 'primary')
  const secondary = guide.next.filter((a) => a.kind === 'secondary' && a.allowed)
  const trail = guide.trail.length > 1 ? guide.trail : []

  const start = (action: GuideAction) => {
    setMenuOpen(false)
    if (onAction?.(action) === true) return
    if (action.asks.length > 0) {
      toast.info('Este paso pide datos: hazlo desde las acciones del documento.')
      return
    }
    setPending(action)
  }

  const confirm = async (reason: string) => {
    if (!pending) return
    setBusy(true)
    try {
      await runGuideAction(pending, reason)
      toast.success('Listo')
      setPending(null)
      await refresh()
      onDone?.()
    } catch (err) {
      toast.error(apiMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className} data-testid="guide-panel">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-signpost-2" aria-hidden="true"></i>
          <h5 className="mb-0">{title}</h5>
          <span className="badge bg-primary">{departmentLabel(guide.department)}</span>
        </div>
        {secondary.length > 0 ? (
          <div className="dropdown" ref={menuRef}>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Más acciones
            </button>
            {menuOpen ? (
              <ul className="dropdown-menu dropdown-menu-end show" role="menu">
                {secondary.map((a) => (
                  <li key={a.key}>
                    <button type="button" role="menuitem" className={`dropdown-item${a.requiresReason ? ' text-danger' : ''}`} onClick={() => start(a)}>
                      {a.phrase}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="card-body">
        {primary.length === 0 ? <p className="text-muted mb-0">Sin pasos pendientes en este documento.</p> : null}
        {primary.map((action) => (
          <div key={action.key} className="mb-3" data-testid={`guide-action-${action.key}`}>
            <p className="fw-medium mb-2">{action.phrase}</p>
            {action.blockers.length > 0 ? (
              <ul className="list-unstyled mb-2">
                {action.blockers.map((b) => (
                  <li key={b.field} className="text-warning-emphasis">
                    <i className="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
                    <span className="fw-medium">Falta:</span> {b.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {!action.allowed ? (
              <p className="text-muted small mb-0">Lo hace {departmentLabel(action.department)}.</p>
            ) : action.blockers.length === 0 ? (
              <button type="button" className="btn btn-sm btn-primary" onClick={() => start(action)}>
                <i className="bi bi-arrow-right-circle me-1" aria-hidden="true"></i>
                Hacer este paso
              </button>
            ) : null}
          </div>
        ))}
        {trail.length > 0 ? (
          <>
            <hr />
            <h6 className="text-muted mb-2">Expediente ({trail.length})</h6>
            <ul className="list-unstyled mb-0" data-testid="guide-trail">
              {trail.map((entry) => {
                const href = entry.current ? null : hrefFor(entry)
                const next = entry.next.find((a) => a.kind === 'primary')
                const last = entry.history[entry.history.length - 1]
                const name = `${typeLabel(entry.type)} ${entry.label}`
                return (
                  <li key={`${entry.type}:${entry.id}`} className="d-flex flex-wrap align-items-center gap-2 py-1">
                    {href ? (
                      <Link href={href} className="fw-medium">{name}</Link>
                    ) : (
                      <span className="fw-medium">{name}</span>
                    )}
                    <span className={`badge ${entry.current ? 'bg-primary' : 'bg-secondary'}`}>{statusLabel(entry.status)}</span>
                    <span className="badge bg-light text-dark border">{departmentLabel(entry.department)}</span>
                    {next ? <span className="small text-muted">{next.phrase}</span> : null}
                    {last?.at ? (
                      <span className="small text-muted ms-auto">
                        {formatDateTime(last.at)}
                        {last.by ? `, ${last.by}` : ''}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
      </div>
      <GuideActionModal action={pending} busy={busy} onClose={() => (busy ? null : setPending(null))} onConfirm={confirm} />
    </div>
  )
}
