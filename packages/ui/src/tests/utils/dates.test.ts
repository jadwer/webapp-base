import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  addDaysDateOnly,
  compareDateOnly,
  diffDaysDateOnly,
  formatDateOnly,
  formatDateTime,
  isPastDateOnly,
  parseDateOnly,
  toDateInput,
  todayDateInput,
} from '../../utils/dates'

describe('parseDateOnly', () => {
  it('acepta Y-m-d como medianoche UTC', () => {
    expect(parseDateOnly('2026-10-25')?.toISOString()).toBe('2026-10-25T00:00:00.000Z')
  })

  it('acepta ISO medianoche y descarta la hora', () => {
    expect(parseDateOnly('2026-10-25T00:00:00.000000Z')?.toISOString()).toBe('2026-10-25T00:00:00.000Z')
  })

  it('acepta ISO con hora y conserva el dia del string', () => {
    expect(parseDateOnly('2026-10-25T23:30:00Z')?.toISOString()).toBe('2026-10-25T00:00:00.000Z')
  })

  it('devuelve null para vacio o invalido', () => {
    expect(parseDateOnly(null)).toBeNull()
    expect(parseDateOnly(undefined)).toBeNull()
    expect(parseDateOnly('')).toBeNull()
    expect(parseDateOnly('no es fecha')).toBeNull()
    expect(parseDateOnly(new Date('x'))).toBeNull()
  })
})

describe('formatDateOnly', () => {
  it('Y-m-d se muestra el mismo dia', () => {
    expect(formatDateOnly('2026-10-25')).toBe('25/10/2026')
  })

  it('ISO medianoche no se corre al dia anterior (frontera de dia)', () => {
    expect(formatDateOnly('2026-10-25T00:00:00.000000Z')).toBe('25/10/2026')
    expect(formatDateOnly('2026-01-01T00:00:00.000000Z')).toBe('01/01/2026')
  })

  it('ISO con hora usa la fecha del string', () => {
    expect(formatDateOnly('2026-10-25T18:00:00Z')).toBe('25/10/2026')
  })

  it('acepta opciones de Intl', () => {
    expect(formatDateOnly('2026-10-25', 'es-MX', { year: 'numeric', month: 'long', day: 'numeric' }))
      .toBe('25 de octubre de 2026')
  })

  it('vacio -> "-" e invalido se devuelve tal cual', () => {
    expect(formatDateOnly(null)).toBe('-')
    expect(formatDateOnly(undefined)).toBe('-')
    expect(formatDateOnly('')).toBe('-')
    expect(formatDateOnly('pendiente')).toBe('pendiente')
  })
})

describe('toDateInput', () => {
  it('recorta Y-m-d e ISO a YYYY-MM-DD', () => {
    expect(toDateInput('2026-10-25')).toBe('2026-10-25')
    expect(toDateInput('2026-10-25T00:00:00.000000Z')).toBe('2026-10-25')
  })

  it('vacio o invalido -> ""', () => {
    expect(toDateInput(null)).toBe('')
    expect(toDateInput(undefined)).toBe('')
    expect(toDateInput('basura')).toBe('')
  })
})

describe('todayDateInput / isPastDateOnly', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('usa la fecha local, no la UTC', () => {
    // 25/10/2026 23:30 hora local: en UTC-6 toISOString ya diria 26
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 25, 23, 30))
    expect(todayDateInput()).toBe('2026-10-25')
  })

  it('vencimiento compara por dia de calendario', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 25, 23, 30))
    expect(isPastDateOnly('2026-10-24')).toBe(true)
    expect(isPastDateOnly('2026-10-25T00:00:00.000000Z')).toBe(false)
    expect(isPastDateOnly('2026-10-26')).toBe(false)
    expect(isPastDateOnly(null)).toBe(false)
  })
})

describe('compareDateOnly / diffDaysDateOnly / addDaysDateOnly', () => {
  it('compara formas mezcladas', () => {
    expect(compareDateOnly('2026-10-25', '2026-10-25T00:00:00.000000Z')).toBe(0)
    expect(compareDateOnly('2026-10-24', '2026-10-25')).toBeLessThan(0)
    expect(compareDateOnly(null, '2026-10-25')).toBeGreaterThan(0)
  })

  it('diferencia en dias y suma de dias', () => {
    expect(diffDaysDateOnly('2026-10-25', '2026-11-24T00:00:00.000000Z')).toBe(30)
    expect(diffDaysDateOnly(null, '2026-10-25')).toBeNull()
    expect(addDaysDateOnly('2026-10-25T00:00:00.000000Z', 10)).toBe('2026-11-04')
    expect(addDaysDateOnly('x', 1)).toBe('')
  })
})

describe('formatDateTime', () => {
  it('formatea timestamp con hora y vacio como "-"', () => {
    const value = new Date(2026, 9, 25, 14, 5)
    expect(formatDateTime(value)).toBe('25/10/2026, 14:05')
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime('nope')).toBe('-')
  })
})
