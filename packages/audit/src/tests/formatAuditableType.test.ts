import { describe, it, expect } from 'vitest'
import { formatAuditableType } from '../types'

describe('formatAuditableType', () => {
  it('no se rompe con un registro de sesion, que no tiene tipo', () => {
    expect(formatAuditableType(null)).toBe('Sesión')
    expect(formatAuditableType(undefined)).toBe('Sesión')
  })

  it('usa la etiqueta conocida o el nombre corto de la clase', () => {
    expect(formatAuditableType('Modules\\Sales\\Models\\Quote')).toBe('Cotización')
    expect(formatAuditableType('Modules\\Otra\\Models\\Cosa')).toBe('Cosa')
  })
})
