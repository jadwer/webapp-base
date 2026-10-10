import { describe, it, expect } from 'vitest'
import { extractApiErrorMessage } from '../../utils/errorHandling'

const err = (status: number, data: unknown) => ({ message: 'Request failed', response: { status, data } })

describe('extractApiErrorMessage (regla 7: errores con detalle)', () => {
  it('detail de JSON:API', () => {
    expect(extractApiErrorMessage(err(422, { errors: [{ detail: 'filePath es obligatorio' }] }), 'x')).toBe('filePath es obligatorio')
  })

  it('primer error de validacion de Laravel', () => {
    expect(extractApiErrorMessage(err(422, { message: 'm', errors: { file: ['Debe ser imagen'] } }), 'x')).toBe('Debe ser imagen')
  })

  it('controlador propio con {error} y 403', () => {
    expect(extractApiErrorMessage(err(403, { error: 'Forbidden' }), 'x')).toBe('Sin permiso para esta accion (403: Forbidden)')
    expect(extractApiErrorMessage(err(422, { error: 'All images must belong to the same product' }), 'x'))
      .toBe('All images must belong to the same product (422)')
  })

  it('sin cuerpo usa el fallback con el codigo HTTP', () => {
    expect(extractApiErrorMessage(err(500, null), 'Error al subir')).toBe('Error al subir (500)')
    expect(extractApiErrorMessage(err(403, null), 'Error al subir')).toBe('Sin permiso para esta accion (403)')
  })

  it('error de red o plano conserva el mensaje', () => {
    expect(extractApiErrorMessage(new Error('Network Error'), 'Error al subir')).toBe('Error al subir: Network Error')
    expect(extractApiErrorMessage(null, 'Error al subir')).toBe('Error al subir')
  })
})
