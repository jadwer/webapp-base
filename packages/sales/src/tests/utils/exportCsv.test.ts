/**
 * CSV export helpers tests (Fase A - menu Operaciones)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildCsv,
  downloadCsv,
  quoteItemsCsv,
  salesOrderItemsCsv,
  exportQuoteItemsCsv,
} from '../../utils/exportCsv'
import { createMockQuoteItem } from '../../quotes/tests/utils/test-utils'
import type { SalesOrderItem } from '../../types'

describe('buildCsv', () => {
  it('joins headers and rows with CRLF', () => {
    const csv = buildCsv(['a', 'b'], [[1, 2], ['x', 'y']])
    expect(csv).toBe('a,b\r\n1,2\r\nx,y')
  })

  it('escapes cells with commas, quotes and newlines', () => {
    const csv = buildCsv(['name'], [['Acido, 99% "puro"'], ['linea1\nlinea2']])
    expect(csv).toBe('name\r\n"Acido, 99% ""puro"""\r\n"linea1\nlinea2"')
  })

  it('renders null/undefined as empty cells', () => {
    const csv = buildCsv(['a', 'b', 'c'], [[null, undefined, 0]])
    expect(csv).toBe('a,b,c\r\n,,0')
  })
})

describe('quoteItemsCsv', () => {
  it('includes header and one row per item', () => {
    const item = createMockQuoteItem({
      productSku: 'SKU-1',
      productName: 'Producto X',
      quantity: 3,
      unitPrice: 100,
      quotedPrice: 90,
      discountPercentage: 10,
      discountAmount: 30,
      taxRate: 16,
      taxAmount: 43.2,
      total: 313.2,
      notes: 'nota',
    })
    const csv = quoteItemsCsv([item])
    const lines = csv.split('\r\n')

    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('SKU,Producto,Cantidad')
    expect(lines[1]).toBe('SKU-1,Producto X,3,100,90,10,30,16,43.2,313.2,nota')
  })

  it('falls back to product id when there is no name', () => {
    const item = createMockQuoteItem({ productName: null, productId: 42 })
    const csv = quoteItemsCsv([item])
    expect(csv).toContain('Producto #42')
  })
})

describe('salesOrderItemsCsv', () => {
  it('uses the resolved product name and sku', () => {
    const item = {
      id: '1',
      salesOrderId: 1,
      productId: 9,
      quantity: 2,
      unitPrice: 50,
      discount: 5,
      total: 95,
      product: { id: 9, name: 'Producto Y', sku: 'SKU-Y' },
    } as unknown as SalesOrderItem
    const csv = salesOrderItemsCsv([item])
    const lines = csv.split('\r\n')

    expect(lines[0]).toBe('SKU,Producto,Cantidad,Precio unitario,Descuento,Total')
    expect(lines[1]).toBe('SKU-Y,Producto Y,2,50,5,95')
  })
})

describe('downloadCsv / exportQuoteItemsCsv', () => {
  let clickSpy: ReturnType<typeof vi.fn>
  let createdAnchor: HTMLAnchorElement | null

  beforeEach(() => {
    createdAnchor = null
    clickSpy = vi.fn()
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()

    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        createdAnchor = el as HTMLAnchorElement
        el.addEventListener('click', (e) => {
          e.preventDefault()
          clickSpy()
        })
      }
      return el
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers a browser download with the given filename', () => {
    downloadCsv('archivo.csv', 'a,b\r\n1,2')

    expect(window.URL.createObjectURL).toHaveBeenCalled()
    expect(createdAnchor?.download).toBe('archivo.csv')
    expect(clickSpy).toHaveBeenCalled()
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('exportQuoteItemsCsv names the file after the quote number', () => {
    exportQuoteItemsCsv('COT-26000001', [createMockQuoteItem()])
    expect(createdAnchor?.download).toBe('cotizacion-COT-26000001-partidas.csv')
  })
})
