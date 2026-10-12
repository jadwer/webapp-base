/**
 * Tests de getValidationErrorMessages: extraccion legible de errores 422.
 * Origen: bug 2026-07-29, 422 mudo en creacion de contactos (prod).
 */
import { describe, it, expect } from 'vitest'
import { getValidationErrorMessages } from '../../utils/jsonApiErrors'

function axios422(errors: Array<{ detail?: string; title?: string; source?: { pointer?: string } }>) {
  return { response: { status: 422, data: { errors } } }
}

describe('getValidationErrorMessages', () => {
  it('traduce unique de taxId con etiqueta en espanol', () => {
    const messages = getValidationErrorMessages(
      axios422([
        {
          detail: 'The tax id has already been taken.',
          source: { pointer: '/data/attributes/taxId' },
        },
      ])
    )
    expect(messages).toEqual(['RFC: ya esta registrado en otro contacto'])
  })

  it('traduce url invalida de website', () => {
    const messages = getValidationErrorMessages(
      axios422([
        {
          detail: 'The website field must be a valid URL.',
          source: { pointer: '/data/attributes/website' },
        },
      ])
    )
    expect(messages).toEqual(['Sitio web: debe ser una URL valida (incluye https://)'])
  })

  it('traduce max length con el numero interpolado', () => {
    const messages = getValidationErrorMessages(
      axios422([
        {
          detail: 'The phone field must not be greater than 20 characters.',
          source: { pointer: '/data/attributes/phone' },
        },
      ])
    )
    expect(messages).toEqual(['Telefono: excede el largo maximo (20 caracteres)'])
  })

  it('devuelve varios errores en orden', () => {
    const messages = getValidationErrorMessages(
      axios422([
        { detail: 'The email field must be a valid email address.', source: { pointer: '/data/attributes/email' } },
        { detail: 'The tax id format is invalid.', source: { pointer: '/data/attributes/taxId' } },
      ])
    )
    expect(messages).toHaveLength(2)
    expect(messages[0]).toContain('Email:')
    expect(messages[1]).toContain('RFC:')
  })

  it('regla 9: el detalle en espanol se muestra tal cual, sin anteponer el puntero', () => {
    const messages = getValidationErrorMessages(
      axios422([
        { detail: 'El campo RFC no tiene un formato válido.', source: { pointer: '/data/attributes/taxId' } },
      ])
    )
    expect(messages).toEqual(['El campo RFC no tiene un formato válido.'])
  })

  it('nunca antepone el atributo en ingles cuando no hay etiqueta mapeada', () => {
    const messages = getValidationErrorMessages(
      axios422([
        { detail: 'The foo field is required.', source: { pointer: '/data/attributes/foo' } },
      ])
    )
    expect(messages).toEqual(['Dato: es obligatorio'])
  })

  it('devuelve [] para errores que no son 422', () => {
    expect(getValidationErrorMessages({ response: { status: 500, data: {} } })).toEqual([])
    expect(getValidationErrorMessages(new Error('network'))).toEqual([])
    expect(getValidationErrorMessages(undefined)).toEqual([])
  })
})
