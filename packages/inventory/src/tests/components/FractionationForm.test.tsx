/**
 * FractionationForm (P3 granel): la clave de idempotencia se genera al abrir
 * y se reusa en cada reintento; el lote FEFO llega preseleccionado y viaja en
 * el payload; los errores del backend se muestran con su detalle.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { FractionationPreview } from '../../types/fractionation'

const mocks = vi.hoisted(() => ({
  calculate: vi.fn(),
  execute: vi.fn(),
  push: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))
vi.mock('@lwm/ui', () => ({
  toast: mocks.toast,
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  DetailSection: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatQuantity: (v: number) => String(v),
  formatDateOnly: (v: string) => v,
  formatDateTime: (v: string) => v,
  parseDateOnly: (v: string) => Boolean(v),
}))
vi.mock('@lwm/products', () => ({
  ProductSearchSelect: ({ id, onChange }: { id: string; onChange: (id: string) => void }) => (
    <input data-testid={id} onChange={(e) => onChange(e.target.value)} />
  ),
}))
vi.mock('../../hooks/useFractionations', () => ({
  useFractionationMutations: () => ({ calculate: mocks.calculate, execute: mocks.execute }),
}))
vi.mock('../../hooks/useProductConversions', () => ({
  useConversionsBySourceProduct: (id: string | null) => ({
    conversions: id
      ? [{ destinationProductId: 20, conversionFactor: 40, wastePercentage: 2, wholeUnits: false, destinationProduct: { name: 'Alcohol 25 ml', sku: 'ALC-25' } }]
      : [],
  }),
}))
vi.mock('../../hooks', () => ({
  useWarehouses: () => ({ warehouses: [{ id: '3', name: 'Almacén Centro', code: 'AC' }], isLoading: false }),
}))

import { FractionationForm } from '../../components/FractionationForm'

const basePreview = (overrides: Partial<FractionationPreview> = {}): FractionationPreview => ({
  source_product: { id: 10, name: 'Alcohol granel', sku: 'ALC-G', unit: { name: 'Litro', code: 'LTR' } },
  destination_product: { id: 20, name: 'Alcohol 25 ml', sku: 'ALC-25', unit: { name: 'Pieza', code: 'H87' } },
  source_quantity: 10,
  requested_quantity: 10,
  consumed_quantity: 10,
  leftover_quantity: 0,
  conversion_factor: 40,
  waste_percentage: 2,
  produced_quantity: 392,
  waste_quantity: 8,
  available_stock: 100,
  has_enough_stock: true,
  source_unit_cost: 30,
  destination_unit_cost: 0.765306,
  total_cost: 300,
  has_cost: true,
  location_required: false,
  locations: [],
  batch_required: false,
  batches: [],
  can_execute: true,
  warnings: [],
  ...overrides,
})

const fillForm = () => {
  fireEvent.change(screen.getByTestId('fractionation-source'), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText(/Almacén/), { target: { value: '3' } })
  fireEvent.change(screen.getByLabelText(/Cantidad a fraccionar/), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText(/Producto destino/), { target: { value: '20' } })
}

const executeButton = () => screen.getByRole('button', { name: /Ejecutar fraccionamiento/ })

describe('FractionationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera la clave al abrir y la reusa al reintentar', async () => {
    mocks.calculate.mockResolvedValue({ data: basePreview() })
    mocks.execute
      .mockRejectedValueOnce({ message: 'Network Error' })
      .mockResolvedValueOnce({ data: { id: 7 }, meta: { replayed: true, warnings: [] }, message: 'Ya se habia ejecutado' })

    render(<FractionationForm />)
    fillForm()
    await waitFor(() => expect(executeButton()).not.toBeDisabled(), { timeout: 2000 })

    fireEvent.click(executeButton())
    await waitFor(() => expect(mocks.toast.error).toHaveBeenCalledWith('Network Error'))
    fireEvent.click(executeButton())
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard/inventory/fraccionamiento/7'))

    const firstKey = mocks.execute.mock.calls[0][0].idempotency_key
    const secondKey = mocks.execute.mock.calls[1][0].idempotency_key
    expect(firstKey).toMatch(/^[A-Za-z0-9_-]{8,64}$/)
    expect(secondKey).toBe(firstKey)
    expect(mocks.toast.info).toHaveBeenCalledWith('Ya se habia ejecutado')
  })

  it('preselecciona el lote FEFO y lo manda al calcular y al ejecutar', async () => {
    const batches = [
      { id: 5, batch_number: 'L-OLD', lot_number: 'MP-1', expiration_date: '2026-01-01', warehouse_location_id: null, available_quantity: 50, unit_cost: 30, is_expired: true, is_expiring_soon: false },
      { id: 6, batch_number: 'L-FEFO', lot_number: 'MP-2', expiration_date: '2027-01-01', warehouse_location_id: null, available_quantity: 50, unit_cost: 30, is_expired: false, is_expiring_soon: false },
    ]
    mocks.calculate.mockResolvedValue({
      data: basePreview({ batch_required: true, batches, suggested_batch_id: 6, product_batch_id: 6, batch_available: 50 }),
    })
    mocks.execute.mockResolvedValue({ data: { id: 8 }, meta: { replayed: false, warnings: [] }, message: 'ok' })

    render(<FractionationForm />)
    fillForm()

    const select = await screen.findByLabelText(/Lote de origen/, {}, { timeout: 2000 }) as HTMLSelectElement
    await waitFor(() => expect(select.value).toBe('6'))
    expect(screen.getByRole('option', { name: /L-FEFO.*sugerido FEFO/ })).toBeInTheDocument()
    expect((screen.getByRole('option', { name: /L-OLD/ }) as HTMLOptionElement).disabled).toBe(true)
    await waitFor(() => expect(mocks.calculate).toHaveBeenLastCalledWith(expect.objectContaining({ product_batch_id: 6 })), { timeout: 2000 })

    await waitFor(() => expect(executeButton()).not.toBeDisabled())
    fireEvent.click(executeButton())
    await waitFor(() => expect(mocks.execute).toHaveBeenCalledWith(expect.objectContaining({ product_batch_id: 6 })))
  })

  it('D10: explica por que un lote no se puede fraccionar (cuarentena, caducado)', async () => {
    const batches = [
      { id: 5, batch_number: 'L-OLD', lot_number: null, expiration_date: '2026-01-05', warehouse_location_id: null, available_quantity: 50, unit_cost: 30, is_expired: true, is_expiring_soon: false },
      { id: 7, batch_number: 'L-CUAR', lot_number: null, expiration_date: '2027-01-01', warehouse_location_id: null, available_quantity: 50, unit_cost: 30, is_expired: false, is_expiring_soon: false, quality_status: 'quarantine', is_usable: false, unavailable_reason: 'el lote está en cuarentena' },
      { id: 6, batch_number: 'L-OK', lot_number: null, expiration_date: '2027-06-01', warehouse_location_id: null, available_quantity: 50, unit_cost: 30, is_expired: false, is_expiring_soon: false, quality_status: 'passed', is_usable: true, unavailable_reason: null },
    ]
    mocks.calculate.mockResolvedValue({
      data: basePreview({ batch_required: true, batches, suggested_batch_id: 6, product_batch_id: 6, batch_available: 50 }),
    })

    render(<FractionationForm />)
    fillForm()

    await screen.findByLabelText(/Lote de origen/, {}, { timeout: 2000 })
    const quarantine = screen.getByRole('option', { name: /L-CUAR.*NO DISPONIBLE: el lote está en cuarentena/ }) as HTMLOptionElement
    expect(quarantine.disabled).toBe(true)
    // formatDateOnly esta mockeado (devuelve Y-m-d); el formato dd/mm/aaaa se prueba en utils
    const expired = screen.getByRole('option', { name: /L-OLD.*NO DISPONIBLE: caducado el 2026-01-05/ }) as HTMLOptionElement
    expect(expired.disabled).toBe(true)
    expect((screen.getByRole('option', { name: /L-OK/ }) as HTMLOptionElement).disabled).toBe(false)
    expect(screen.getByTestId('fractionation-blocked-batches')).toHaveTextContent('L-CUAR (el lote está en cuarentena)')
  })

  it('lista deshabilitados los lotes retirados o en cuarentena por estado aunque el lote no sea obligatorio', async () => {
    const batches = [
      { id: 8, batch_number: 'L-RET', lot_number: null, expiration_date: null, warehouse_location_id: null, available_quantity: 30, unit_cost: 30, is_expired: false, is_expiring_soon: false, quality_status: 'passed', is_usable: false, unavailable_reason: 'el lote fue retirado' },
      { id: 9, batch_number: 'L-EST', lot_number: null, expiration_date: '2027-01-01', warehouse_location_id: null, available_quantity: 40, unit_cost: 30, is_expired: false, is_expiring_soon: false, quality_status: 'passed', is_usable: false, unavailable_reason: 'el lote está en cuarentena' },
    ]
    mocks.calculate.mockResolvedValue({
      data: basePreview({ batch_required: false, batches, suggested_batch_id: null, product_batch_id: null }),
    })

    render(<FractionationForm />)
    fillForm()

    await screen.findByLabelText(/Lote de origen/, {}, { timeout: 2000 })
    expect((screen.getByRole('option', { name: /L-RET.*NO DISPONIBLE: el lote fue retirado/ }) as HTMLOptionElement).disabled).toBe(true)
    expect((screen.getByRole('option', { name: /L-EST.*NO DISPONIBLE: el lote está en cuarentena/ }) as HTMLOptionElement).disabled).toBe(true)
    expect(screen.getByTestId('fractionation-blocked-batches')).toHaveTextContent('L-RET (el lote fue retirado)')
  })

  it('pide la ubicacion cuando el origen esta en varias', async () => {
    mocks.calculate.mockResolvedValue({
      data: basePreview({
        location_required: true,
        can_execute: false,
        locations: [
          { warehouse_location_id: 1, name: 'Rack A', code: 'A', quantity: 30, available: 30 },
          { warehouse_location_id: 2, name: 'Rack B', code: 'B', quantity: 50, available: 50 },
        ],
      }),
    })

    render(<FractionationForm />)
    fillForm()

    expect(await screen.findByLabelText(/Ubicación/, {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByText(/está en varias ubicaciones/)).toBeInTheDocument()
    expect(executeButton()).toBeDisabled()
  })

  it('muestra el detalle del error del backend', async () => {
    mocks.calculate.mockResolvedValue({ data: basePreview() })
    mocks.execute.mockRejectedValue({
      message: 'Request failed with status code 422',
      response: { status: 422, data: { message: 'Stock insuficiente.', errors: [{ status: '422', code: 'insufficient_stock', title: 'Stock insuficiente', detail: 'Stock insuficiente. Disponible: 2 (existencia 10, reservado 8); requerido: 5.' }] } },
    })

    render(<FractionationForm />)
    fillForm()
    await waitFor(() => expect(executeButton()).not.toBeDisabled(), { timeout: 2000 })
    fireEvent.click(executeButton())

    expect(await screen.findByText(/reservado 8/)).toBeInTheDocument()
    expect(screen.queryByText(/status code 422/)).not.toBeInTheDocument()
  })
})
