import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  calculateDiscountDate,
  formatDiscountTerms,
  qualifiesForDiscount,
} from '../../utils/transformers'

describe('fechas de pronto pago', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculateDiscountDate suma dias sobre el dia de calendario (ISO medianoche)', () => {
    expect(calculateDiscountDate('2026-10-25T00:00:00.000000Z', 10)).toBe('2026-11-04')
    expect(calculateDiscountDate('2026-10-25', 0)).toBe('2026-10-25')
  })

  it('el descuento vale todo el dia limite en hora local', () => {
    // 25/10/2026 20:00 local: en UTC-6 ya es 26 en UTC
    const evening = new Date(2026, 9, 25, 20, 0)
    expect(qualifiesForDiscount('2026-10-25T00:00:00.000000Z', false, evening)).toBe(true)
    expect(qualifiesForDiscount('2026-10-24', false, evening)).toBe(false)
  })

  it('formatDiscountTerms cuenta dias de calendario', () => {
    expect(formatDiscountTerms(2, 10, '2026-11-24T00:00:00.000000Z', '2026-10-25')).toBe('2/10 Net 30')
  })
})
