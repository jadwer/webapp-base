import { describe, it, expect } from 'vitest'
import { apiMessage } from '../lib/apiMessage'

describe('apiMessage', () => {
  it('prefiere el primer error de validacion de Laravel', () => {
    expect(apiMessage({ response: { data: { message: 'Datos inválidos', errors: { forma_pago: ['La forma de pago no existe en el catálogo del SAT.'] } } } })).toBe('La forma de pago no existe en el catálogo del SAT.')
  })

  it('lee el detail de JSON:API y la llave error de los endpoints de accion', () => {
    expect(apiMessage({ response: { data: { errors: [{ detail: 'Sin permiso' }] } } })).toBe('Sin permiso')
    expect(apiMessage({ response: { data: { error: 'La orden ya está cancelada' } } })).toBe('La orden ya está cancelada')
  })

  it('sin respuesta usa el texto por omision', () => {
    expect(apiMessage(new Error('network'))).toBe('No se pudo completar la acción.')
  })
})
