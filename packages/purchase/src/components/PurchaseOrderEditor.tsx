'use client'

/**
 * ALTA Y EDICION DE ORDEN DE COMPRA con la piel del rediseno (Figma "Crear nueva orden
 * de compra" y "Editar orden", 2026-11-17). Decisiones de Gabino: sin campo Estatus (la
 * orden nace pendiente y cambia con Aprobar, Recibir y Cancelar en la consulta) y sin IVA
 * en el resumen (la contadora: el IVA entra con la factura del proveedor). Las partidas se
 * capturan aqui mismo; el numero de orden lo asigna el sistema.
 *
 * Alta: una sola llamada a purchase-orders/with-items (transaccion en el servidor).
 * Edicion: PATCH de los datos y luego las partidas cambiadas (alta, cambio, baja).
 */

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LwSurface, LwPageTitle, LwTableWrap, LwIconButton, LwResultModal, formatCurrency, todayDateInput, toDateInput, toast } from '@lwm/ui'
import { BranchSelect } from '@lwm/auth'
import { ProductSearchSelect, type ProductSearchOption } from '@lwm/products'
import { usePurchaseContacts, usePurchaseOrderMutations, usePurchaseOrderItemMutations } from '../hooks'
import { purchaseApiErrors, isPurchaseOrderClosed } from '../utils/status'
import type { PurchaseOrder, PurchaseOrderItem } from '../types'

const BASE = '/dashboard/purchase'

interface Line {
  key: string
  /** Id de la partida guardada; vacio en partidas nuevas */
  id?: string
  productId: string
  productName: string
  sku?: string
  quantity: string
  unitPrice: string
  noCharge: boolean
  receivedQuantity: number
}

interface SupplierResource {
  id: string | number
  attributes?: { name?: string }
  name?: string
}

export interface PurchaseOrderEditorProps {
  /** Orden a editar; sin ella es alta */
  purchaseOrder?: PurchaseOrder
  items?: PurchaseOrderItem[]
  /** Se llama tras guardar en edicion (refrescar SWR) */
  onSaved?: () => void | Promise<void>
}

let seq = 0
const newKey = () => `n${++seq}`

const toLine = (item: PurchaseOrderItem): Line => {
  const product = (item.product ?? {}) as { name?: string; sku?: string }
  return {
    key: `i${item.id}`,
    id: String(item.id),
    productId: String(item.productId),
    productName: product.name || `Producto ${item.productId}`,
    sku: product.sku || undefined,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    noCharge: Boolean((item.metadata as { no_charge?: boolean } | null)?.no_charge),
    receivedQuantity: Number(item.receivedQuantity ?? 0),
  }
}

const num = (v: string) => (v.trim() === '' ? NaN : Number(v))
const lineTotal = (l: Line) => (Number.isFinite(num(l.quantity)) && Number.isFinite(num(l.unitPrice)) ? num(l.quantity) * num(l.unitPrice) : 0)

export const PurchaseOrderEditor: React.FC<PurchaseOrderEditorProps> = ({ purchaseOrder, items = [], onSaved }) => {
  const router = useRouter()
  const editing = Boolean(purchaseOrder)
  const { contacts, isLoading: suppliersLoading } = usePurchaseContacts()
  const { createPurchaseOrderWithItems, updatePurchaseOrder } = usePurchaseOrderMutations()
  const { createPurchaseOrderItem, updatePurchaseOrderItem, deletePurchaseOrderItem } = usePurchaseOrderItemMutations()

  const [contactId, setContactId] = useState(purchaseOrder ? String(purchaseOrder.contactId) : '')
  const [orderDate, setOrderDate] = useState(toDateInput(purchaseOrder?.orderDate) || todayDateInput())
  const [eta, setEta] = useState(toDateInput(purchaseOrder?.expectedArrivalDate) || '')
  const [branchId, setBranchId] = useState(purchaseOrder?.branchId ? String(purchaseOrder.branchId) : '')
  const [notes, setNotes] = useState(purchaseOrder?.notes ?? '')
  const original = useMemo(() => items.map(toLine), [items])
  const [lines, setLines] = useState<Line[]>(original)
  const [adding, setAdding] = useState(items.length === 0)
  const [pick, setPick] = useState<ProductSearchOption | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)

  const suppliers = (contacts as SupplierResource[]).map((c) => ({ id: String(c.id), name: c.attributes?.name || c.name || `Proveedor ${c.id}` }))
  const total = lines.reduce((sum, l) => sum + lineTotal(l), 0)
  const closed = purchaseOrder ? isPurchaseOrderClosed(purchaseOrder.status) : false

  const setLine = (key: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const addProduct = (id: string, product?: ProductSearchOption) => {
    if (!id || !product) return
    if (lines.some((l) => l.productId === id)) {
      toast.info(`${product.name} ya está en la orden; cambia su cantidad.`)
      return
    }
    setLines((ls) => [...ls, { key: newKey(), productId: id, productName: product.name, sku: product.sku, quantity: '1', unitPrice: '', noCharge: false, receivedQuantity: 0 }])
    setPick(null)
    setAdding(false)
  }

  /** Validacion local de lo que captura el usuario; el backend vuelve a validar. */
  const validate = (): string[] => {
    const list: string[] = []
    if (!contactId) list.push('Elige el proveedor.')
    if (!orderDate) list.push('La fecha de la orden es obligatoria.')
    if (eta && orderDate && eta < orderDate) list.push('La fecha estimada de llegada no puede ser anterior a la fecha de la orden.')
    if (lines.length === 0) list.push('Agrega al menos un producto.')
    lines.forEach((l) => {
      const q = num(l.quantity)
      const p = num(l.unitPrice)
      if (!Number.isFinite(q) || q <= 0) list.push(`${l.productName}: la cantidad debe ser mayor a cero.`)
      else if (q < l.receivedQuantity) list.push(`${l.productName}: ya se recibieron ${l.receivedQuantity}; la cantidad no puede ser menor.`)
      if (!Number.isFinite(p) || p < 0) list.push(`${l.productName}: captura el costo unitario.`)
      else if (p === 0 && !l.noCharge) list.push(`${l.productName}: costo en cero solo si la marcas como sin costo.`)
    })
    return list
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const local = validate()
    setErrors(local)
    if (local.length) return
    setSaving(true)
    try {
      if (!purchaseOrder) {
        const created = await createPurchaseOrderWithItems({
          contactId,
          orderDate,
          expectedArrivalDate: eta || null,
          status: 'pending',
          notes,
          branchId,
          items: lines.map((l) => ({ productId: l.productId, quantity: num(l.quantity), unitPrice: num(l.unitPrice), noCharge: l.noCharge })),
        })
        toast.success(`Orden ${created.orderNumber} creada`)
        router.push(`${BASE}/${created.id}`)
        return
      }

      await updatePurchaseOrder(purchaseOrder.id, {
        contactId: Number(contactId),
        orderDate,
        expectedArrivalDate: eta || null,
        status: purchaseOrder.status,
        notes,
        ...(branchId && { branchId }),
      })
      const before = new Map(original.map((l) => [l.id, l]))
      for (const l of original) {
        if (l.id && !lines.some((x) => x.id === l.id)) await deletePurchaseOrderItem(l.id)
      }
      for (const l of lines) {
        const data = { purchaseOrderId: purchaseOrder.id, productId: l.productId, quantity: num(l.quantity), unitPrice: num(l.unitPrice), discount: 0, noCharge: l.noCharge }
        if (!l.id) {
          await createPurchaseOrderItem(data)
        } else {
          const prev = before.get(l.id)
          if (prev && (prev.quantity !== l.quantity || prev.unitPrice !== l.unitPrice || prev.noCharge !== l.noCharge)) {
            await updatePurchaseOrderItem(l.id, data)
          }
        }
      }
      await onSaved?.()
      setSavedOpen(true)
    } catch (err) {
      setErrors(purchaseApiErrors(err, 'No se pudo guardar la orden de compra.'))
      if (editing) await onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  if (purchaseOrder && closed) {
    return (
      <div className="container-fluid py-4">
        <LwSurface>
          <LwPageTitle title="Editar orden:" highlight={purchaseOrder.orderNumber} subtitle="Esta orden ya no se puede editar" />
          <div className="alert alert-info">
            Una orden {purchaseOrder.status === 'received' ? 'recibida' : 'cancelada'} ya no cambia sus datos ni sus partidas.
          </div>
          <Link href={`${BASE}/${purchaseOrder.id}`} className="btn btn-primary">Ir a la orden</Link>
        </LwSurface>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <form onSubmit={submit} noValidate>
          <LwPageTitle
            title={purchaseOrder ? 'Editar orden:' : 'Crear nueva orden de compra'}
            highlight={purchaseOrder?.orderNumber}
            subtitle={purchaseOrder ? 'Comencemos verificando sus datos' : 'Comencemos ingresando sus datos'}
            actions={<Link href={purchaseOrder ? `${BASE}/${purchaseOrder.id}` : BASE} className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver</Link>}
          />

          {errors.length ? (
            <div className="alert alert-danger" role="alert">
              <strong>Revisa lo siguiente:</strong>
              <ul className="mb-0 mt-1">{errors.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          ) : null}

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="po-contactId" className="form-label">*Proveedor</label>
              <select id="po-contactId" className="form-select" value={contactId} onChange={(e) => setContactId(e.target.value)} disabled={suppliersLoading}>
                <option value="">{suppliersLoading ? 'Cargando proveedores…' : 'Selecciona un proveedor'}</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="po-orderDate" className="form-label">*Fecha de orden</label>
              <input id="po-orderDate" type="date" className="form-control" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label htmlFor="po-eta" className="form-label">Llegada estimada</label>
              <input id="po-eta" type="date" className="form-control" value={eta} min={orderDate || undefined} onChange={(e) => setEta(e.target.value)} />
              <div className="form-text">La da el proveedor; se puede capturar después.</div>
            </div>
            <div className="col-md-3">
              <BranchSelect id="po-branchId" label="Sucursal" value={branchId} onChange={setBranchId} autoDefault={!purchaseOrder} />
            </div>
            <div className="col-md-9">
              <label htmlFor="po-notes" className="form-label">Notas</label>
              <input id="po-notes" className="form-control" value={notes} placeholder="Nota o comentarios adicionales" maxLength={1000} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <h2 className="h5 mb-3">Productos</h2>
          <div className="row g-3">
            <div className="col-lg-9">
              {lines.length === 0 && !adding ? (
                <div className="border rounded text-center text-muted py-5">
                  <i className="bi bi-cart3 fs-2 d-block mb-2" aria-hidden="true" />
                  No hay productos en esta orden
                  <div className="mt-2"><button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>Agregar productos</button></div>
                </div>
              ) : (
                <LwTableWrap>
                  <table className="table mb-0 align-middle">
                    <thead>
                      <tr>
                        <th className="text-center">No.</th>
                        <th>Producto</th>
                        <th style={{ width: 110 }}>Cantidad</th>
                        <th style={{ width: 150 }}>Costo unitario</th>
                        {editing ? <th className="text-end">Recibido</th> : null}
                        <th className="text-end">Total</th>
                        <th className="text-center" aria-label="Quitar" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => (
                        <tr key={l.key}>
                          <td className="text-center text-muted">{String(i + 1).padStart(2, '0')}</td>
                          <td>
                            <div>{l.productName}</div>
                            {l.sku ? <div className="small text-muted">SKU: {l.sku}</div> : null}
                            <label className="small text-muted d-inline-flex align-items-center gap-1 mt-1">
                              <input type="checkbox" checked={l.noCharge} onChange={(e) => setLine(l.key, { noCharge: e.target.checked, ...(e.target.checked && { unitPrice: '0' }) })} />
                              Sin costo (muestra o bonificación)
                            </label>
                          </td>
                          <td>
                            <input type="number" min={l.receivedQuantity || 0} step="any" className="form-control form-control-sm" aria-label={`Cantidad de ${l.productName}`} value={l.quantity} onChange={(e) => setLine(l.key, { quantity: e.target.value })} />
                          </td>
                          <td>
                            <input type="number" min={0} step="any" className="form-control form-control-sm" aria-label={`Costo unitario de ${l.productName}`} value={l.unitPrice} disabled={l.noCharge} onChange={(e) => setLine(l.key, { unitPrice: e.target.value })} />
                          </td>
                          {editing ? <td className="text-end">{l.receivedQuantity.toLocaleString('es-MX')}</td> : null}
                          <td className="text-end text-nowrap">{formatCurrency(lineTotal(l))}</td>
                          <td className="text-center">
                            <LwIconButton
                              icon="bi-trash"
                              label={`Quitar ${l.productName}`}
                              disabled={l.receivedQuantity > 0}
                              title={l.receivedQuantity > 0 ? 'Ya se recibió parte de esta partida' : `Quitar ${l.productName}`}
                              onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </LwTableWrap>
              )}
              {adding ? (
                <div className="mt-3">
                  <ProductSearchSelect
                    id="po-product"
                    label="Producto a agregar"
                    placeholder="Busca por nombre o SKU"
                    value={pick?.id ?? ''}
                    onlyActive
                    excludeIds={lines.map((l) => l.productId)}
                    onChange={addProduct}
                  />
                </div>
              ) : null}
            </div>
            <div className="col-lg-3">
              <div className="border rounded p-3">
                <h3 className="h6 mb-3">Resumen de la orden</h3>
                <div className="d-flex justify-content-between small text-muted mb-2"><span>Partidas</span><span>{lines.length}</span></div>
                <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 border-top pt-2">
                  <span className="fw-semibold">Total de la orden</span>
                  <span className="fs-5 fw-semibold text-success">{formatCurrency(total)}</span>
                </div>
                <div className="small text-muted mt-2">El IVA se registra con la factura del proveedor.</div>
                <button type="button" className="btn btn-primary w-100 mt-3" onClick={() => setAdding(true)} disabled={adding}>
                  <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Agregar producto
                </button>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href={purchaseOrder ? `${BASE}/${purchaseOrder.id}` : BASE} className="btn btn-outline-primary px-4">Cancelar</Link>
            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" /> : null}
              {purchaseOrder ? 'Guardar cambios' : 'Crear orden'}
            </button>
          </div>
        </form>
      </LwSurface>

      <LwResultModal
        open={savedOpen}
        tone="success"
        title="Orden actualizada"
        message="La orden fue editada con éxito"
        confirmLabel="Confirmar"
        onConfirm={() => { setSavedOpen(false); if (purchaseOrder) router.push(`${BASE}/${purchaseOrder.id}`) }}
      />
    </div>
  )
}

export default PurchaseOrderEditor
