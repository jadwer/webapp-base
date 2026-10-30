/**
 * ProductConversionForm (P3 granel): unidad de cada producto, ayudante
 * "contenido por pieza" que calcula el factor y casilla de piezas completas.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  createConversion: vi.fn(),
  updateConversion: vi.fn(),
  push: vi.fn(),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@lwm/ui', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  DetailSection: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}))
vi.mock('@lwm/products', () => ({
  ProductSearchSelect: ({ id, onChange }: { id: string; onChange: (id: string) => void }) => (
    <input data-testid={id} onChange={(e) => onChange(e.target.value)} />
  ),
}))
vi.mock('../../hooks/useProductConversions', () => ({
  useProductConversion: () => ({ conversion: undefined, isLoading: false, error: undefined }),
  useProductConversionsMutations: () => ({ createConversion: mocks.createConversion, updateConversion: mocks.updateConversion }),
}))
vi.mock('../../hooks/useProductUnit', () => ({
  useProductUnit: (id: string | null) => ({
    unit: id === '10' ? { name: 'Litro', code: 'LTR' } : id === '20' ? { name: 'Pieza', code: 'H87' } : null,
  }),
}))

import { ProductConversionForm } from '../../components/ProductConversionForm'

describe('ProductConversionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createConversion.mockResolvedValue({})
  })

  it('muestra la unidad de cada producto y calcula el factor por contenido', async () => {
    render(<ProductConversionForm />)
    fireEvent.change(screen.getByTestId('conversion-source'), { target: { value: '10' } })
    fireEvent.change(screen.getByTestId('conversion-destination'), { target: { value: '20' } })

    expect(await screen.findByTestId('source-unit')).toHaveTextContent('Litro (LTR)')
    expect(screen.getByTestId('destination-unit')).toHaveTextContent('Pieza (H87)')

    fireEvent.change(screen.getByLabelText('Contenido por pieza'), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText('Unidad del contenido'), { target: { value: 'MLT' } })
    fireEvent.click(screen.getByRole('button', { name: 'Usar factor 40' }))

    expect((screen.getByLabelText(/Factor de conversión/) as HTMLInputElement).value).toBe('40')
    expect(screen.getByText(/1 Litro = 40 Pieza/)).toBeInTheDocument()
  })

  it('captura inversa: litros por galon da 0.264172', () => {
    render(<ProductConversionForm />)
    fireEvent.change(screen.getByTestId('conversion-source'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Contenido por pieza'), { target: { value: '3.785411784' } })
    fireEvent.click(screen.getByRole('button', { name: 'Usar factor 0.264172' }))
    expect((screen.getByLabelText(/Factor de conversión/) as HTMLInputElement).value).toBe('0.264172')
  })

  it('manda piezas completas en el alta y rechaza más de 6 decimales', async () => {
    render(<ProductConversionForm />)
    fireEvent.change(screen.getByTestId('conversion-source'), { target: { value: '10' } })
    fireEvent.change(screen.getByTestId('conversion-destination'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText(/Factor de conversión/), { target: { value: '0.2641721' } })
    fireEvent.click(screen.getByLabelText('Solo piezas completas'))
    fireEvent.click(screen.getByRole('button', { name: /Crear conversión/ }))

    expect(await screen.findByText('El factor de conversión admite hasta 6 decimales')).toBeInTheDocument()
    expect(mocks.createConversion).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText(/Factor de conversión/), { target: { value: '0.264172' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear conversión/ }))
    await waitFor(() => expect(mocks.createConversion).toHaveBeenCalledWith(expect.objectContaining({
      conversionFactor: 0.264172,
      wholeUnits: true,
    })))
  })
})
