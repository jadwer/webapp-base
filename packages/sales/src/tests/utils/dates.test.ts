/**
 * Tests for date-only formatting helpers.
 *
 * Regression: order_date llega como fecha sin hora ("2026-07-16" o
 * "2026-07-16T00:00:00.000000Z"). new Date() + toLocaleDateString en una zona
 * al oeste de UTC (America/Mexico_City) mostraba el dia anterior (15/07).
 */

import { describe, it, expect } from 'vitest'
import { parseDateOnly, formatDateOnly } from '../../utils/dates'

describe('parseDateOnly', () => {
  it('parses a plain date string as UTC midnight', () => {
    const date = parseDateOnly('2026-07-16')
    expect(date).not.toBeNull()
    expect(date!.toISOString()).toBe('2026-07-16T00:00:00.000Z')
  })

  it('parses an ISO UTC-midnight timestamp keeping the calendar date', () => {
    const date = parseDateOnly('2026-07-16T00:00:00.000000Z')
    expect(date).not.toBeNull()
    expect(date!.toISOString()).toBe('2026-07-16T00:00:00.000Z')
  })

  it('returns null for non date-only strings', () => {
    expect(parseDateOnly('no-date')).toBeNull()
    expect(parseDateOnly('16/07/2026')).toBeNull()
  })
})

describe('formatDateOnly', () => {
  it('formats the stored calendar date without timezone shift', () => {
    // Regardless of the runner's timezone the day must stay 16.
    const formatted = formatDateOnly('2026-07-16T00:00:00.000000Z', 'es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    expect(formatted).toBe('16/07/2026')
  })

  it('formats a plain date string the same way', () => {
    const formatted = formatDateOnly('2026-07-16', 'es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    expect(formatted).toBe('16/07/2026')
  })

  it('returns a dash for empty values', () => {
    expect(formatDateOnly(null)).toBe('-')
    expect(formatDateOnly(undefined)).toBe('-')
    expect(formatDateOnly('')).toBe('-')
  })

  it('returns the raw string when it is not date-like', () => {
    expect(formatDateOnly('pendiente')).toBe('pendiente')
  })
})
