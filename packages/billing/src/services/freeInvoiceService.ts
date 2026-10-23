import axiosClient from '../lib/axiosClient'

/**
 * Factura libre estilo Bind (api-base FreeInvoiceController). Las opciones
 * (series, metodos, tasas, formas de pago, usos) vienen del backend: el
 * formulario no duplica catalogos (regla 7).
 */

export interface FreeInvoiceOption {
  code: string
  label: string
}

export interface FreeInvoiceSeriesOption {
  code: string
  name: string
  isDefault: boolean
  nextFolio: string
}

export interface FreeInvoiceOptions {
  series: FreeInvoiceSeriesOption[]
  metodosPago: FreeInvoiceOption[]
  tasasIva: FreeInvoiceOption[]
  formasPago: FreeInvoiceOption[]
  usosCfdi: FreeInvoiceOption[]
}

export interface FreeInvoiceReceptor {
  rfc: string
  nombre: string
  codigoPostal: string | null
  regimenFiscal: string
  usoCfdi: string
  email: string | null
  paymentTerms: number | null
  faltantes: string[]
}

export interface FreeInvoiceLine {
  productId?: string | null
  descripcion: string
  cantidad: number
  valorUnitario: number
  descuento?: number
  claveProdServ: string
  claveUnidad: string
  unidad?: string | null
  noIdentificacion?: string | null
  tasaIva: string
}

export interface FreeInvoicePayload {
  contactId: string
  series?: string | null
  metodoPago: string
  formaPago: string
  usoCfdi?: string | null
  condicionesPago?: string | null
  notes?: string | null
  items: FreeInvoiceLine[]
}

export interface FreeInvoiceCustomer {
  id: string
  name: string
  legalName?: string | null
  taxId?: string | null
}

type Row = Record<string, unknown>

export const freeInvoiceService = {
  getOptions: async (): Promise<FreeInvoiceOptions> => {
    const { data } = await axiosClient.get('/api/v1/cfdi-invoices/free/options')
    const d = (data?.data ?? {}) as Row
    const list = (v: unknown) => (Array.isArray(v) ? (v as FreeInvoiceOption[]) : [])
    return {
      series: (Array.isArray(d.series) ? (d.series as Row[]) : []).map((s) => ({
        code: String(s.code),
        name: String(s.name ?? s.code),
        isDefault: Boolean(s.is_default),
        nextFolio: String(s.next_folio ?? ''),
      })),
      metodosPago: list(d.metodos_pago),
      tasasIva: list(d.tasas_iva),
      formasPago: list(d.formas_pago),
      usosCfdi: list(d.usos_cfdi),
    }
  },

  getReceptor: async (contactId: string): Promise<FreeInvoiceReceptor> => {
    const { data } = await axiosClient.get(`/api/v1/cfdi-invoices/free/receptor/${contactId}`)
    const d = (data?.data ?? {}) as Row
    return {
      rfc: String(d.rfc ?? ''),
      nombre: String(d.nombre ?? ''),
      codigoPostal: (d.codigo_postal as string | null) ?? null,
      regimenFiscal: String(d.regimen_fiscal ?? ''),
      usoCfdi: String(d.uso_cfdi ?? ''),
      email: (d.email as string | null) ?? null,
      paymentTerms: d.payment_terms === null || d.payment_terms === undefined ? null : Number(d.payment_terms),
      faltantes: Array.isArray(d.faltantes) ? (d.faltantes as string[]) : [],
    }
  },

  searchCustomers: async (term: string): Promise<FreeInvoiceCustomer[]> => {
    const { data } = await axiosClient.get('/api/v1/contacts', {
      params: {
        'filter[search]': term,
        'filter[isCustomer]': '1',
        'page[size]': 20,
        sort: 'name',
      },
    })
    return ((data?.data ?? []) as Array<{ id: string; attributes?: Row }>).map((c) => ({
      id: String(c.id),
      name: String(c.attributes?.name ?? `Cliente #${c.id}`),
      legalName: (c.attributes?.legalName as string | null) ?? null,
      taxId: (c.attributes?.taxId as string | null) ?? null,
    }))
  },

  /** Crea el borrador (la cuenta por cobrar nace al timbrar); devuelve el id del CFDI. */
  create: async (payload: FreeInvoicePayload): Promise<{ id: string; series: string; folio: number; message: string }> => {
    const { data } = await axiosClient.post('/api/v1/cfdi-invoices/free', toApiPayload(payload))
    const d = (data?.data ?? {}) as Row
    return { id: String(d.id), series: String(d.series), folio: Number(d.folio), message: String(data?.message ?? '') }
  },

  /** Edita un borrador de factura libre sin timbrar; serie y folio no cambian. */
  update: async (id: string, payload: FreeInvoicePayload): Promise<{ id: string; series: string; folio: number; message: string }> => {
    const { data } = await axiosClient.patch(`/api/v1/cfdi-invoices/free/${id}`, toApiPayload(payload))
    const d = (data?.data ?? {}) as Row
    return { id: String(d.id), series: String(d.series), folio: Number(d.folio), message: String(data?.message ?? '') }
  },
}

function toApiPayload(payload: FreeInvoicePayload) {
  return {
    contact_id: Number(payload.contactId),
    series: payload.series || null,
    metodo_pago: payload.metodoPago,
    forma_pago: payload.formaPago,
    uso_cfdi: payload.usoCfdi || null,
    condiciones_pago: payload.condicionesPago || null,
    notes: payload.notes || null,
    items: payload.items.map((i) => ({
      product_id: i.productId ? Number(i.productId) : null,
      descripcion: i.descripcion,
      cantidad: i.cantidad,
      valor_unitario: i.valorUnitario,
      descuento: i.descuento || 0,
      clave_prod_serv: i.claveProdServ,
      clave_unidad: i.claveUnidad,
      unidad: i.unidad || null,
      no_identificacion: i.noIdentificacion || null,
      tasa_iva: i.tasaIva,
    })),
  }
}
