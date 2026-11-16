/**
 * Detalle del conteo ciclico con la piel del rediseno (2026-11-16). Con el conteo en
 * proceso muestra el registro de lo contado: el conteo es a ciegas (no se ensena la
 * existencia en sistema para no sesgar a quien cuenta) y por omision la diferencia se
 * ajusta en Movimientos. Ya registrado, muestra sistema, contado, diferencia, su valor y
 * el enlace al ajuste.
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DetailSection, LwStatusPill } from '@lwm/ui'
import { CYCLE_COUNT_STATUS_CONFIG, ABC_CLASS_CONFIG } from '../types/cycleCount'
import { CYCLE_COUNT_STATUS_TONE, VarianceText, formatCountDate, isOverdueCount } from './CycleCountsTableSimple'
import { formatMoney, formatQty } from '../utils/format'
import type { ParsedCycleCount } from '../types'

interface CycleCountDetailProps {
  cycleCount: ParsedCycleCount
  /** Registra lo contado; adjust ajusta la existencia a lo contado */
  onRecord?: (countedQuantity: number, adjust: boolean, notes?: string) => Promise<void>
  isLoading?: boolean
  recordErrors?: string[]
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="col-md-4">
    <div className="small text-muted">{label}</div>
    <div className="fw-semibold">{children}</div>
  </div>
)

export const statusPill = (c: ParsedCycleCount) => (
  <LwStatusPill tone={isOverdueCount(c) ? 'danger' : CYCLE_COUNT_STATUS_TONE[c.status] ?? 'neutral'}>
    {isOverdueCount(c) ? 'Vencido' : CYCLE_COUNT_STATUS_CONFIG[c.status]?.label ?? c.status}
  </LwStatusPill>
)

export const CycleCountDetail: React.FC<CycleCountDetailProps> = ({ cycleCount: c, onRecord, isLoading = false, recordErrors = [] }) => {
  const [counted, setCounted] = useState('')
  const [adjust, setAdjust] = useState(true)
  const [notes, setNotes] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const done = c.status === 'completed'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(counted)
    if (counted.trim() === '' || Number.isNaN(value)) { setLocalError('Captura la cantidad contada.'); return }
    if (value < 0) { setLocalError('Lo contado no puede ser negativo.'); return }
    setLocalError(null)
    await onRecord?.(value, adjust, notes.trim() || undefined)
  }

  return (
    <>
      <DetailSection title="Datos del conteo" icon="bi-info-circle">
        <div className="row g-3">
          <Field label="Producto">
            {c.product?.name ?? '—'}
            {c.product?.sku ? <div className="small text-muted fw-normal">SKU: {c.product.sku}</div> : null}
          </Field>
          <Field label="Almacén">
            {c.warehouse?.name ?? '—'}
            <div className="small text-muted fw-normal">{c.warehouseLocation?.name ?? 'Todo el almacén'}</div>
          </Field>
          <Field label="Estatus">{statusPill(c)}</Field>
          <Field label="Fecha programada">{formatCountDate(c.scheduledDate)}</Field>
          <Field label="Fecha de cierre">{c.completedDate ? formatCountDate(c.completedDate) : '—'}</Field>
          <Field label="Clasificación ABC">{c.abcClass ? ABC_CLASS_CONFIG[c.abcClass]?.description ?? c.abcClass : 'Sin clasificar'}</Field>
          <Field label="Asignado a">{c.assignedTo?.name ?? 'Sin asignar'}</Field>
          <Field label="Contó">{c.countedBy?.name ?? '—'}</Field>
        </div>
        {c.notes ? (
          <div className="mt-3">
            <div className="small text-muted">Notas</div>
            <div style={{ whiteSpace: 'pre-line' }}>{c.notes}</div>
          </div>
        ) : null}
      </DetailSection>

      {c.status === 'in_progress' && onRecord ? (
        <DetailSection title="Registrar lo contado" icon="bi-check2-square">
          {(localError || recordErrors.length > 0) && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              {localError ?? (recordErrors.length === 1 ? recordErrors[0] : <ul className="mb-0 ps-3">{recordErrors.map((m) => <li key={m}>{m}</li>)}</ul>)}
            </div>
          )}
          <form onSubmit={submit} noValidate>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label htmlFor="cc-counted" className="form-label">Cantidad contada <span className="text-danger">*</span></label>
                <input id="cc-counted" type="number" min="0" step="0.0001" className="form-control" value={counted} onChange={(e) => setCounted(e.target.value)} disabled={isLoading} />
              </div>
              <div className="col-md-5">
                <label htmlFor="cc-record-notes" className="form-label">Notas</label>
                <input id="cc-record-notes" type="text" className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} disabled={isLoading} placeholder="Ej. dos piezas dañadas en anaquel" />
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input id="cc-adjust" type="checkbox" className="form-check-input" checked={adjust} onChange={(e) => setAdjust(e.target.checked)} disabled={isLoading} />
                  <label htmlFor="cc-adjust" className="form-check-label">Ajustar la existencia a lo contado</label>
                </div>
                <div className="small text-muted">Si hay diferencia se registra un ajuste en Movimientos.</div>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : <i className="bi bi-check2-square me-1" aria-hidden="true" />}
                Registrar conteo
              </button>
            </div>
          </form>
        </DetailSection>
      ) : null}

      {done ? (
        <DetailSection title="Resultado" icon="bi-clipboard-data">
          <div className="row g-3">
            <Field label="En sistema">{c.systemQuantity != null ? formatQty(c.systemQuantity) : '—'}</Field>
            <Field label="Contado">{c.countedQuantity != null ? formatQty(c.countedQuantity) : '—'}</Field>
            <Field label="Diferencia"><VarianceText count={c} /></Field>
            <Field label="Valor de la diferencia">{c.varianceValue != null ? formatMoney(c.varianceValue) : '—'}</Field>
            <Field label="Ajuste en Movimientos">
              {c.adjustmentMovementId ? (
                <Link href={`/dashboard/inventory/movements/${c.adjustmentMovementId}`}>Ver ajuste</Link>
              ) : c.hasVariance ? 'Sin ajustar' : 'No hizo falta'}
            </Field>
          </div>
        </DetailSection>
      ) : null}
    </>
  )
}
