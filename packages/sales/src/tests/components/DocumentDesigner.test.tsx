/**
 * Editor visual de documentos (2026-11-12)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { DocumentDesigner } from '../../documents/DocumentDesigner'
import { documentDesignService } from '../../documents/documentDesignService'
import { addRow, compactColumn, moveRow, removeCell, setLeftSpan, setOption, splitRow, widthTotal } from '../../documents/layoutOps'
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
  name: 'Remisión',
  theme: { mode: 'mono' },
  rows: [
    { cells: [{ block: 'issuer', span: 7 }, { block: 'title', span: 5 }] },
    { cells: [{ block: 'party' }] },
    { cells: [{ block: 'lines', options: { columns: ['sku', 'description', 'quantity'] } }] },
    { cells: [{ block: 'signature' }] },
  ],
}

const design: DocumentDesign = {
  type: 'remission',
  label: 'Remisión',
  enabledKey: 'documents.builder.remission',
  enabled: true,
  modeKey: 'documents.builder.remission_mode',
  mode: 'mono',
  customized: false,
  updatedAt: null,
  layout,
  modes: [{ value: 'color', label: 'Color' }, { value: 'mono', label: 'Blanco y negro' }, { value: 'mixed', label: 'Mixto' }],
  catalog: {
    blocks: [
      { key: 'issuer', label: 'Emisor', description: 'Datos de la empresa', options: [{ key: 'email', type: 'bool', label: 'Mostrar el correo' }], alone: false },
      { key: 'title', label: 'Título y folio', description: 'Folio', options: [{ key: 'chip', type: 'bool', label: 'Etiqueta' }], alone: false },
      { key: 'party', label: 'Cliente', description: 'Cliente', options: [{ key: 'meta', type: 'keys', label: 'Datos que se muestran' }], alone: false },
      { key: 'lines', label: 'Partidas', description: 'Tabla', options: [{ key: 'columns', type: 'columns', label: 'Columnas' }, { key: 'secondary', type: 'bool', label: 'Segundo renglón' }], alone: true },
      { key: 'notes', label: 'Notas', description: 'Notas', options: [{ key: 'title', type: 'text', label: 'Título de la sección' }], alone: false },
      { key: 'signature', label: 'Firmas', description: 'Firmas', options: [], alone: false },
    ],
    columns: [{ key: 'sku', label: 'Código' }, { key: 'description', label: 'Descripción' }, { key: 'quantity', label: 'Cant.' }, { key: 'batch', label: 'Lote' }],
    meta: [{ key: 'date', label: 'Fecha de salida' }, { key: 'branch', label: 'Almacén' }],
  },
}

describe('layoutOps', () => {
  it('moves, splits and joins rows keeping spans that add up to 12', () => {
    const moved = moveRow(layout, 3, -1)
    expect(moved.rows[2].cells[0].block).toBe('signature')
    expect(layout.rows[3].cells[0].block).toBe('signature')

    const split = splitRow(layout, 1, 'notes')
    expect(split.rows[1].cells).toEqual([{ block: 'party', span: 6 }, { block: 'notes', span: 6 }])
    expect(setLeftSpan(split, 1, 8).rows[1].cells.map((c) => c.span)).toEqual([8, 4])
    expect(removeCell(split, 1, 1).rows[1].cells).toEqual([{ block: 'party' }])
  })

  it('drops an option when it goes back to the factory value', () => {
    const on = setOption(layout, 1, 0, 'meta', ['date'])
    expect(on.rows[1].cells[0].options).toEqual({ meta: ['date'] })
    expect(setOption(on, 1, 0, 'meta', undefined).rows[1].cells[0].options).toBeUndefined()
  })

  it('writes columns in their shortest form and sums widths', () => {
    expect(compactColumn('sku')).toBe('sku')
    expect(compactColumn('sku', 'Clave', 20)).toEqual({ key: 'sku', label: 'Clave', width: 20 })
    expect(widthTotal(['sku', { key: 'description', width: 60 }, { key: 'quantity', width: 30 }])).toBe(90)
    expect(addRow(layout, 'lines', { columns: ['sku'] }).rows.at(-1)).toEqual({ cells: [{ block: 'lines', options: { columns: ['sku'] } }] })
  })
})

describe('DocumentDesigner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    vi.mocked(documentDesignService.list).mockResolvedValue([{ ...design }])
    vi.mocked(documentDesignService.get).mockResolvedValue(structuredClone(design))
    vi.mocked(documentDesignService.preview).mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }))
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('shows each row with its sections and the factory status', async () => {
    render(<DocumentDesigner />)

    expect(await screen.findByText('Fila 1: Emisor + Título y folio')).toBeInTheDocument()
    expect(screen.getByText('Fila 3: Partidas')).toBeInTheDocument()
    expect(screen.getByText('Diseño de fábrica')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar diseño' })).toBeDisabled()
  })

  it('saves the edited layout and reports success', async () => {
    vi.mocked(documentDesignService.save).mockImplementation(async (_t, l) => ({ layout: l, customized: true, updatedAt: '2026-11-12T18:00:00Z' }))
    render(<DocumentDesigner />)

    fireEvent.click(await screen.findByRole('button', { name: 'Subir fila 4' }))
    expect(screen.getByText('Fila 3: Firmas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar diseño' }))

    await waitFor(() => expect(documentDesignService.save).toHaveBeenCalled())
    const sent = vi.mocked(documentDesignService.save).mock.calls[0][1]
    expect(sent.rows.map((r) => r.cells[0].block)).toEqual(['issuer', 'party', 'signature', 'lines'])
    expect(toast.success).toHaveBeenCalled()
    expect(await screen.findByText('Diseño personalizado')).toBeInTheDocument()
  })

  it('shows the backend validation message in Spanish when saving fails', async () => {
    vi.mocked(documentDesignService.save).mockRejectedValue({
      response: { status: 422, data: { message: 'Fila 4: la sección "Totales" no se usa en Remisión.' } },
    })
    render(<DocumentDesigner />)

    fireEvent.change(await screen.findByLabelText('Sección para la fila nueva'), { target: { value: 'notes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar fila' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar diseño' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Fila 4: la sección "Totales" no se usa en Remisión.')
  })

  it('edits the columns of the items table', async () => {
    render(<DocumentDesigner />)
    const row = await screen.findByTestId('designer-row-2')

    fireEvent.click(within(row).getByRole('button', { name: '+ Lote' }))
    fireEvent.click(within(row).getByRole('button', { name: 'Quitar Código' }))
    fireEvent.change(within(row).getByLabelText('Encabezado de Descripción'), { target: { value: 'Producto' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar diseño' }))

    await waitFor(() => expect(documentDesignService.save).toHaveBeenCalled())
    const sent = vi.mocked(documentDesignService.save).mock.calls[0][1]
    expect(sent.rows[2].cells[0].options?.columns).toEqual([{ key: 'description', label: 'Producto' }, 'quantity', 'batch'])
  })

  it('renders the PDF preview of the draft', async () => {
    render(<DocumentDesigner />)

    expect(await screen.findByTitle('Vista previa del PDF', {}, { timeout: 3000 })).toHaveAttribute('src', 'blob:preview')
    expect(documentDesignService.preview).toHaveBeenCalledWith('remission', layout, 'mono')
  })

  it('changes the colors through the system settings', async () => {
    vi.mocked(documentDesignService.setSetting).mockResolvedValue()
    render(<DocumentDesigner />)

    fireEvent.change(await screen.findByLabelText('Colores'), { target: { value: 'color' } })

    await waitFor(() => expect(documentDesignService.setSetting).toHaveBeenCalledWith('documents.builder.remission_mode', 'color'))
  })
})
