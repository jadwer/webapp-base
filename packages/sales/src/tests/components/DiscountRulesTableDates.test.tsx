import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { DiscountRulesTable } from '../../components/DiscountRulesTable'
import type { ParsedDiscountRule } from '../../types'

describe('DiscountRulesTable fechas', () => {
  it('vigencia ISO medianoche se muestra con su dia', () => {
    const rule = {
      id: '1',
      name: 'Regla',
      discountType: 'percentage',
      appliesTo: 'all',
      discountValue: 10,
      startDate: '2026-10-25T00:00:00.000000Z',
      endDate: '2026-11-01',
      isActive: true,
      isExpired: false,
      currentUsage: 0,
    } as unknown as ParsedDiscountRule
    const { container } = render(<DiscountRulesTable discountRules={[rule]} />)
    expect(container.textContent).toContain('Desde: 25 oct 2026')
    expect(container.textContent).toContain('Hasta: 1 nov 2026')
  })
})
