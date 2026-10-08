/**
 * WarehousesTableSimple: tipos del backend en espanol, columna Sucursal
 * condicional y borrado delegado al padre.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WarehousesTableSimple } from '../../components/WarehousesTableSimple'
import { createMockWarehouse } from '../utils/test-utils'

const branch = vi.hoisted(() => ({ multi: false }))

vi.mock('@lwm/auth', () => ({
  useBranchName: () => ({
    multi: branch.multi,
    name: (id?: string | number | null) => (String(id) === '2' ? 'Toluca' : '—'),
  }),
}))

describe('WarehousesTableSimple', () => {
  beforeEach(() => {
    branch.multi = false
  })

  it.each([
    ['main', 'Principal'],
    ['secondary', 'Secundario'],
    ['distribution', 'Distribución'],
    ['returns', 'Devoluciones'],
  ] as const)('muestra el tipo %s como "%s"', (warehouseType, label) => {
    render(
      <WarehousesTableSimple
        warehouses={[createMockWarehouse({ warehouseType })]}
        isLoading={false}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('muestra código, nombre y ciudad', () => {
    render(
      <WarehousesTableSimple
        warehouses={[createMockWarehouse({ code: 'WH-009', name: 'Bodega Norte', city: 'Monterrey' })]}
        isLoading={false}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('WH-009')).toBeInTheDocument()
    expect(screen.getByText('Bodega Norte')).toBeInTheDocument()
    expect(screen.getByText('Monterrey')).toBeInTheDocument()
  })

  it('oculta la columna Sucursal con una sola sucursal', () => {
    render(
      <WarehousesTableSimple
        warehouses={[createMockWarehouse({ branchId: 2 })]}
        isLoading={false}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByRole('columnheader', { name: 'Sucursal' })).not.toBeInTheDocument()
  })

  it('muestra la sucursal con varias sucursales', () => {
    branch.multi = true

    render(
      <WarehousesTableSimple
        warehouses={[createMockWarehouse({ branchId: 2 })]}
        isLoading={false}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Sucursal' })).toBeInTheDocument()
    expect(screen.getByText('Toluca')).toBeInTheDocument()
  })

  it('delega el borrado al padre con el almacén de la fila', () => {
    const onDelete = vi.fn()
    const warehouse = createMockWarehouse({ id: '5' })

    render(<WarehousesTableSimple warehouses={[warehouse]} isLoading={false} onDelete={onDelete} />)
    fireEvent.click(screen.getByTitle('Eliminar'))

    expect(onDelete).toHaveBeenCalledWith(warehouse)
  })

  it('muestra el estado vacío y el de carga', () => {
    const { rerender } = render(<WarehousesTableSimple warehouses={[]} isLoading={false} onDelete={vi.fn()} />)
    expect(screen.getByText('No hay almacenes')).toBeInTheDocument()

    rerender(<WarehousesTableSimple warehouses={[]} isLoading onDelete={vi.fn()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
