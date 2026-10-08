/**
 * StockTableSimple: estados del backend en espanol, columna Sucursal solo
 * con mas de una sucursal y enlace Ajustar prellenado.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { StockTableSimple, stockAdjustHref } from '../../components/StockTableSimple'
import { createMockStock, createMockWarehouse } from '../utils/test-utils'
import type { Stock } from '../../types'

const branch = vi.hoisted(() => ({ multi: false }))

vi.mock('@lwm/auth', () => ({
  useBranchName: () => ({
    multi: branch.multi,
    name: (id?: string | number | null) => (String(id) === '2' ? 'Toluca' : '—'),
  }),
}))

const stockWith = (overrides: Partial<Stock> = {}): Stock =>
  createMockStock({
    product: { id: '7', type: 'products', name: 'Ácido cítrico', sku: 'AC-01', price: 0, cost: 0 },
    warehouse: createMockWarehouse({ id: '3', name: 'Almacén Centro', branchId: 2 }),
    ...overrides,
  })

describe('StockTableSimple', () => {
  beforeEach(() => {
    branch.multi = false
  })

  it.each([
    ['active', 'Activo'],
    ['inactive', 'Inactivo'],
    ['quarantine', 'Cuarentena'],
    ['damaged', 'Dañado'],
  ])('muestra el estado %s como "%s"', (status, label) => {
    // Arrange / Act
    render(<StockTableSimple stock={[stockWith({ id: '1', status })]} />)

    // Assert
    const row = screen.getAllByRole('row')[1]
    expect(within(row).getByText(label)).toBeInTheDocument()
  })

  it('no confunde active con inactivo (bug del reporte E2E)', () => {
    render(<StockTableSimple stock={[stockWith({ status: 'active' })]} />)

    expect(screen.getByText('Activo')).toHaveClass('bg-success')
    expect(screen.queryByText('Inactivo')).not.toBeInTheDocument()
  })

  it('oculta la columna Sucursal con una sola sucursal', () => {
    render(<StockTableSimple stock={[stockWith()]} />)

    expect(screen.queryByRole('columnheader', { name: 'Sucursal' })).not.toBeInTheDocument()
    expect(screen.queryByText('Toluca')).not.toBeInTheDocument()
  })

  it('muestra la columna Sucursal con varias sucursales', () => {
    branch.multi = true

    render(<StockTableSimple stock={[stockWith()]} />)

    expect(screen.getByRole('columnheader', { name: 'Sucursal' })).toBeInTheDocument()
    expect(screen.getByText('Toluca')).toBeInTheDocument()
  })

  it('acepta cantidades decimales como string del backend', () => {
    render(
      <StockTableSimple
        stock={[stockWith({ quantity: '12.5000' as unknown as number, reservedQuantity: '0.0000' as unknown as number })]}
      />,
    )

    expect(screen.getByText('12.5')).toBeInTheDocument()
    expect(screen.queryByText(/reservado/)).not.toBeInTheDocument()
  })

  it('Ajustar abre el formulario de movimiento como ajuste prellenado', () => {
    const item = stockWith({ location: { id: '9' } as Stock['location'] })

    render(<StockTableSimple stock={[item]} />)

    const link = screen.getByTitle('Ajustar')
    expect(link).toHaveAttribute('href', stockAdjustHref(item))
    expect(stockAdjustHref(item)).toBe(
      '/dashboard/inventory/movements/create?type=adjustment&productId=7&warehouseId=3&locationId=9',
    )
  })

  it('los enlaces de ver no abren otra pestaña', () => {
    render(<StockTableSimple stock={[stockWith()]} />)

    expect(screen.getByTitle('Ver detalle')).not.toHaveAttribute('target')
  })

  it('muestra el estado vacío sin registros', () => {
    render(<StockTableSimple stock={[]} />)

    expect(screen.getByText('No hay registros de stock')).toBeInTheDocument()
  })
})
