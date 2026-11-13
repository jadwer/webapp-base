/**
 * Diseno de los PDF: galeria de plantillas y estilo por fila (2026-11-12)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { DocumentDesigner } from '../../documents/DocumentDesigner'
import { documentDesignService } from '../../documents/documentDesignService'
import { pageValue, setCellStyle, setPageStyle, setThemeStyle } from '../../documents/layoutOps'
import type { DocumentDesign, RawLayout } from '../../documents/types'

vi.mock('@lwm/ui', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  LwStatusPill: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  LwResultModal: ({ open, title, confirmLabel, onConfirm }: { open: boolean; title: string; confirmLabel?: string; onConfirm: () => void }) =>
    open ? <div role="dialog"><p>{title}</p><button onClick={onConfirm}>{confirmLabel}</button></div> : null,
}))

vi.mock('../../documents/documentDesignService', async (orig) => {
  const real = await orig<typeof import('../../documents/documentDesignService')>()
  return {
    ...real,
    documentDesignService: {
      list: vi.fn(),
      get: vi.fn(),
      applyStyle: vi.fn(),
      thumbnail: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      preview: vi.fn(),
      setSetting: vi.fn(),
    },
  }
})

import { toast } from '@lwm/ui'

const layout: RawLayout = {
  version: 1,
  theme: { mode: 'color' },
  rows: [
    { cells: [{ block: 'issuer', span: 7 }, { block: 'title', span: 5 }] },
    { cells: [{ block: 'lines', options: { columns: ['sku', 'description'] } }] },
    { cells: [{ block: 'signature' }] },
  ],
}

const professional: RawLayout = {
  version: 1,
  theme: { mode: 'mono' },
  rows: [
    { cells: [{ block: 'issuer', span: 7, options: { logo: 'large' } }, { block: 'title', span: 5, options: { style: 'bar' } }] },
    { cells: [{ block: 'lines', options: { columns: ['sku', 'description'], header: 'dark' } }] },
    { cells: [{ block: 'signature' }] },
  ],
}

const enumOpt = (key: string, label: string, values: string[], def: string) => ({
  key, label, type: 'enum' as const, style: true, default: def, values: values.map((v) => ({ value: v, label: v.toUpperCase() })),
})

const design: DocumentDesign = {
  type: 'remission',
  label: 'Remisión',
  enabledKey: 'documents.builder.remission',
  enabled: true,
  customized: false,
  style: 'standard',
  updatedAt: null,
  layout,
  styles: [
    { key: 'standard', label: 'Estándar', description: 'Lo de hoy', thumbnail: true },
    { key: 'professional', label: 'Profesional', description: 'Barras negras', thumbnail: true },
  ],
  catalog: {
    blocks: {
      issuer: { label: 'Emisor', options: [enumOpt('logo', 'Tamaño del logo', ['none', 'small', 'medium', 'large'], 'small')] },
      title: { label: 'Título y folio', options: [enumOpt('style', 'Fondo del título', ['band', 'bar', 'box', 'plain'], 'band')] },
      lines: { label: 'Partidas', options: [enumOpt('header', 'Encabezado de la tabla', ['auto', 'dark', 'light', 'line'], 'auto')] },
      signature: { label: 'Firmas', options: [] },
    },
    theme: [
      enumOpt('mode', 'Color del documento', ['color', 'mono', 'mixed'], 'color'),
      { key: 'accent', label: 'Color de acento', type: 'color', style: true, default: null },
    ],
    page: [enumOpt('footer.rule', 'Línea del pie', ['thin', 'accent', 'none'], 'thin')],
  },
}

describe('layoutOps (estilo)', () => {
  it('sets and clears cell, theme and page styles without touching content', () => {
    const a = setCellStyle(layout, 1, 0, 'header', 'dark')
    expect(a.rows[1].cells[0].options).toEqual({ columns: ['sku', 'description'], header: 'dark' })
    expect(setCellStyle(a, 1, 0, 'header', undefined).rows[1].cells[0].options).toEqual({ columns: ['sku', 'description'] })
    expect(layout.rows[1].cells[0].options).toEqual({ columns: ['sku', 'description'] })

    expect(setThemeStyle(layout, 'accent', '#112233').theme).toEqual({ mode: 'color', accent: '#112233' })
    expect(setThemeStyle(setThemeStyle(layout, 'accent', '#112233'), 'accent', undefined).theme).toEqual({ mode: 'color' })

    const p = setPageStyle(layout, 'footer.rule', 'accent')
    expect(pageValue(p, 'footer.rule')).toBe('accent')
    expect(pageValue(setPageStyle(p, 'footer.rule', undefined), 'footer.rule')).toBeUndefined()
  })
})

describe('DocumentDesigner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(documentDesignService.list).mockResolvedValue([{ type: 'remission', label: 'Remisión', enabledKey: 'documents.builder.remission', enabled: true, customized: false, style: 'standard' }])
    vi.mocked(documentDesignService.get).mockResolvedValue(structuredClone(design))
    vi.mocked(documentDesignService.thumbnail).mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
    vi.mocked(documentDesignService.preview).mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }))
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:x')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('shows the gallery and only style options per row (no content editing)', async () => {
    render(<DocumentDesigner />)

    expect(await screen.findByRole('radio', { name: 'Plantilla Estándar' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Plantilla Profesional' })).toBeInTheDocument()
    expect(screen.getByText('Fila 1: Emisor + Título y folio')).toBeInTheDocument()
    expect(within(screen.getByTestId('designer-row-1')).getByLabelText('Encabezado de la tabla')).toBeInTheDocument()
    expect(within(screen.getByTestId('designer-row-2')).getByText(/Sin opciones de estilo/)).toBeInTheDocument()
    expect(screen.queryByText(/Columnas de la tabla/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Subir fila/ })).not.toBeInTheDocument()
  })

  it('applies a template from the gallery and saves it with its key', async () => {
    vi.mocked(documentDesignService.applyStyle).mockResolvedValue({ layout: professional, style: 'professional' })
    vi.mocked(documentDesignService.save).mockImplementation(async (_t, l, s) => ({ layout: l, style: s, customized: true, updatedAt: 'x' }))
    render(<DocumentDesigner />)

    fireEvent.click(await screen.findByRole('radio', { name: 'Plantilla Profesional' }))
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Plantilla Profesional' })).toHaveAttribute('aria-checked', 'true'))
    expect(screen.getByLabelText('Color del documento')).toHaveValue('mono')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar diseño' }))

    await waitFor(() => expect(documentDesignService.save).toHaveBeenCalledWith('remission', professional, 'professional'))
    expect(toast.success).toHaveBeenCalled()
    expect(await screen.findByText('Personalizado (Profesional)')).toBeInTheDocument()
  })

  it('adjusts a row style and sends it to save', async () => {
    vi.mocked(documentDesignService.save).mockImplementation(async (_t, l, s) => ({ layout: l, style: s, customized: true, updatedAt: 'x' }))
    render(<DocumentDesigner />)

    const row = await screen.findByTestId('designer-row-1')
    fireEvent.change(within(row).getByLabelText('Encabezado de la tabla'), { target: { value: 'line' } })
    fireEvent.change(screen.getByLabelText('Línea del pie'), { target: { value: 'none' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar diseño' }))

    await waitFor(() => expect(documentDesignService.save).toHaveBeenCalled())
    const sent = vi.mocked(documentDesignService.save).mock.calls[0][1]
    expect(sent.rows[1].cells[0].options).toEqual({ columns: ['sku', 'description'], header: 'line' })
    expect(sent.page?.footer?.rule).toBe('none')
  })

  it('shows the backend message in Spanish when saving fails', async () => {
    vi.mocked(documentDesignService.save).mockRejectedValue({ response: { status: 422, data: { message: 'Esa plantilla no existe.' } } })
    render(<DocumentDesigner />)

    fireEvent.change(await screen.findByLabelText('Fondo del título'), { target: { value: 'box' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar diseño' }))

    expect(await screen.findByText('Esa plantilla no existe.')).toBeInTheDocument()
  })

  it('previews the draft as a real PDF with its own color', async () => {
    render(<DocumentDesigner />)

    expect(await screen.findByTitle('Vista previa del PDF', {}, { timeout: 3000 })).toHaveAttribute('src', 'blob:x')
    expect(documentDesignService.preview).toHaveBeenCalledWith('remission', layout)
  })
})
