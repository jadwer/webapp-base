/**
 * FractionationDetail (P3 granel): pide lotes y movimientos, muestra costo
 * y enlaza los lotes origen y destino.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mocks = vi.hoisted(() => ({ useFractionation: vi.fn() }))

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))
vi.mock('@lwm/ui', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  StatusBadge: () => <span />,
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatQuantity: (v: number) => String(v),
  formatDateOnly: (v: string) => v,
  formatDateTime: (v: string) => v,
  parseDateOnly: (v: string) => Boolean(v),
}))
vi.mock('../../hooks/useFractionations', () => ({ useFractionation: mocks.useFractionation }))

import { FractionationDetail, FRACTIONATION_DETAIL_INCLUDE } from '../../components/FractionationDetail'

describe('FractionationDetail', () => {
  it('muestra costo, lotes con enlace y movimientos', () => {
    mocks.useFractionation.mockReturnValue({
      isLoading: false,
      error: undefined,
      fractionation: {
        id: '9', folioNumber: 'FRAC-26-000009', status: 'completed',
        sourceProductId: 10, destinationProductId: 20, warehouseId: 3, userId: 1,
        sourceQuantity: '10.0000', requestedQuantity: '10.0000', producedQuantity: '392.0000',
        wastePercentage: 2, wasteQuantity: '8.0000', conversionFactorUsed: 40,
        sourceUnitCost: 30, destinationUnitCost: 0.765306, totalCost: 300,
        exitMovementId: 101, entryMovementId: 102, createdAt: '', updatedAt: '',
        sourceBatch: { id: '5', batchNumber: 'LOTE-MP-1', lotNumber: 'MP-7781', expirationDate: '2027-05-31' },
        destinationBatch: { id: '6', batchNumber: 'FRAC-26-000009', lotNumber: 'MP-7781', expirationDate: '2027-05-31' },
        exitMovement: { id: '101', movementType: 'exit', quantity: 10, unitCost: 30, totalValue: 300 },
        entryMovement: { id: '102', movementType: 'entry', quantity: 392, unitCost: 0.7653, totalValue: 299.99 },
      },
    })

    render(<FractionationDetail fractionationId="9" />)

    expect(mocks.useFractionation).toHaveBeenCalledWith('9', FRACTIONATION_DETAIL_INCLUDE)
    expect(FRACTIONATION_DETAIL_INCLUDE).toEqual(expect.arrayContaining(['sourceBatch', 'destinationBatch', 'exitMovement', 'entryMovement']))
    expect(screen.getByText('$300.00', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LOTE-MP-1' })).toHaveAttribute('href', '/dashboard/inventory/product-batch/5')
    expect(screen.getByRole('link', { name: 'FRAC-26-000009' })).toHaveAttribute('href', '/dashboard/inventory/product-batch/6')
    expect(screen.getByRole('link', { name: '#101' })).toHaveAttribute('href', '/dashboard/inventory/movements/101')
    expect(screen.getByText('Entrada (destino)')).toBeInTheDocument()
  })
})
