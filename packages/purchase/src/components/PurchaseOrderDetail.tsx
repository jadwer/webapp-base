'use client'

/**
 * CONSULTAR ORDEN DE COMPRA con la piel del rediseno (Figma "Consultar orden", 2026-11-17).
 * Aqui viven las acciones que cambian el estatus (decision de Gabino: sin campo Estatus en
 * el formulario): Aprobar o Rechazar cuando la orden pide aprobacion, Recibir (todo lo
 * pendiente o por partida, en tandas) y Cancelar (si ya se recibio, el backend revierte la
 * entrada al stock y anula la cuenta por pagar). Total sin IVA: entra con la factura.
 */

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { ConfirmModal, LwSurface, LwPageTitle, LwTableWrap, LwStatusPill, formatCurrency, formatDateOnly, todayDateInput, toast, type ConfirmModalHandle } from '@lwm/ui'
import { purchaseService } from '../services'
import { purchaseStatusLabel, purchaseStatusTone, isPurchaseOrderClosed, purchaseApiErrors } from '../utils/status'
import { etaStatus } from '../utils/eta'
import type { PurchaseOrder, PurchaseOrderItem } from '../types'

const BASE = '/dashboard/purchase'
const ETA_TONE = { late: 'danger', today: 'warning', ok: 'info' } as const

export interface PurchaseOrderDetailProps {
  purchaseOrder: PurchaseOrder
  items: PurchaseOrderItem[]
  itemsLoading?: boolean
  /** Refresca orden y partidas tras una accion */
  onChanged: () => void | Promise<void>
}

const qty = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 4 })

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="small text-muted mb-1">{label}</div>
      <div className="form-control bg-light" style={{ minHeight: 38 }}>{children}</div>
    </div>
  )
}

export const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({ purchaseOrder: o, items, itemsLoading, onChanged }) => {
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [receiving, setReceiving] = useState(false)
  const [toReceive, setToReceive] = useState<Record<string, string>>({})
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const number = o.orderNumber || `#${o.id}`
  const eta = etaStatus(o.expectedArrivalDate, o.status)
  const approvalPending = o.approvalStatus === 'pending'
  const canReceive = (o.status === 'pending' || o.status === 'approved') && !approvalPending && o.approvalStatus !== 'rejected'
  const pendingOf = (it: PurchaseOrderItem) => Math.max(0, Number(it.quantity) - Number(it.receivedQuantity ?? 0))
  const total = items.reduce((s, it) => s + Number(it.total || 0), 0)

  const run = async (key: string, action: () => Promise<void>, fallback: string) => {
    setBusy(key)
    setErrors([])
    try {
      await action()
      await onChanged()
      return true
    } catch (err) {
      const list = purchaseApiErrors(err, fallback)
      setErrors(list)
      toast.error(list[0])
      return false
    } finally {
      setBusy(null)
    }
  }

  const approve = async () => {
    const ok = await confirmRef.current?.confirm(`¿Aprobar la orden ${number}?`, { title: 'Aprobar orden', confirmText: 'Aprobar', cancelText: 'Volver', confirmVariant: 'success' })
    if (!ok) return
    await run('approve', async () => {
      const r = await purchaseService.orders.approve(o.id)
      if (r.allApproved) toast.success(r.message)
      else toast.info(r.message)
      r.budgetWarnings.forEach((w) => toast.warning(w))
    }, 'No se pudo aprobar la orden.')
  }

  const reject = async () => {
    if (!reason.trim()) { setErrors(['Escribe el motivo del rechazo.']); return }
    const done = await run('reject', async () => {
      await purchaseService.orders.reject(o.id, reason.trim())
      toast.success(`Orden ${number} rechazada`)
    }, 'No se pudo rechazar la orden.')
    if (done) { setRejecting(false); setReason('') }
  }

  const openReceive = () => {
    setToReceive(Object.fromEntries(items.map((it) => [String(it.id), String(pendingOf(it))])))
    setErrors([])
    setReceiving(true)
  }

  const receive = async () => {
    const lines = items
      .map((it) => ({ itemId: Number(it.id), receivedQuantity: Number(toReceive[String(it.id)] || 0), pending: pendingOf(it), name: (it.product as { name?: string } | undefined)?.name || `Partida ${it.id}` }))
    const bad = lines.filter((l) => !Number.isFinite(l.receivedQuantity) || l.receivedQuantity < 0 || l.receivedQuantity > l.pending)
    if (bad.length) { setErrors(bad.map((l) => `${l.name}: recibe entre 0 y ${qty(l.pending)}.`)); return }
    const chosen = lines.filter((l) => l.receivedQuantity > 0)
    if (!chosen.length) { setErrors(['Captura al menos una cantidad a recibir.']); return }
    const ok = await confirmRef.current?.confirm(
      `Se registrará la entrada al almacén de ${chosen.length} partida(s). Al completar toda la orden se crea la cuenta por pagar del proveedor.`,
      { title: `Recibir orden ${number}`, confirmText: 'Recibir', cancelText: 'Volver', confirmVariant: 'primary' },
    )
    if (!ok) return
    const done = await run('receive', async () => {
      await purchaseService.orders.receive(o.id, { items: chosen.map(({ itemId, receivedQuantity }) => ({ itemId, receivedQuantity })), receivedDate: todayDateInput() })
      toast.success('Mercancía recibida: el stock se actualizó')
    }, 'No se pudo recibir la orden.')
    if (done) setReceiving(false)
  }

  const cancel = async () => {
    const ok = await confirmRef.current?.confirm(
      o.status === 'received'
        ? `La orden ${number} ya se recibió: al cancelarla se revierte la entrada al stock y se anula la cuenta por pagar. No se puede deshacer.`
        : `¿Cancelar la orden ${number}? No se puede deshacer.`,
      { title: 'Cancelar orden', confirmText: 'Cancelar orden', cancelText: 'Volver', confirmVariant: 'danger' },
    )
    if (!ok) return
    await run('cancel', async () => {
      await purchaseService.orders.cancel(o.id)
      toast.success(`Orden ${number} cancelada`)
    }, 'No se pudo cancelar la orden.')
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Consultar orden:"
          highlight={number}
          subtitle={
            <span className="d-inline-flex flex-wrap align-items-center gap-2">
              <LwStatusPill tone={purchaseStatusTone(o.status)}>{purchaseStatusLabel(o.status)}</LwStatusPill>
              {approvalPending ? <LwStatusPill tone="warning">Requiere aprobación antes de recibirse</LwStatusPill> : null}
              {o.approvalStatus === 'rejected' ? <LwStatusPill tone="danger">Aprobación rechazada</LwStatusPill> : null}
            </span>
          }
          actions={
            <>
              <Link href={BASE} className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver</Link>
              {approvalPending && o.status === 'pending' ? (
                <>
                  <button type="button" className="btn btn-outline-danger" onClick={() => { setRejecting(true); setErrors([]) }} disabled={busy !== null}>Rechazar</button>
                  <button type="button" className="btn btn-success" onClick={approve} disabled={busy !== null}>
                    {busy === 'approve' ? <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> : <i className="bi bi-check-circle me-1" aria-hidden="true" />}Aprobar
                  </button>
                </>
              ) : null}
              {canReceive ? (
                <button type="button" className="btn btn-outline-primary" onClick={openReceive} disabled={busy !== null || receiving || itemsLoading}>
                  <i className="bi bi-box-arrow-in-down me-1" aria-hidden="true" /> Recibir mercancía
                </button>
              ) : null}
              {o.status !== 'cancelled' ? (
                <button type="button" className="btn btn-outline-danger" onClick={cancel} disabled={busy !== null}>
                  {busy === 'cancel' ? <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> : null}Cancelar orden
                </button>
              ) : null}
            </>
          }
        />

        {errors.length ? (
          <div className="alert alert-danger" role="alert">
            <ul className="mb-0">{errors.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        ) : null}

        {rejecting ? (
          <div className="border rounded p-3 mb-4">
            <label htmlFor="po-reject-reason" className="form-label fw-semibold">Motivo del rechazo</label>
            <textarea id="po-reject-reason" className="form-control" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setRejecting(false)}>Volver</button>
              <button type="button" className="btn btn-danger" onClick={reject} disabled={busy !== null}>Rechazar orden</button>
            </div>
          </div>
        ) : null}

        <div className="row g-3 mb-4">
          <div className="col-md-6"><Field label="Proveedor">{o.contact?.name || 'Proveedor sin datos'}</Field></div>
          <div className="col-md-3"><Field label="Fecha de orden">{o.orderDate ? formatDateOnly(o.orderDate) : '—'}</Field></div>
          <div className="col-md-3">
            <Field label="Llegada estimada">
              {o.expectedArrivalDate ? formatDateOnly(o.expectedArrivalDate) : <span className="text-muted">Sin fecha del proveedor</span>}
              {eta.tone === 'late' || eta.tone === 'today' || eta.tone === 'ok' ? <span className="ms-2"><LwStatusPill tone={ETA_TONE[eta.tone]}>{eta.label}</LwStatusPill></span> : null}
            </Field>
          </div>
          <div className="col-md-3"><Field label="Número de orden">{number}</Field></div>
          <div className="col-md-6"><Field label="Notas">{o.notes || <span className="text-muted">Sin notas</span>}</Field></div>
          <div className="col-md-3"><Field label="Última actualización">{o.updatedAt ? formatDateOnly(o.updatedAt.slice(0, 10)) : '—'}</Field></div>
        </div>

        <h2 className="h5 mb-3">Productos</h2>
        <div className="row g-3">
          <div className="col-lg-9">
            <LwTableWrap>
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="text-center">No.</th>
                    <th>Producto</th>
                    <th className="text-end">Cantidad</th>
                    <th className="text-end">Costo unitario</th>
                    <th className="text-end">Recibido</th>
                    {receiving ? <th style={{ width: 140 }}>Recibir ahora</th> : null}
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsLoading ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Cargando partidas…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No hay productos en esta orden</td></tr>
                  ) : (
                    items.map((it, i) => {
                      const p = (it.product ?? {}) as { name?: string; sku?: string }
                      const pending = pendingOf(it)
                      return (
                        <tr key={it.id}>
                          <td className="text-center text-muted">{String(i + 1).padStart(2, '0')}</td>
                          <td>
                            <div>{p.name || `Producto ${it.productId}`}</div>
                            {p.sku ? <div className="small text-muted">SKU: {p.sku}</div> : null}
                            {(it.metadata as { no_charge?: boolean } | null)?.no_charge ? <div className="small text-muted">Sin costo</div> : null}
                          </td>
                          <td className="text-end">{qty(Number(it.quantity))}</td>
                          <td className="text-end text-nowrap">{formatCurrency(Number(it.unitPrice))}</td>
                          <td className="text-end">
                            {qty(Number(it.receivedQuantity ?? 0))}
                            {pending > 0 && Number(it.receivedQuantity ?? 0) > 0 ? <div className="small text-muted">Faltan {qty(pending)}</div> : null}
                          </td>
                          {receiving ? (
                            <td>
                              <input
                                type="number" min={0} max={pending} step="any"
                                className="form-control form-control-sm"
                                aria-label={`Recibir ahora de ${p.name || it.productId}`}
                                value={toReceive[String(it.id)] ?? ''}
                                disabled={pending === 0}
                                onChange={(e) => setToReceive((m) => ({ ...m, [String(it.id)]: e.target.value }))}
                              />
                            </td>
                          ) : null}
                          <td className="text-end text-nowrap">{formatCurrency(Number(it.total || 0))}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </LwTableWrap>
            {receiving ? (
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setReceiving(false)}>Volver</button>
                <button type="button" className="btn btn-primary" onClick={receive} disabled={busy !== null}>
                  {busy === 'receive' ? <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> : null}Registrar recepción
                </button>
              </div>
            ) : null}
          </div>
          <div className="col-lg-3">
            <div className="border rounded p-3">
              <h3 className="h6 mb-3">Resumen de la orden</h3>
              <div className="d-flex justify-content-between small text-muted mb-2"><span>Partidas</span><span>{items.length}</span></div>
              <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 border-top pt-2">
                <span className="fw-semibold">Total de la orden</span>
                <span className="fs-5 fw-semibold text-success">{formatCurrency(items.length ? total : o.totalAmount)}</span>
              </div>
              <div className="small text-muted mt-2">El IVA se registra con la factura del proveedor.</div>
              {o.apInvoiceId ? (
                <Link href={`/dashboard/finance/ap-invoices/${o.apInvoiceId}`} className="btn btn-outline-primary btn-sm w-100 mt-3">Ver cuenta por pagar</Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          {/* El Figma dice "Cancelar"; aqui es "Volver" para no confundirlo con Cancelar orden */}
          <Link href={BASE} className="btn btn-outline-primary px-4">Volver</Link>
          {!isPurchaseOrderClosed(o.status) ? (
            <Link href={`${BASE}/${o.id}/edit`} className="btn btn-primary px-4">Ir a editar orden</Link>
          ) : null}
        </div>
      </LwSurface>
      <ConfirmModal ref={confirmRef} />
    </div>
  )
}

export default PurchaseOrderDetail
