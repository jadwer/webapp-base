/**
 * Estatus y errores de Compras (rediseno 2026-11-17)
 */
import { describe, it, expect } from 'vitest'
import { PURCHASE_STATUS_OPTIONS, purchaseStatusLabel, purchaseStatusTone, isPurchaseOrderClosed, purchaseApiErrors } from '../../utils/status'

describe('estatus de la orden de compra', () => {
  it('ofrece los cuatro estatus del backend, sin Borrador', () => {
    expect(PURCHASE_STATUS_OPTIONS.map((o) => o.label)).toEqual(['Pendiente', 'Aprobada', 'Recibida', 'Cancelada'])
    expect(PURCHASE_STATUS_OPTIONS.some((o) => (o.value as string) === 'draft')).toBe(false)
  })

  it('traduce y colorea; lo desconocido sale tal cual en neutro', () => {
    expect(purchaseStatusLabel('received')).toBe('Recibida')
    expect(purchaseStatusTone('cancelled')).toBe('danger')
    expect(purchaseStatusLabel('otro')).toBe('otro')
    expect(purchaseStatusTone('otro')).toBe('neutral')
  })

  it('recibida y cancelada ya no se editan', () => {
    expect(isPurchaseOrderClosed('received')).toBe(true)
    expect(isPurchaseOrderClosed('cancelled')).toBe(true)
    expect(isPurchaseOrderClosed('pending')).toBe(false)
    expect(isPurchaseOrderClosed('approved')).toBe(false)
  })
})

describe('purchaseApiErrors', () => {
  it('lee errors[] de JSON:API', () => {
    const err = { response: { data: { errors: [{ detail: 'El estatus cambia con las acciones Aprobar, Recibir o Cancelar.' }, { title: 'Otro' }] } } }
    expect(purchaseApiErrors(err, 'x')).toEqual(['El estatus cambia con las acciones Aprobar, Recibir o Cancelar.', 'Otro'])
  })

  it('lee el objeto por campo de la validacion de Laravel (alta con partidas)', () => {
    const err = { response: { data: { message: 'The given data was invalid.', errors: { contact_id: ['El proveedor es obligatorio.'], 'items.0.unit_price': ['El costo es obligatorio.'] } } } }
    expect(purchaseApiErrors(err, 'x')).toEqual(['El proveedor es obligatorio.', 'El costo es obligatorio.'])
  })

  it('cae a message y luego al texto de respaldo; nunca vacio', () => {
    expect(purchaseApiErrors({ response: { data: { message: 'Fallo' } } }, 'x')).toEqual(['Fallo'])
    expect(purchaseApiErrors(undefined, 'No se pudo guardar.')).toEqual(['No se pudo guardar.'])
  })
})
