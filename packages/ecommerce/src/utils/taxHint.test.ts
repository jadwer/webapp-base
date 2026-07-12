import { describe, it, expect } from 'vitest'
import { taxHintLabel } from './taxHint'

describe('taxHintLabel', () => {
  it('returns "+ 16% IVA" for a taxed product when prices are net', () => {
    expect(taxHintLabel(true, false)).toBe('+ 16% IVA')
  })

  it('returns "IVA 0%" for an exempt product when prices are net', () => {
    expect(taxHintLabel(false, false)).toBe('IVA 0%')
  })

  it('returns "IVA incluido" for a taxed product when prices include tax', () => {
    expect(taxHintLabel(true, true)).toBe('IVA incluido')
  })

  it('returns "IVA 0%" for an exempt product when prices include tax', () => {
    expect(taxHintLabel(false, true)).toBe('IVA 0%')
  })
})
