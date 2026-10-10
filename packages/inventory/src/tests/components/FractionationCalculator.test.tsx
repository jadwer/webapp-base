/**
 * FractionationCalculator (P3 granel): costo origen/destino con unidad,
 * aviso sin costo, sobrante de piezas completas y lote insuficiente.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { FractionationPreview } from '../../types/fractionation'

vi.mock('@lwm/ui', () => ({
  formatCurrency: (v: number) => `$${v.toFixed(4)}`,
  formatQuantity: (v: number) => String(v),
  formatDateOnly: (v: string) => v,
  formatDateTime: (v: string) => v,
  parseDateOnly: (v: string) => Boolean(v),
}))

import { FractionationCalculator } from '../../components/FractionationCalculator'

const preview = (overrides: Partial<FractionationPreview> = {}): FractionationPreview => ({
  source_product: { id: 10, name: 'Alcohol granel', sku: 'ALC-G', unit: { name: 'Litro', code: 'LTR' } },
  destination_product: { id: 20, name: 'Alcohol galón', sku: 'ALC-GAL', unit: { name: 'Pieza', code: 'H87' } },
  source_quantity: 7,
  requested_quantity: 7,
  consumed_quantity: 3.7855,
  leftover_quantity: 3.2145,
  conversion_factor: 0.264172,
  waste_percentage: 0,
  whole_units: true,
  produced_quantity: 1,
  waste_quantity: 0,
  available_stock: 100,
  has_enough_stock: true,
  source_unit_cost: 30,
  destination_unit_cost: 113.565,
  total_cost: 113.565,
  has_cost: true,
  warnings: [],
  ...overrides,
})

describe('FractionationCalculator', () => {
  it('muestra costos con unidad y el sobrante que se queda en el granel', () => {
    render(<FractionationCalculator preview={preview()} isLoading={false} />)

    expect(screen.getByTestId('source-unit-cost')).toHaveTextContent('$30.0000 / Litro')
    expect(screen.getByTestId('destination-unit-cost')).toHaveTextContent('$113.5650 / Pieza')
    expect(screen.getByTestId('consumed-quantity')).toHaveTextContent('3.7855 Litro')
    expect(screen.getByTestId('produced-quantity')).toHaveTextContent('1 Pieza')
    expect(screen.getByText(/3.2145 Litro se quedan en el granel/)).toBeInTheDocument()
    expect(screen.getByText('Solo piezas completas')).toBeInTheDocument()
  })

  it('avisa sin bloquear cuando el origen no tiene costo', () => {
    render(
      <FractionationCalculator
        preview={preview({ has_cost: false, source_unit_cost: 0, destination_unit_cost: 0, total_cost: 0, warnings: ['El producto origen no tiene costo: ...'] })}
        isLoading={false}
      />
    )
    expect(screen.getByText(/entrarán con costo 0/)).toBeInTheDocument()
    // el aviso del backend no se duplica
    expect(screen.queryByText('El producto origen no tiene costo: ...')).not.toBeInTheDocument()
  })

  it('distingue lote insuficiente de stock insuficiente', () => {
    render(<FractionationCalculator preview={preview({ has_enough_stock: false, batch_available: 2 })} isLoading={false} />)
    expect(screen.getByText(/El lote no alcanza/)).toBeInTheDocument()
  })
})
