/**
 * Payload de company-settings contra CompanySettingSchema (B3): llaves
 * camelCase y sin certificado, llave ni contrasena (readOnly, solo por
 * upload-certificate / upload-key).
 */

import { describe, it, expect } from 'vitest'
import {
  transformCompanySettingFormToJsonApi,
  transformJsonApiCompanySetting,
} from '../../utils/transformers'
import type { CompanySettingFormData } from '../../types'

const form: CompanySettingFormData = {
  companyName: 'Empresa SA de CV',
  rfc: 'XAXX010101000',
  taxRegime: '601',
  postalCode: '12345',
  invoiceSeries: 'A',
  creditNoteSeries: 'NC',
  nextInvoiceFolio: 1,
  nextCreditNoteFolio: 1,
  pacProvider: 'sw',
  pacUsername: 'pac@example.com',
  pacProductionMode: false,
  logoPath: '',
  isActive: true,
}

describe('transformCompanySettingFormToJsonApi', () => {
  it('usa el tipo y las llaves del Schema', () => {
    const payload = transformCompanySettingFormToJsonApi(form) as {
      type: string
      attributes: Record<string, unknown>
    }

    expect(payload.type).toBe('company-settings')
    expect(payload.attributes).toMatchObject({
      companyName: 'Empresa SA de CV',
      taxRegime: '601',
      nextInvoiceFolio: 1,
      pacProductionMode: false,
      logoPath: null,
      isActive: true,
    })
    expect(Object.keys(payload.attributes).filter((k) => k.includes('_'))).toEqual([])
  })

  it('nunca manda certificado, llave ni su contrasena', () => {
    const legado = { ...form, certificateFile: 'x.cer', keyFile: 'x.key', keyPassword: 'secreto' }
    const attributes = (transformCompanySettingFormToJsonApi(legado) as { attributes: Record<string, unknown> }).attributes

    for (const key of ['certificateFile', 'keyFile', 'keyPassword', 'certificate_file', 'key_file', 'key_password']) {
      expect(attributes).not.toHaveProperty(key)
    }
  })

  it('pacPassword vacio no se manda para no borrar el guardado', () => {
    const sin = (transformCompanySettingFormToJsonApi({ ...form, pacPassword: '' }) as { attributes: Record<string, unknown> }).attributes
    expect(sin).not.toHaveProperty('pacPassword')
    const con = (transformCompanySettingFormToJsonApi({ ...form, pacPassword: 'nueva' }) as { attributes: Record<string, unknown> }).attributes
    expect(con.pacPassword).toBe('nueva')
  })
})

describe('transformJsonApiCompanySetting', () => {
  it('lee la respuesta camelCase de la API', () => {
    const setting = transformJsonApiCompanySetting({
      id: 3,
      attributes: { companyName: 'Empresa', taxRegime: '612', certificateFile: 'c.cer', isActive: true },
    })

    expect(setting).toMatchObject({ id: '3', companyName: 'Empresa', taxRegime: '612', certificateFile: 'c.cer', isActive: true })
  })
})
