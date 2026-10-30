/**
 * Ayudas de fraccionamiento (P3 granel): factor por contenido, unidades
 * compatibles, clave de idempotencia y mensajes de error de la API.
 */

import { describe, it, expect } from 'vitest'
import {
  SOURCE_UNIT,
  contentUnitOptions,
  factorFromContent,
  newIdempotencyKey,
  roundFactor,
  batchUnavailableReason,
} from '../../utils/fractionation'
import { apiErrorList, apiErrorMessage } from '../../utils/listing'

describe('factorFromContent', () => {
  it('granel en litros y pieza de 25 ml da factor 40', () => {
    expect(factorFromContent(25, 'MLT', 'LTR')).toBe(40)
  })

  it('galon desde litros con 6 decimales', () => {
    expect(factorFromContent(1, 'GLL', 'LTR')).toBe(0.264172)
  })

  it('captura inversa en la unidad del origen (litros por pieza)', () => {
    expect(factorFromContent(3.785411784, SOURCE_UNIT, 'LTR')).toBe(0.264172)
    expect(factorFromContent(0.5, SOURCE_UNIT, null)).toBe(2)
  })

  it('masa: granel en kg y bolsa de 250 g da 4', () => {
    expect(factorFromContent(250, 'GRM', 'KGM')).toBe(4)
  })

  it('null con unidades de distinta dimensión, desconocidas o contenido invalido', () => {
    expect(factorFromContent(25, 'GRM', 'LTR')).toBeNull()
    expect(factorFromContent(25, 'MLT', 'H87')).toBeNull()
    expect(factorFromContent(0, 'MLT', 'LTR')).toBeNull()
    expect(factorFromContent(Number.NaN, SOURCE_UNIT, 'LTR')).toBeNull()
  })

  it('roundFactor deja 6 decimales', () => {
    expect(roundFactor(1 / 3.785411784)).toBe(0.264172)
  })
})

describe('contentUnitOptions', () => {
  it('litros ofrece la unidad del origen y las de volumen', () => {
    const codes = contentUnitOptions({ code: 'LTR', name: 'Litro' }).map((o) => o.code)
    expect(codes).toEqual([SOURCE_UNIT, 'MLT', 'GLL'])
  })

  it('unidad sin equivalencia solo ofrece la captura inversa', () => {
    const options = contentUnitOptions({ code: 'H87', name: 'Pieza' })
    expect(options).toHaveLength(1)
    expect(options[0].label).toContain('Pieza')
  })
})

describe('newIdempotencyKey', () => {
  it('genera claves distintas con formato aceptado por el backend', () => {
    const a = newIdempotencyKey()
    const b = newIdempotencyKey()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9_-]{8,64}$/)
  })
})

describe('apiErrorMessage', () => {
  it('lee errors[0].detail del formato JSON:API', () => {
    const err = { response: { data: { message: 'x', errors: [{ title: 'Stock insuficiente', detail: 'Disponible: 2; requerido: 5.' }] } } }
    expect(apiErrorMessage(err, 'fallback')).toBe('Disponible: 2; requerido: 5.')
  })

  it('usa data.error de controladores propios como respaldo', () => {
    const err = { message: 'Request failed with status code 422', response: { data: { error: 'No active conversión found' } } }
    expect(apiErrorMessage(err, 'fallback')).toBe('No active conversión found')
  })

  it('validación de Laravel (errors por campo) cae en message', () => {
    const err = { response: { data: { message: 'Elige el almacén.', errors: { warehouse_id: ['Elige el almacén.'] } } } }
    expect(apiErrorMessage(err, 'fallback')).toBe('Elige el almacén.')
    expect(apiErrorList(err, 'fallback')).toEqual(['Elige el almacén.'])
  })
})

describe('batchUnavailableReason (D10)', () => {
  const base = { is_expired: false, expiration_date: '2027-01-01' }

  it('usa la razón del backend cuando llega', () => {
    expect(batchUnavailableReason({ ...base, is_usable: false, unavailable_reason: 'el lote no pasó el control de calidad' }))
      .toBe('el lote no pasó el control de calidad')
    expect(batchUnavailableReason({ ...base, is_expired: true, is_usable: true })).toBeNull()
  })

  it('respaldo local: estado, calidad y caducidad con fecha dd/mm/aaaa', () => {
    expect(batchUnavailableReason({ ...base, status: 'recalled' })).toBe('lote inactivo (retirado)')
    expect(batchUnavailableReason({ ...base, quality_status: 'quarantine' })).toBe('en cuarentena por calidad')
    expect(batchUnavailableReason({ ...base, quality_status: 'failed' })).toBe('calidad rechazada')
    expect(batchUnavailableReason({ is_expired: true, expiration_date: '2026-10-05' })).toBe('caducado el 05/10/2026')
    expect(batchUnavailableReason({ ...base, status: 'active', quality_status: 'passed' })).toBeNull()
  })
})
