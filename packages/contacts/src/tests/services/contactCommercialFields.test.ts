/**
 * Tests para los campos comerciales/fiscales del contacto (nota cliente #10).
 * Cubre lectura (transform JSON:API -> flat) y escritura (buildContactAttributes:
 * conserva valores, descarta undefined, y respeta null explicito en nullables).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock del cliente HTTP antes de importar el servicio (usa @lwm/auth).
const getMock = vi.fn()
const postMock = vi.fn()
const patchMock = vi.fn()

vi.mock('@lwm/auth', () => ({
  axiosClient: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    patch: (...args: unknown[]) => patchMock(...args),
    delete: vi.fn(),
  },
}))

import { buildContactAttributes, contactsService } from '../../services'

describe('buildContactAttributes (escritura de campos comerciales/fiscales)', () => {
  it('conserva los 10 campos comerciales/fiscales cuando traen valor', () => {
    const out = buildContactAttributes({
      name: 'Acme',
      defaultSalespersonId: 5,
      collectionsAgentId: 7,
      commissionPctOverride: 12.5,
      regimenFiscal: '601',
      usoCfdi: 'G03',
      creditMonths: 3,
      bankAccountNumber: '0123456789',
      referralSource: 'Google',
      cuentaContable: '105-01-001',
      discountPct: 10,
    })

    expect(out).toMatchObject({
      name: 'Acme',
      defaultSalespersonId: 5,
      collectionsAgentId: 7,
      commissionPctOverride: 12.5,
      regimenFiscal: '601',
      usoCfdi: 'G03',
      creditMonths: 3,
      bankAccountNumber: '0123456789',
      referralSource: 'Google',
      cuentaContable: '105-01-001',
      discountPct: 10,
    })
  })

  it('descarta las claves con valor undefined (no se tocan en el PATCH)', () => {
    const out = buildContactAttributes({
      name: 'Acme',
      regimenFiscal: undefined,
      bankAccountNumber: undefined,
      defaultSalespersonId: 5,
    })

    expect(out).toHaveProperty('name')
    expect(out).toHaveProperty('defaultSalespersonId', 5)
    expect(out).not.toHaveProperty('regimenFiscal')
    expect(out).not.toHaveProperty('bankAccountNumber')
  })

  it('conserva null EXPLICITO en campos nullables para poder limpiarlos', () => {
    const out = buildContactAttributes({
      commissionPctOverride: null,
      creditMonths: null,
      discountPct: null,
    })

    expect(out).toHaveProperty('commissionPctOverride', null)
    expect(out).toHaveProperty('creditMonths', null)
    expect(out).toHaveProperty('discountPct', null)
  })

  it('descarta null en campos NO nullables (evita romper validacion)', () => {
    const out = buildContactAttributes({
      regimenFiscal: null,
      usoCfdi: null,
      defaultSalespersonId: null,
    })

    // regimenFiscal/usoCfdi son strings no nullables -> se descartan
    expect(out).not.toHaveProperty('regimenFiscal')
    expect(out).not.toHaveProperty('usoCfdi')
    // defaultSalespersonId no esta en la lista de nullables -> se descarta
    expect(out).not.toHaveProperty('defaultSalespersonId')
  })

  it('conserva el valor 0 (no lo confunde con vacio)', () => {
    const out = buildContactAttributes({
      creditMonths: 0,
      discountPct: 0,
    })

    expect(out).toHaveProperty('creditMonths', 0)
    expect(out).toHaveProperty('discountPct', 0)
  })
})

describe('contactsService.update (escritura via PATCH)', () => {
  beforeEach(() => {
    patchMock.mockReset()
    patchMock.mockResolvedValue({ data: { data: { id: '1', attributes: {} } } })
  })

  it('envia null explicito de creditMonths/discountPct para limpiarlos', async () => {
    await contactsService.update('1', {
      creditMonths: null,
      discountPct: null,
      defaultSalespersonId: 9,
    })

    const [, payload] = patchMock.mock.calls[0]
    const attrs = (payload as { data: { attributes: Record<string, unknown> } }).data.attributes

    expect(attrs).toHaveProperty('creditMonths', null)
    expect(attrs).toHaveProperty('discountPct', null)
    expect(attrs).toHaveProperty('defaultSalespersonId', 9)
  })

  it('omite del PATCH los campos undefined (no modificados)', async () => {
    await contactsService.update('1', {
      defaultSalespersonId: 9,
      regimenFiscal: undefined,
    })

    const [, payload] = patchMock.mock.calls[0]
    const attrs = (payload as { data: { attributes: Record<string, unknown> } }).data.attributes

    expect(attrs).toHaveProperty('defaultSalespersonId', 9)
    expect(attrs).not.toHaveProperty('regimenFiscal')
  })
})

describe('contactsService.getById (lectura: campos comerciales fluyen al flat)', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('expone los campos comerciales/fiscales desde attributes JSON:API', async () => {
    getMock.mockResolvedValue({
      data: {
        data: {
          type: 'contacts',
          id: '42',
          attributes: {
            name: 'Cliente Demo',
            defaultSalespersonId: 5,
            collectionsAgentId: 7,
            commissionPctOverride: 12.5,
            regimenFiscal: '601',
            usoCfdi: 'G03',
            creditMonths: 3,
            bankAccountNumber: '0123456789',
            referralSource: 'Google',
            cuentaContable: '105-01-001',
            discountPct: 10,
          },
        },
      },
    })

    const res = await contactsService.getById('42')
    const contact = res.data as Record<string, unknown>

    expect(contact.id).toBe('42')
    expect(contact.defaultSalespersonId).toBe(5)
    expect(contact.collectionsAgentId).toBe(7)
    expect(contact.commissionPctOverride).toBe(12.5)
    expect(contact.regimenFiscal).toBe('601')
    expect(contact.usoCfdi).toBe('G03')
    expect(contact.creditMonths).toBe(3)
    expect(contact.bankAccountNumber).toBe('0123456789')
    expect(contact.referralSource).toBe('Google')
    expect(contact.cuentaContable).toBe('105-01-001')
    expect(contact.discountPct).toBe(10)
  })
})
