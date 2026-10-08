/**
 * Contrato de cfdi-invoices y cfdi-items contra CFDIInvoiceSchema / CFDIItemSchema
 * y sus Requests: lectura camelCase, includes kebab-case y payload exacto.
 */

import { describe, it, expect } from 'vitest'
import {
  transformJsonApiCFDIInvoice,
  transformCFDIInvoiceFormToJsonApi,
  transformCFDIInvoicesResponse,
  transformJsonApiCFDIItem,
  transformCFDIItemFormToJsonApi,
} from '../../utils/transformers'
import type { CFDIInvoiceFormData, CFDIItemFormData } from '../../types'

// Atributos tal como los serializa CFDIInvoiceSchema::fields()
const invoiceAttributes = {
  companySettingId: 3,
  contactId: 7,
  arInvoiceId: 11,
  branchId: 2,
  series: 'FAC',
  folio: 120,
  uuid: 'AAAA-BBBB',
  tipoComprobante: 'P',
  receptorRfc: 'XAXX010101000',
  receptorNombre: 'Cliente SA',
  receptorUsoCfdi: 'G03',
  receptorRegimenFiscal: '601',
  receptorDomicilioFiscal: '01000',
  subtotal: 100000,
  total: 116000,
  descuento: 0,
  iva: 16000,
  ieps: 0,
  isrRetenido: 0,
  ivaRetenido: 0,
  moneda: 'MXN',
  tipoCambio: 1,
  formaPago: '03',
  metodoPago: 'PPD',
  condicionesPago: 'Contado',
  fechaPago: '2026-09-01T00:00:00.000000Z',
  montoPago: 50000,
  formaPagoP: '03',
  arPaymentId: 5,
  numParcialidad: 2,
  impSaldoInsoluto: 66000,
  cfdiRelacionadoTipo: '04',
  cfdiRelacionadoUuids: ['UUID-1'],
  status: 'valid',
  fechaEmision: '2026-09-01T10:00:00.000000Z',
  fechaTimbrado: '2026-09-01T10:05:00.000000Z',
  fechaCancelacion: null,
  xmlPath: 'cfdi/FAC-120.xml',
  pdfPath: 'cfdi/FAC-120.pdf',
  errorMessage: null,
  metadata: { origen: 'test' },
  createdAt: '2026-09-01T10:00:00.000000Z',
  updatedAt: '2026-09-01T10:05:00.000000Z',
  pacResponse: null,
}

const invoiceResource = {
  type: 'cfdi-invoices',
  id: '42',
  attributes: invoiceAttributes,
  relationships: {
    companySetting: { data: { type: 'company-settings', id: '3' } },
    contact: { data: { type: 'contacts', id: '7' } },
    arInvoice: { data: { type: 'ar-invoices', id: '11' } },
    branch: { data: { type: 'branches', id: '2' } },
    items: { data: [{ type: 'cfdi-items', id: '90' }] },
  },
}

// Atributos tal como los serializa CFDIItemSchema::fields()
const itemAttributes = {
  cfdiInvoiceId: 42,
  productId: 15,
  numeroLinea: 1,
  claveProdServ: '41116105',
  claveUnidad: 'H87',
  unidad: 'Pieza',
  cantidad: 2,
  descripcion: 'Reactivo',
  noIdentificacion: 'SKU-1',
  valorUnitario: 50000,
  importe: 100000,
  descuento: 0,
  impuestos: {
    traslados: [{ base: 100000, impuesto: '002', tipo_factor: 'Tasa', tasa_o_cuota: '0.160000', importe: 16000 }],
    retenciones: [],
  },
  objetoImp: '02',
  numeroPedimento: null,
  cuentaPredial: null,
  informacionAduanera: null,
  metadata: null,
  createdAt: '2026-09-01T10:00:00.000000Z',
  updatedAt: '2026-09-01T10:00:00.000000Z',
}

const included = [
  { type: 'company-settings', id: '3', attributes: { companyName: 'Emisor SA', rfc: 'EKU9003173C9' } },
  { type: 'contacts', id: '7', attributes: { name: 'Cliente SA' } },
  { type: 'ar-invoices', id: '11', attributes: { invoiceNumber: 'AR-11' } },
  { type: 'cfdi-items', id: '90', attributes: itemAttributes },
  // Mismo id con otro tipo: no debe colarse
  { type: 'contacts', id: '3', attributes: { name: 'Otro' } },
]

describe('transformJsonApiCFDIInvoice', () => {
  it('lee los atributos camelCase del Schema', () => {
    const invoice = transformJsonApiCFDIInvoice(invoiceResource)

    expect(invoice).toMatchObject({
      id: '42',
      companySettingId: 3,
      contactId: 7,
      arInvoiceId: 11,
      branchId: 2,
      series: 'FAC',
      folio: 120,
      uuid: 'AAAA-BBBB',
      tipoComprobante: 'P',
      receptorRfc: 'XAXX010101000',
      receptorNombre: 'Cliente SA',
      receptorUsoCfdi: 'G03',
      receptorRegimenFiscal: '601',
      receptorDomicilioFiscal: '01000',
      subtotal: 100000,
      total: 116000,
      iva: 16000,
      moneda: 'MXN',
      tipoCambio: 1,
      formaPago: '03',
      metodoPago: 'PPD',
      condicionesPago: 'Contado',
      fechaPago: '2026-09-01T00:00:00.000000Z',
      montoPago: 50000,
      formaPagoP: '03',
      arPaymentId: 5,
      numParcialidad: 2,
      impSaldoInsoluto: 66000,
      cfdiRelacionadoTipo: '04',
      cfdiRelacionadoUuids: ['UUID-1'],
      status: 'valid',
      fechaEmision: '2026-09-01T10:00:00.000000Z',
      fechaTimbrado: '2026-09-01T10:05:00.000000Z',
      xmlPath: 'cfdi/FAC-120.xml',
      pdfPath: 'cfdi/FAC-120.pdf',
      metadata: { origen: 'test' },
      createdAt: '2026-09-01T10:00:00.000000Z',
      updatedAt: '2026-09-01T10:05:00.000000Z',
    })
    expect(invoice.fechaCancelacion).toBeUndefined()
    expect(invoice.errorMessage).toBeUndefined()
  })

  it('resuelve includes por su tipo kebab-case', () => {
    const invoice = transformJsonApiCFDIInvoice(invoiceResource, included)

    expect(invoice.companySetting).toMatchObject({ id: '3', companyName: 'Emisor SA', rfc: 'EKU9003173C9' })
    expect(invoice.contact).toEqual({ id: '7', name: 'Cliente SA' })
    expect(invoice.arInvoice).toEqual({ id: '11', invoiceNumber: 'AR-11' })
    expect(invoice.items).toHaveLength(1)
    expect(invoice.items?.[0]).toMatchObject({ id: '90', claveProdServ: '41116105', valorUnitario: 50000 })
  })

  it('ignora includes con tipos snake_case viejos', () => {
    const invoice = transformJsonApiCFDIInvoice(invoiceResource, [
      { type: 'company_settings', id: '3', attributes: {} },
      { type: 'cfdi_items', id: '90', attributes: itemAttributes },
    ])

    expect(invoice.companySetting).toBeUndefined()
    expect(invoice.items).toEqual([])
  })

  it('conserva respaldo snake_case', () => {
    const invoice = transformJsonApiCFDIInvoice({
      type: 'cfdi-invoices',
      id: '1',
      attributes: { company_setting_id: 9, receptor_rfc: 'XEXX010101000', fecha_emision: '2026-01-01' },
    })

    expect(invoice.companySettingId).toBe(9)
    expect(invoice.receptorRfc).toBe('XEXX010101000')
    expect(invoice.fechaEmision).toBe('2026-01-01')
  })

  it('transforma la coleccion con included', () => {
    const result = transformCFDIInvoicesResponse({ data: [invoiceResource], included, meta: { page: {} } })

    expect(result.data[0].companySetting?.companyName).toBe('Emisor SA')
    expect(result.meta).toEqual({ page: {} })
  })
})

describe('transformCFDIInvoiceFormToJsonApi', () => {
  const form: CFDIInvoiceFormData = {
    companySettingId: 3,
    contactId: 7,
    series: 'FAC',
    folio: 120,
    tipoComprobante: 'I',
    receptorRfc: 'XAXX010101000',
    receptorNombre: 'Cliente SA',
    receptorUsoCfdi: 'G03',
    receptorRegimenFiscal: '601',
    receptorDomicilioFiscal: '01000',
    subtotal: 100000,
    total: 116000,
    descuento: 0,
    iva: 16000,
    ieps: 0,
    isrRetenido: 0,
    ivaRetenido: 0,
    moneda: 'MXN',
    tipoCambio: 1,
    formaPago: '03',
    metodoPago: 'PUE',
    condicionesPago: '',
    status: 'draft',
    fechaEmision: '2026-09-01',
  }

  it('manda el tipo y las llaves exactas de CFDIInvoiceRequest', () => {
    expect(transformCFDIInvoiceFormToJsonApi(form)).toEqual({
      type: 'cfdi-invoices',
      attributes: {
        companySettingId: 3,
        contactId: 7,
        series: 'FAC',
        folio: 120,
        tipoComprobante: 'I',
        receptorRfc: 'XAXX010101000',
        receptorNombre: 'Cliente SA',
        receptorUsoCfdi: 'G03',
        receptorRegimenFiscal: '601',
        receptorDomicilioFiscal: '01000',
        subtotal: 100000,
        total: 116000,
        descuento: 0,
        iva: 16000,
        ieps: 0,
        isrRetenido: 0,
        ivaRetenido: 0,
        moneda: 'MXN',
        tipoCambio: 1,
        formaPago: '03',
        metodoPago: 'PUE',
        condicionesPago: null,
        status: 'draft',
        fechaEmision: '2026-09-01',
      },
    })
  })

  it('no manda opcionales ausentes (un null en PATCH borraria arInvoiceId)', () => {
    const { folio: _folio, ...edit } = form
    const attributes = (transformCFDIInvoiceFormToJsonApi(edit) as { attributes: Record<string, unknown> }).attributes

    for (const key of ['folio', 'arInvoiceId', 'branchId', 'cfdiRelacionadoTipo', 'cfdiRelacionadoUuids', 'metadata']) {
      expect(attributes).not.toHaveProperty(key)
    }
  })

  it('manda opcionales presentes', () => {
    const attributes = (
      transformCFDIInvoiceFormToJsonApi({
        ...form,
        arInvoiceId: 11,
        branchId: 2,
        cfdiRelacionadoTipo: '04',
        cfdiRelacionadoUuids: ['UUID-1'],
      }) as { attributes: Record<string, unknown> }
    ).attributes

    expect(attributes).toMatchObject({
      arInvoiceId: 11,
      branchId: 2,
      cfdiRelacionadoTipo: '04',
      cfdiRelacionadoUuids: ['UUID-1'],
    })
  })

  it('no escribe llaves snake_case', () => {
    const attributes = (transformCFDIInvoiceFormToJsonApi(form) as { attributes: Record<string, unknown> }).attributes
    expect(Object.keys(attributes).filter((k) => k.includes('_'))).toEqual([])
  })
})

describe('transformJsonApiCFDIItem', () => {
  it('lee camelCase y deriva traslado* de impuestos', () => {
    const item = transformJsonApiCFDIItem(
      {
        type: 'cfdi-items',
        id: '90',
        attributes: itemAttributes,
        relationships: {
          cfdiInvoice: { data: { type: 'cfdi-invoices', id: '42' } },
          product: { data: { type: 'products', id: '15' } },
        },
      },
      [invoiceResource, { type: 'products', id: '15', attributes: { name: 'Reactivo', sku: 'SKU-1' } }]
    )

    expect(item).toMatchObject({
      id: '90',
      cfdiInvoiceId: 42,
      productId: 15,
      numeroLinea: 1,
      claveProdServ: '41116105',
      claveUnidad: 'H87',
      unidad: 'Pieza',
      cantidad: 2,
      descripcion: 'Reactivo',
      noIdentificacion: 'SKU-1',
      valorUnitario: 50000,
      importe: 100000,
      descuento: 0,
      objetoImp: '02',
      trasladoImpuesto: '002',
      trasladoTipoFactor: 'Tasa',
      trasladoTasaOCuota: '0.160000',
      trasladoImporte: 16000,
      createdAt: '2026-09-01T10:00:00.000000Z',
    })
    expect(item.retencionImpuesto).toBeUndefined()
    expect(item.cfdiInvoice?.id).toBe('42')
    expect(item.product).toEqual({ id: '15', name: 'Reactivo', sku: 'SKU-1' })
  })
})

describe('transformCFDIItemFormToJsonApi', () => {
  const itemForm: CFDIItemFormData = {
    cfdiInvoiceId: 42,
    numeroLinea: 2,
    claveProdServ: '41116105',
    noIdentificacion: 'SKU-1',
    cantidad: 2,
    claveUnidad: 'H87',
    unidad: 'Pieza',
    descripcion: 'Reactivo',
    valorUnitario: 50000,
    importe: 100000,
    descuento: 0,
    objetoImp: '02',
    trasladoImpuesto: '002',
    trasladoTipoFactor: 'Tasa',
    trasladoTasaOCuota: '0.160000',
    trasladoImporte: 16000,
  }

  it('manda el tipo y las llaves exactas de CFDIItemRequest, con impuestos armado', () => {
    expect(transformCFDIItemFormToJsonApi(itemForm)).toEqual({
      type: 'cfdi-items',
      attributes: {
        cfdiInvoiceId: 42,
        numeroLinea: 2,
        claveProdServ: '41116105',
        noIdentificacion: 'SKU-1',
        cantidad: 2,
        claveUnidad: 'H87',
        unidad: 'Pieza',
        descripcion: 'Reactivo',
        valorUnitario: 50000,
        importe: 100000,
        descuento: 0,
        objetoImp: '02',
        impuestos: {
          traslados: [
            { base: 100000, impuesto: '002', tipo_factor: 'Tasa', tasa_o_cuota: '0.160000', importe: 16000 },
          ],
          retenciones: [],
        },
      },
    })
  })

  it('numeroLinea por omision 1 y sin impuestos si no hay traslado ni retencion', () => {
    const attributes = (
      transformCFDIItemFormToJsonApi({
        cfdiInvoiceId: 42,
        claveProdServ: '01010101',
        cantidad: 1,
        claveUnidad: 'H87',
        unidad: 'Pieza',
        descripcion: 'Servicio',
        valorUnitario: 1000,
        importe: 1000,
        objetoImp: '01',
      }) as { attributes: Record<string, unknown> }
    ).attributes

    expect(attributes.numeroLinea).toBe(1)
    expect(attributes).not.toHaveProperty('impuestos')
    expect(attributes).not.toHaveProperty('productId')
  })

  it('no escribe campos que no son atributos del Schema', () => {
    const attributes = (transformCFDIItemFormToJsonApi(itemForm) as { attributes: Record<string, unknown> }).attributes
    const allowed = new Set([
      'cfdiInvoiceId', 'productId', 'numeroLinea', 'claveProdServ', 'claveUnidad', 'unidad', 'cantidad',
      'descripcion', 'noIdentificacion', 'valorUnitario', 'importe', 'descuento', 'impuestos', 'objetoImp',
      'numeroPedimento', 'cuentaPredial', 'informacionAduanera', 'metadata',
    ])
    expect(Object.keys(attributes).filter((k) => !allowed.has(k))).toEqual([])
  })
})
