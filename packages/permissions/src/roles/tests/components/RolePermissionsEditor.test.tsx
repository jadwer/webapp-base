/**
 * RolePermissionsEditor: agrupacion modulo/recurso, toggle maestro con
 * estado indeterminado, busqueda por label y guardado via PATCH de la
 * relationship permissions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RolePermissionsEditor } from '../../components/RolePermissionsEditor'
import { rolesService } from '../../services/rolesService'
import { mockPermission, mockRole } from '../utils/test-utils'
import type { Permission } from '../../types/role'

vi.mock('../../services/rolesService', () => ({
  rolesService: { update: vi.fn() },
}))

const catalogPermissions = (): Permission[] => [
  mockPermission({
    id: 1, name: 'products.index', label: 'Ver lista de productos',
    description: 'Permiso que permite ver la lista de productos',
    module: 'productos', moduleLabel: 'Productos', resource: 'products', resourceLabel: 'Productos',
  }),
  mockPermission({
    id: 2, name: 'products.store', label: 'Agregar producto',
    description: 'Permiso que permite agregar un producto',
    module: 'productos', moduleLabel: 'Productos', resource: 'products', resourceLabel: 'Productos',
  }),
  mockPermission({
    id: 3, name: 'billing.cfdi-invoices.stamp', label: 'Timbrar factura',
    description: 'Permiso que permite timbrar una factura CFDI ante el PAC',
    module: 'facturacion', moduleLabel: 'Facturación CFDI',
    resource: 'billing.cfdi-invoices', resourceLabel: 'Facturas CFDI',
  }),
]

describe('RolePermissionsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(rolesService.update).mockResolvedValue(mockRole())
  })

  it('agrupa por modulo con labels legibles y muestra descripcion, no el string tecnico', () => {
    // Arrange + Act
    render(
      <RolePermissionsEditor
        role={mockRole({ permissions: [] })}
        permissions={catalogPermissions()}
      />
    )

    // Assert - nav de modulos con labels del catalogo
    expect(screen.getByRole('tab', { name: /Productos/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Facturación CFDI/ })).toBeInTheDocument()
    // El modulo activo (primero alfabetico: Facturación CFDI) muestra sus filas
    expect(screen.getByText('Timbrar factura')).toBeInTheDocument()
    expect(screen.getByText('Permiso que permite timbrar una factura CFDI ante el PAC')).toBeInTheDocument()
  })

  it('el toggle maestro del recurso activa y desactiva todo el grupo', () => {
    // Arrange
    render(
      <RolePermissionsEditor
        role={mockRole({ permissions: [] })}
        permissions={catalogPermissions()}
      />
    )
    fireEvent.click(screen.getByRole('tab', { name: /Productos/ }))
    const master = screen.getByLabelText('Activar todos los permisos de Productos')

    // Act - activar todo
    fireEvent.click(master)

    // Assert
    expect(screen.getByRole('switch', { name: /Ver lista de productos/ })).toBeChecked()
    expect(screen.getByRole('switch', { name: /Agregar producto/ })).toBeChecked()

    // Act - desactivar todo
    fireEvent.click(master)
    expect(screen.getByRole('switch', { name: /Ver lista de productos/ })).not.toBeChecked()
  })

  it('el maestro queda indeterminado cuando el grupo esta parcial', () => {
    // Arrange - rol con solo products.index activo
    render(
      <RolePermissionsEditor
        role={mockRole({ permissions: [catalogPermissions()[0]] })}
        permissions={catalogPermissions()}
      />
    )
    fireEvent.click(screen.getByRole('tab', { name: /Productos/ }))

    // Assert
    const master = screen.getByLabelText('Activar todos los permisos de Productos') as HTMLInputElement
    expect(master.indeterminate).toBe(true)
    expect(master.checked).toBe(false)
  })

  it('la busqueda filtra por label en todos los modulos', () => {
    // Arrange
    render(
      <RolePermissionsEditor
        role={mockRole({ permissions: [] })}
        permissions={catalogPermissions()}
      />
    )

    // Act
    fireEvent.change(screen.getByLabelText('Buscar permiso'), { target: { value: 'timbrar' } })

    // Assert - solo la fila de facturacion, aunque el modulo activo era otro
    expect(screen.getByText('Timbrar factura')).toBeInTheDocument()
    expect(screen.queryByText('Agregar producto')).not.toBeInTheDocument()
  })

  it('guardar manda los ids seleccionados via rolesService.update', async () => {
    // Arrange
    const role = mockRole({ id: 7, name: 'ventas', permissions: [] })
    const onSaved = vi.fn()
    render(
      <RolePermissionsEditor role={role} permissions={catalogPermissions()} onSaved={onSaved} />
    )
    fireEvent.click(screen.getByRole('tab', { name: /Productos/ }))
    fireEvent.click(screen.getByRole('switch', { name: /Agregar producto/ }))

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }))

    // Assert
    await waitFor(() => expect(rolesService.update).toHaveBeenCalledTimes(1))
    expect(rolesService.update).toHaveBeenCalledWith(7, expect.objectContaining({
      name: 'ventas',
      permissions: [2],
    }))
    expect(onSaved).toHaveBeenCalledWith([2])
  })

  it('el boton guardar se deshabilita sin cambios pendientes', () => {
    // Arrange + Act
    render(
      <RolePermissionsEditor
        role={mockRole({ permissions: [catalogPermissions()[0]] })}
        permissions={catalogPermissions()}
      />
    )

    // Assert
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeDisabled()
  })
})
