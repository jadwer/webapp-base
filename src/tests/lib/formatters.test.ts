/**
 * Formatters Utilities Tests
 *
 * Unit tests for currency, quantity, and locale formatting functions
 * covering the expanded currency support in CURRENCY_LOCALE_MAP.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatCurrency,
  formatQuantity,
  getCurrentCurrency,
  getCurrentLocale,
} from '@/lib/formatters'

describe('formatters', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset env before each test to ensure isolation
    vi.stubEnv('NEXT_PUBLIC_CURRENCY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ============================================
  // formatCurrency Tests
  // ============================================

  describe('formatCurrency', () => {
    it('should format with MXN by default when no currency is specified', () => {
      // Arrange & Act
      const result = formatCurrency(1234.56)

      // Assert - MXN uses es-MX locale
      expect(result).toContain('1')
      expect(result).toContain('234')
      expect(result).toContain('56')
      // Should include the dollar sign or MXN symbol
      expect(result).toMatch(/\$/)
    })

    it('should format with USD currency and en-US locale', () => {
      // Arrange & Act
      const result = formatCurrency(1234.56, 'USD')

      // Assert - en-US uses comma as thousands separator and period for decimals
      expect(result).toContain('1,234.56')
      expect(result).toMatch(/\$/)
    })

    it('should format with EUR currency and es-ES locale', () => {
      // Arrange & Act
      const result = formatCurrency(1234.56, 'EUR')

      // Assert - Should contain the euro symbol and the value
      expect(result).toContain('1234,56') // es-ES uses period for thousands, comma for decimals
      expect(result).toMatch(/\u20AC/) // Euro sign
    })

    it('should format with GBP currency and en-GB locale', () => {
      // Arrange & Act
      const result = formatCurrency(1234.56, 'GBP')

      // Assert - en-GB uses comma as thousands separator and period for decimals
      expect(result).toContain('1,234.56')
      expect(result).toMatch(/\u00A3/) // Pound sign
    })

    it('should fallback to en-US locale for unknown currency codes', () => {
      // Arrange & Act
      const result = formatCurrency(1234.56, 'XYZ')

      // Assert - en-US fallback with comma thousands separator
      expect(result).toContain('1,234.56')
      // Should contain the currency code since it is not a well-known symbol
      expect(result).toContain('XYZ')
    })

    it('should return "-" when value is null', () => {
      // Arrange & Act
      const result = formatCurrency(null as unknown as undefined)

      // Assert
      expect(result).toBe('-')
    })

    it('should return "-" when value is undefined', () => {
      // Arrange & Act
      const result = formatCurrency(undefined)

      // Assert
      expect(result).toBe('-')
    })

    it('should format zero correctly', () => {
      // Arrange & Act
      const result = formatCurrency(0, 'USD')

      // Assert
      expect(result).toContain('0.00')
    })

    it('should format negative values correctly', () => {
      // Arrange & Act
      const result = formatCurrency(-500.25, 'USD')

      // Assert
      expect(result).toContain('500.25')
    })

    it('should use NEXT_PUBLIC_CURRENCY env var when no currency param is provided', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'EUR')

      // Act
      const result = formatCurrency(100)

      // Assert - Should use EUR from env
      expect(result).toMatch(/\u20AC/) // Euro sign
    })
  })

  // ============================================
  // formatQuantity Tests
  // ============================================

  describe('formatQuantity', () => {
    it('should format integer values without decimals', () => {
      // Arrange & Act
      const result = formatQuantity(42)

      // Assert - Integer should have no decimal places
      expect(result).not.toContain('.')
      expect(result).not.toContain(',')
      expect(result).toBe('42')
    })

    it('should format decimal values with max 2 decimal places', () => {
      // Arrange & Act
      const result = formatQuantity(3.14159)

      // Assert - Should be truncated to max 2 decimals
      // In es-MX locale (default MXN), decimal separator is a period
      expect(result).toMatch(/3[.,]14/)
    })

    it('should handle string input', () => {
      // Arrange & Act
      const result = formatQuantity('25')

      // Assert
      expect(result).toBe('25')
    })

    it('should handle string decimal input', () => {
      // Arrange & Act
      const result = formatQuantity('7.5')

      // Assert
      expect(result).toMatch(/7[.,]5/)
    })

    it('should return "0" for null input', () => {
      // Arrange & Act
      const result = formatQuantity(null as unknown as undefined)

      // Assert
      expect(result).toBe('0')
    })

    it('should return "0" for undefined input', () => {
      // Arrange & Act
      const result = formatQuantity(undefined)

      // Assert
      expect(result).toBe('0')
    })

    it('should format large integers with locale-appropriate grouping', () => {
      // Arrange - Use USD to get en-US locale with comma grouping
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'USD')

      // Act
      const result = formatQuantity(10000)

      // Assert - en-US uses comma as thousands separator
      expect(result).toBe('10,000')
    })

    it('should handle zero correctly', () => {
      // Arrange & Act
      const result = formatQuantity(0)

      // Assert
      expect(result).toBe('0')
    })
  })

  // ============================================
  // getCurrentCurrency Tests
  // ============================================

  describe('getCurrentCurrency', () => {
    it('should return MXN as default when env is not set', () => {
      // Arrange & Act
      const result = getCurrentCurrency()

      // Assert
      expect(result).toBe('MXN')
      expect(typeof result).toBe('string')
    })

    it('should return the value from NEXT_PUBLIC_CURRENCY env var', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'USD')

      // Act
      const result = getCurrentCurrency()

      // Assert
      expect(result).toBe('USD')
    })

    it('should return string type (no longer a narrow union)', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'GBP')

      // Act
      const result = getCurrentCurrency()

      // Assert - Result should be a plain string, supporting any currency code
      expect(typeof result).toBe('string')
      expect(result).toBe('GBP')
    })
  })

  // ============================================
  // getCurrentLocale Tests
  // ============================================

  describe('getCurrentLocale', () => {
    it('should return es-MX locale for default MXN currency', () => {
      // Arrange & Act
      const result = getCurrentLocale()

      // Assert
      expect(result).toBe('es-MX')
    })

    it('should return en-US locale when currency is USD', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'USD')

      // Act
      const result = getCurrentLocale()

      // Assert
      expect(result).toBe('en-US')
    })

    it('should return es-ES locale when currency is EUR', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'EUR')

      // Act
      const result = getCurrentLocale()

      // Assert
      expect(result).toBe('es-ES')
    })

    it('should return en-GB locale when currency is GBP', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'GBP')

      // Act
      const result = getCurrentLocale()

      // Assert
      expect(result).toBe('en-GB')
    })

    it('should return ja-JP locale when currency is JPY', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'JPY')

      // Act
      const result = getCurrentLocale()

      // Assert
      expect(result).toBe('ja-JP')
    })

    it('should return en-US as fallback for unmapped currency', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_CURRENCY', 'ZAR')

      // Act
      const result = getCurrentLocale()

      // Assert
      expect(result).toBe('en-US')
    })
  })
})
