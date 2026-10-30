import { describe, it, expect } from 'vitest'
import { localizeHttpErrorMessage, isGenericHttpClientMessage } from '../../lib/localizeHttpError'

describe('localizeHttpErrorMessage (regla 9)', () => {
  it('reemplaza el mensaje generico de axios por el detail del backend, sin puntero', () => {
    expect(localizeHttpErrorMessage({
      message: 'Request failed with status code 422',
      response: { status: 422, data: { errors: [{ detail: 'El campo precio es obligatorio.', source: { pointer: '/data/attributes/price' } }] } },
    })).toBe('El campo precio es obligatorio.')
  })

  it('usa message o error del cuerpo cuando no hay errors[]', () => {
    expect(localizeHttpErrorMessage({ message: 'Request failed with status code 409', response: { status: 409, data: { message: 'Ya existe.' } } }))
      .toBe('Ya existe.')
    expect(localizeHttpErrorMessage({ message: 'Request failed with status code 400', response: { status: 400, data: { error: 'Carrito vacío' } } }))
      .toBe('Carrito vacío')
  })

  it('sin cuerpo explica el código HTTP en español', () => {
    expect(localizeHttpErrorMessage({ message: 'Request failed with status code 403', response: { status: 403 } }))
      .toBe('No tienes permiso para realizar esta acción.')
    expect(localizeHttpErrorMessage({ message: 'Request failed with status code 500', response: { status: 500, data: '' } }))
      .toBe('El servidor no pudo completar la solicitud (error 500).')
  })

  it('red caida y tiempo agotado en español', () => {
    expect(localizeHttpErrorMessage({ message: 'Network Error' })).toBe('No hay conexión con el servidor; revisa tu conexión a internet.')
    expect(localizeHttpErrorMessage({ message: 'timeout of 10000ms exceeded', code: 'ECONNABORTED' }))
      .toBe('El servidor tardó demasiado en responder; intenta de nuevo.')
  })

  it('conserva un mensaje propio que no es de axios', () => {
    expect(localizeHttpErrorMessage({ message: 'No hay un carrito disponible' })).toBe('No hay un carrito disponible')
    expect(isGenericHttpClientMessage('Request failed with status code 404')).toBe(true)
    expect(isGenericHttpClientMessage('El lote caducó')).toBe(false)
  })
})
