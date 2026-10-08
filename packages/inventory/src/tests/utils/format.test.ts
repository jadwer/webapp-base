import { describe, it, expect } from 'vitest'
import { toNumber, formatDate, formatQty } from '../../utils/format'

describe('toNumber', () => {
  it('convierte strings decimales del backend', () => {
    expect(toNumber('12.5000')).toBe(12.5)
    expect(toNumber('-3')).toBe(-3)
  })

  it('deja pasar numeros', () => {
    expect(toNumber(7)).toBe(7)
  })

  it('null, undefined, vacio y NaN dan 0', () => {
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
    expect(toNumber('')).toBe(0)
    expect(toNumber('abc')).toBe(0)
    expect(toNumber(Number.NaN)).toBe(0)
    expect(toNumber(Infinity)).toBe(0)
  })
})

describe('formatDate', () => {
  it('formatea fecha sin hora en es-MX sin correrse un dia', () => {
    expect(formatDate('2026-10-07')).toBe('07/10/2026')
  })

  it('ISO medianoche UTC conserva el dia guardado', () => {
    expect(formatDate('2026-10-25T00:00:00.000000Z')).toBe('25/10/2026')
  })

  it('formatea ISO con hora local', () => {
    const local = new Date(2026, 0, 5, 14, 30)
    expect(formatDate(local)).toBe('05/01/2026')
    expect(formatDate(local, { withTime: true })).toMatch(/^05\/01\/2026,? 14:30$/)
  })

  it('vacio o invalido da guion', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate(undefined)).toBe('-')
    expect(formatDate('')).toBe('-')
    expect(formatDate('no-es-fecha')).toBe('-')
  })
})

describe('formatQty', () => {
  it('acepta el string decimal del backend', () => {
    expect(formatQty('10.0000')).toBe('10')
    expect(formatQty(null)).toBe('0')
  })
})
