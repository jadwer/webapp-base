import { describe, it, expect } from 'vitest'
import { extractApiErrorMessage } from '../../utils/errorHandling'

const err = (status: number, data: unknown) => ({ message: 'Request failed', response: { status, data } })

describe('extractApiErrorMessage (regla 7: errores con detalle)', () => {
  it('regla 9: el detail se muestra tal cual, sin anteponer el puntero', () => {
    const e = err(422, { errors: [{ status: '422', detail: 'El campo precio unitario debe ser mayor que 0.', source: { pointer: '/data/attributes/unitPrice' } }] })
    expect(extractApiErrorMessage(e, 'x')).toBe('El campo precio unitario debe ser mayor que 0.')
  })

  it('detail de JSON:API', () => {
    expect(extractApiErrorMessage(err(422, { errors: [{ detail: 'filePath es obligatorio' }] }), 'x')).toBe('filePath es obligatorio')
  })

  it('primer error de validacion de Laravel', () => {
    expect(extractApiErrorMessage(err(422, { message: 'm', errors: { file: ['Debe ser imagen'] } }), 'x')).toBe('Debe ser imagen')
  })

  it('controlador propio con {error} y 403', () => {
    expect(extractApiErrorMessage(err(403, { error: 'Forbidden' }), 'x')).toBe('Sin permiso para esta acción (403: Forbidden)')
    expect(extractApiErrorMessage(err(422, { error: 'All images must belong to the same product' }), 'x'))
      .toBe('All images must belong to the same product (422)')
  })

  it('sin cuerpo usa el fallback con el codigo HTTP', () => {
    expect(extractApiErrorMessage(err(500, null), 'Error al subir')).toBe('Error al subir (500)')
    expect(extractApiErrorMessage(err(403, null), 'Error al subir')).toBe('Sin permiso para esta acción (403)')
  })

  it('error de red en espanol; un Error propio conserva su mensaje', () => {
    expect(extractApiErrorMessage(new Error('Network Error'), 'Error al subir')).toBe('Error al subir: no hay conexión con el servidor')
    expect(extractApiErrorMessage(new Error('timeout of 10000ms exceeded'), 'Error al subir')).toBe('Error al subir: el servidor tardó demasiado en responder')
    expect(extractApiErrorMessage(new Error('Archivo dañado'), 'Error al subir')).toBe('Error al subir: Archivo dañado')
    expect(extractApiErrorMessage(null, 'Error al subir')).toBe('Error al subir')
  })
})
