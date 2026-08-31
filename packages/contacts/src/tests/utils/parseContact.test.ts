/**
 * parseContact debe conservar TODOS los campos que el API devuelve.
 * Fija el contrato tras el barrido 2026-08-31: los campos comerciales y
 * fiscales (WS5/WS7) se omitian y la edicion los mostraba vacios aunque
 * estuvieran guardados (mismo patron que el Resource manual del backend).
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('@lwm/auth', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import { parseContact } from '../../hooks'

describe('parseContact', () => {
  it('conserva los campos comerciales, fiscales y de v2', () => {
    const parsed = parseContact({
      id: 9,
      contactType: 'company',
      name: 'ACME',
      status: 'active',
      isCustomer: true,
      isSupplier: false,
      phone: '5555551234',
      phoneExtension: '104',
      hasPortalUser: true,
      regimenFiscal: '601',
      usoCfdi: 'G03',
      creditMonths: 2,
      bankAccountNumber: '0123456789',
      referralSource: 'Recomendacion',
      cuentaContable: '105-01-001',
      discountPct: 5,
      defaultSalespersonId: 3,
      collectionsAgentId: 4,
      commissionPctOverride: 2.5,
      createdAt: '2026-08-31T00:00:00Z',
      updatedAt: '2026-08-31T00:00:00Z',
    })

    expect(parsed.phoneExtension).toBe('104')
    expect(parsed.hasPortalUser).toBe(true)
    expect(parsed.regimenFiscal).toBe('601')
    expect(parsed.usoCfdi).toBe('G03')
    expect(parsed.creditMonths).toBe(2)
    expect(parsed.bankAccountNumber).toBe('0123456789')
    expect(parsed.referralSource).toBe('Recomendacion')
    expect(parsed.cuentaContable).toBe('105-01-001')
    expect(parsed.discountPct).toBe(5)
    expect(parsed.defaultSalespersonId).toBe(3)
    expect(parsed.collectionsAgentId).toBe(4)
    expect(parsed.commissionPctOverride).toBe(2.5)
    expect(parsed.isProspect).toBe(false)
  })

  it('un contacto sin roles es prospecto', () => {
    const parsed = parseContact({
      id: 1,
      contactType: 'person',
      name: 'Prospecto Puro',
      status: 'active',
      isCustomer: false,
      isSupplier: false,
      createdAt: '',
      updatedAt: '',
    })

    expect(parsed.isProspect).toBe(true)
    expect(parsed.hasPortalUser).toBeUndefined()
  })
})
