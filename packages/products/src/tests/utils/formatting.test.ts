import { describe, expect, it } from 'vitest'
import { formatDate } from '../../utils/formatting'

describe('formatDate (products)', () => {
  it('fecha sin hora conserva el dia (Y-m-d e ISO medianoche)', () => {
    expect(formatDate('2026-10-25', 'dd/MM/yyyy')).toBe('25/10/2026')
    expect(formatDate('2026-10-25T00:00:00.000000Z', 'dd/MM/yyyy')).toBe('25/10/2026')
  })

  it('vacio o invalido', () => {
    expect(formatDate(null)).toBe('N/A')
    expect(formatDate('basura')).toBe('Fecha inválida')
  })
})
