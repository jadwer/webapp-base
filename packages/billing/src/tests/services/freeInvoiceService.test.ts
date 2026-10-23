import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import { freeInvoiceService } from '../../services/freeInvoiceService'
import { computeLine } from '../../components/FreeInvoiceForm'

vi.mock('../../lib/axiosClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

describe('factura libre', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calcula el concepto igual que el backend (IVA sobre importe menos descuento)', () => {
    expect(computeLine({ cantidad: '2', valorUnitario: '1000', descuento: '100', tasaIva: '0.160000' })).toEqual({
      importe: 200000,
      descuento: 10000,
      iva: 30400,
    })
    expect(computeLine({ cantidad: '1', valorUnitario: '500', descuento: '', tasaIva: 'no_objeto' }).iva).toBe(0)
  })

  it('manda el payload en snake_case y devuelve el id del CFDI', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({
      data: { message: 'Factura creada como borrador', data: { id: 7, series: 'FAC', folio: 3, status: 'draft' } },
    })

    const result = await freeInvoiceService.create({
      contactId: '5',
      series: 'FAC',
      metodoPago: 'PPD',
      formaPago: '99',
      items: [
        { productId: '9', descripcion: 'Calibración', cantidad: 2, valorUnitario: 1000, descuento: 0, claveProdServ: '81111500', claveUnidad: 'E48', tasaIva: '0.160000' },
      ],
    })

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/cfdi-invoices/free', expect.objectContaining({
      contact_id: 5,
      metodo_pago: 'PPD',
      forma_pago: '99',
      items: [expect.objectContaining({ product_id: 9, valor_unitario: 1000, clave_prod_serv: '81111500', tasa_iva: '0.160000' })],
    }))
    expect(result).toEqual({ id: '7', series: 'FAC', folio: 3, message: 'Factura creada como borrador' })
  })

  it('lee opciones del backend (series con folio siguiente)', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: { data: { series: [{ code: 'FAC', name: 'Normal', is_default: true, next_folio: 'FAC-000001' }], metodos_pago: [{ code: 'PUE', label: 'PUE' }], tasas_iva: [], formas_pago: [], usos_cfdi: [] } },
    })

    const o = await freeInvoiceService.getOptions()

    expect(o.series[0]).toEqual({ code: 'FAC', name: 'Normal', isDefault: true, nextFolio: 'FAC-000001' })
    expect(o.metodosPago).toHaveLength(1)
  })

  it('edita un borrador con PATCH al endpoint de factura libre', async () => {
    vi.mocked(axiosClient.patch).mockResolvedValue({
      data: { message: 'Borrador actualizado', data: { id: 7, series: 'FAC', folio: 3, status: 'draft' } },
    })

    const result = await freeInvoiceService.update('7', {
      contactId: '5',
      metodoPago: 'PUE',
      formaPago: '03',
      items: [{ descripcion: 'Servicio', cantidad: 1, valorUnitario: 100, claveProdServ: '81111500', claveUnidad: 'E48', tasaIva: 'no_objeto' }],
    })

    expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/cfdi-invoices/free/7', expect.objectContaining({ metodo_pago: 'PUE', forma_pago: '03' }))
    expect(result).toEqual({ id: '7', series: 'FAC', folio: 3, message: 'Borrador actualizado' })
  })
})
