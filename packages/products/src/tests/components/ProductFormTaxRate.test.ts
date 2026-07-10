import { describe, it, expect } from 'vitest'
import { taxRateToSelectValue, selectValueToTaxRate } from '../../components/ProductForm'

describe('ProductForm tax rate mapping (Exento <-> null)', () => {
  describe('taxRateToSelectValue', () => {
    it('maps null to the Exento select value', () => {
      expect(taxRateToSelectValue(null)).toBe('exento')
    })

    it('maps undefined to the Exento select value', () => {
      expect(taxRateToSelectValue(undefined)).toBe('exento')
    })

    it('maps 0 to the "0" select value (0% is NOT Exento)', () => {
      expect(taxRateToSelectValue(0)).toBe('0')
    })

    it('maps 16 and 8 to their string select values', () => {
      expect(taxRateToSelectValue(16)).toBe('16')
      expect(taxRateToSelectValue(8)).toBe('8')
    })

    it('maps a non-standard rate to a custom: prefixed value', () => {
      expect(taxRateToSelectValue(11.5)).toBe('custom:11.5')
    })
  })

  describe('selectValueToTaxRate', () => {
    it('maps the Exento select value back to null', () => {
      expect(selectValueToTaxRate('exento')).toBeNull()
    })

    it('maps "0" back to the number 0 (not Exento)', () => {
      expect(selectValueToTaxRate('0')).toBe(0)
    })

    it('maps "16" and "8" back to numbers', () => {
      expect(selectValueToTaxRate('16')).toBe(16)
      expect(selectValueToTaxRate('8')).toBe(8)
    })

    it('maps a custom: prefixed value back to its numeric rate', () => {
      expect(selectValueToTaxRate('custom:11.5')).toBe(11.5)
    })
  })

  describe('round-trip', () => {
    it('preserves null (Exento) through a full round-trip', () => {
      expect(selectValueToTaxRate(taxRateToSelectValue(null))).toBeNull()
    })

    it('preserves 0 through a full round-trip', () => {
      expect(selectValueToTaxRate(taxRateToSelectValue(0))).toBe(0)
    })

    it('preserves a custom rate through a full round-trip', () => {
      expect(selectValueToTaxRate(taxRateToSelectValue(11.5))).toBe(11.5)
    })
  })
})
