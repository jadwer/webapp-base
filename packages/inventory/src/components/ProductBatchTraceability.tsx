'use client'

/**
 * Trazabilidad del lote (rediseno de Inventario, 2026-11-16): sus movimientos (entradas,
 * salidas, ajustes y transferencias, ahora que los movimientos llevan la cuenta del lote)
 * y el retiro de mercado con su impacto. En laboratorio es obligatorio poder rastrear y
 * retirar un lote (REVISION_INVENTARIO.md, funcion 6).
 */

import { useState } from 'react'
import Link from 'next/link'
import { DetailSection, LwStatusPill, LwTableWrap, toast } from '@lwm/ui'
import { useInventoryMovements } from '../hooks'
import { lotTraceabilityService, type RecallImpact } from '../services/lotTraceabilityService'
import { MOVEMENT_TYPE } from '../utils/labels'
import { MOVEMENT_TYPE_TONE } from './MovementsListPage'
import { formatDate, formatQty } from '../utils/format'
import { apiErrorMessage } from '../utils/listing'

const REFERENCE_LABELS: Record<string, string> = {
  manual: 'Manual', purchase: 'Compra', sale: 'Venta', transfer: 'Transferencia', adjustment: 'Ajuste',
  remission: 'Remisión', shipment: 'Embarque', sales_order: 'Pedido', sales_cancel: 'Cancelación de venta',
  purchase_cancel: 'Cancelación de compra', fractionation: 'Fraccionamiento',
}

interface Props {
  batchId: string
  batchNumber: string
  status: string
  onRecalled?: () => void
}

export function ProductBatchTraceability({ batchId, batchNumber, status, onRecalled }: Props) {
  const { movements, isLoading } = useInventoryMovements({
    filters: { batchId },
    pagination: { page: 1, size: 100 },
    include: ['warehouse', 'destinationWarehouse'],
  })
  const [impact, setImpact] = useState<RecallImpact | null>(null)
  const [loadingImpact, setLoadingImpact] = useState(false)
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const recalled = status === 'recalled'

  const loadImpact = async () => {
    setLoadingImpact(true)
    try {
      setImpact(await lotTraceabilityService.getRecallImpact(batchId))
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo calcular el impacto del retiro'))
    } finally {
      setLoadingImpact(false)
    }
  }

  const recall = async () => {
    if (reason.trim().length < 10) {
      toast.error('Escribe el motivo del retiro (al menos 10 caracteres).')
      return
    }
    setSending(true)
    try {
      await lotTraceabilityService.initiateRecall(batchId, reason.trim())
      toast.success(`Retiro del lote ${batchNumber} iniciado: queda retirado y en cuarentena`)
      setReason('')
      onRecalled?.()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo iniciar el retiro del lote'))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <DetailSection title="Movimientos del lote" icon="bi-diagram-3" bodyClassName="p-0">
        <LwTableWrap>
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th>Almacén</th>
                <th className="text-end">Cantidad</th>
                <th className="text-end">Ver</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Cargando movimientos…</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Este lote todavía no tiene movimientos registrados.</td></tr>
              ) : (
                movements.map((m) => {
                  const incomingTransfer = m.movementType === 'transfer' && String(m.destinationBatchId ?? '') === String(batchId)
                  return (
                    <tr key={m.id}>
                      <td className="small text-nowrap">{formatDate(m.movementDate, { withTime: true })}</td>
                      <td>
                        <LwStatusPill tone={MOVEMENT_TYPE_TONE[m.movementType] ?? 'neutral'}>
                          {incomingTransfer ? 'Transferencia (entra)' : MOVEMENT_TYPE[m.movementType]?.label ?? m.movementType}
                        </LwStatusPill>
                      </td>
                      <td className="small">{REFERENCE_LABELS[m.referenceType] ?? m.referenceType}{m.referenceId ? ` #${m.referenceId}` : ''}</td>
                      <td className="small">
                        {incomingTransfer ? m.destinationWarehouse?.name ?? '—' : m.warehouse?.name ?? '—'}
                        {m.movementType === 'transfer' && !incomingTransfer && m.destinationWarehouse?.name ? <div className="text-muted">a {m.destinationWarehouse.name}</div> : null}
                      </td>
                      <td className="text-end">{formatQty(m.quantity)}</td>
                      <td className="text-end"><Link href={`/dashboard/inventory/movements/${m.id}`} aria-label={`Ver movimiento ${m.id}`}><i className="bi bi-eye" aria-hidden="true" /></Link></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </LwTableWrap>
      </DetailSection>

      <DetailSection title="Retiro de mercado" icon="bi-exclamation-octagon">
        {recalled ? (
          <p className="mb-0 text-danger">Este lote ya está retirado del mercado y en cuarentena: no sale producto de él.</p>
        ) : (
          <>
            <p className="text-muted">Antes de retirar el lote revisa cuánto salió y a qué ventas llegó.</p>
            <button type="button" className="btn btn-outline-secondary mb-3" onClick={loadImpact} disabled={loadingImpact}>
              {loadingImpact ? 'Calculando…' : 'Ver impacto del retiro'}
            </button>
            {impact?.impact ? (
              <dl className="row mb-3">
                <dt className="col-sm-5 text-muted fw-normal">Cantidad que ya salió</dt>
                <dd className="col-sm-7">{formatQty(impact.impact.total_quantity_distributed ?? 0)}</dd>
                <dt className="col-sm-5 text-muted fw-normal">Cantidad que queda</dt>
                <dd className="col-sm-7">{formatQty(impact.impact.remaining_quantity ?? 0)}</dd>
                <dt className="col-sm-5 text-muted fw-normal">Ventas afectadas</dt>
                <dd className="col-sm-7">{impact.impact.affected_sales_count ?? 0}</dd>
                <dt className="col-sm-5 text-muted fw-normal">Lotes derivados</dt>
                <dd className="col-sm-7">{impact.impact.destination_batches ?? 0}</dd>
              </dl>
            ) : null}
            <label htmlFor="recall-reason" className="form-label">Motivo del retiro</label>
            <textarea id="recall-reason" className="form-control mb-2" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej. resultado de pruebas fuera de especificación" />
            <button type="button" className="btn btn-danger" onClick={recall} disabled={sending}>
              <i className="bi bi-exclamation-octagon me-1" aria-hidden="true" /> {sending ? 'Iniciando…' : 'Iniciar retiro'}
            </button>
          </>
        )}
      </DetailSection>
    </>
  )
}
