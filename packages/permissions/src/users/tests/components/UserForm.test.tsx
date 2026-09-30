/**
 * UserForm tests: toggle de visibilidad, validacion en vivo de
 * coincidencia, generador de contrasena y pestana de permisos con
 * plantilla (rol = plantilla, 2026-09-24).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import React from 'react'
import { UserForm } from '../../components/UserForm'
import { useUserMutations } from '../../hooks/useUsers'
import { useRoles } from '../../../roles/hooks/useRoles'
import { usePermissions } from '../../../roles/hooks/usePermissions'
import { useBranches } from '@lwm/auth'
import { accessService } from '../../services/accessService'

vi.mock('@lwm/auth', () => ({ useBranches: vi.fn(), axiosClient: {} }))
vi.mock('../../hooks/useUsers', () => ({ useUserMutations: vi.fn() }))
vi.mock('../../../roles/hooks/useRoles', () => ({ useRoles: vi.fn() }))
vi.mock('../../../roles/hooks/usePermissions', () => ({ usePermissions: vi.fn() }))

vi.mock('../../services/accessService', async (orig) => ({
  ...(await orig<typeof import('../../services/accessService')>()),
  accessService: { get: vi.fn(), put: vi.fn() },
}))

const perm = (id: number, name: string) => ({ id, name, guard_name: 'api', created_at: '', updated_at: '' })
const PERMS = [perm(1, 'quotes.index'), perm(2, 'quotes.store'), perm(3, 'quotes.update'), perm(4, 'contacts.index')]

const renderForm = (props: React.ComponentProps<typeof UserForm> = {}) =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <UserForm {...props} />
    </SWRConfig>
  )

describe('UserForm', () => {
  const mockCreateUser = vi.fn()
  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRoles).mockReturnValue({
      roles: [
        { id: 10, name: 'admin', guard_name: 'api', permissions: PERMS, created_at: '', updated_at: '' },
        { id: 11, name: 'ventas', guard_name: 'api', permissions: [PERMS[0], PERMS[1], PERMS[2]], created_at: '', updated_at: '' },
      ],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    } as never)
    vi.mocked(usePermissions).mockReturnValue({ permissions: PERMS, isLoading: false, error: undefined, mutate: vi.fn() } as never)
    vi.mocked(useBranches).mockReturnValue({ branches: [], isLoading: false, error: undefined, mutate: vi.fn() } as never)
    vi.mocked(useUserMutations).mockReturnValue({
      createUser: mockCreateUser,
      updateUser: mockUpdateUser,
      removeUser: vi.fn(),
      restoreUser: vi.fn(),
    })
  })

  it('el toggle de visibilidad cambia el type del input de contrasena', () => {
    // Arrange
    renderForm()
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement
    const toggleButtons = screen.getAllByLabelText('Mostrar contraseña')

    // Assert - oculto por defecto
    expect(passwordInput.type).toBe('password')

    // Act - mostrar
    fireEvent.click(toggleButtons[0])

    // Assert
    expect(passwordInput.type).toBe('text')
    expect(screen.getAllByLabelText('Ocultar contraseña')).toHaveLength(1)

    // Act - ocultar de nuevo
    fireEvent.click(screen.getByLabelText('Ocultar contraseña'))
    expect(passwordInput.type).toBe('password')
  })

  it('muestra error en vivo y bloquea el submit cuando la confirmacion no coincide', () => {
    // Arrange
    renderForm()
    const passwordInput = screen.getByLabelText('Contraseña')
    const confirmationInput = screen.getByLabelText('Confirmar contraseña')

    // Act
    fireEvent.change(passwordInput, { target: { value: 'Secreta123!' } })
    fireEvent.change(confirmationInput, { target: { value: 'Otra456?' } })

    // Assert - mensaje visible y boton bloqueado
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    const submitButton = screen.getByRole('button', { name: 'Crear usuario' })
    expect(submitButton).toBeDisabled()

    // Act - intentar submit de todos modos
    fireEvent.submit(submitButton.closest('form') as HTMLFormElement)

    // Assert - no viaja nada al backend
    expect(mockCreateUser).not.toHaveBeenCalled()

    // Act - corregir la confirmacion
    fireEvent.change(confirmationInput, { target: { value: 'Secreta123!' } })

    // Assert - error desaparece y boton se habilita
    expect(screen.queryByText('Las contraseñas no coinciden.')).not.toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })

  it('el generador llena ambos campos con la misma contrasena de 16 y la muestra en claro', () => {
    // Arrange
    renderForm()
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement
    const confirmationInput = screen.getByLabelText('Confirmar contraseña') as HTMLInputElement

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Generar contraseña segura/ }))

    // Assert
    expect(passwordInput.value).toHaveLength(16)
    expect(confirmationInput.value).toBe(passwordInput.value)
    // Al menos una mayuscula, una minuscula, un digito y un simbolo
    expect(passwordInput.value).toMatch(/[A-Z]/)
    expect(passwordInput.value).toMatch(/[a-z]/)
    expect(passwordInput.value).toMatch(/[0-9]/)
    expect(passwordInput.value).toMatch(/[^A-Za-z0-9]/)
    // Visible en claro para copiarla
    expect(passwordInput.type).toBe('text')
    expect(confirmationInput.type).toBe('text')
  })

  it('la plantilla precarga sus permisos, se ajustan y se guardan como acceso del usuario', async () => {
    mockCreateUser.mockResolvedValue({ id: '42' })
    vi.mocked(accessService.put).mockResolvedValue({} as never)
    renderForm()

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Secreta123!' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Secreta123!' } })

    fireEvent.click(screen.getByRole('tab', { name: /Permisos/ }))
    // "admin" es rol de sistema: no aparece como plantilla
    const templateSelect = screen.getByLabelText('Plantilla de permisos') as HTMLSelectElement
    expect([...templateSelect.options].map((o) => o.value)).toEqual(['', 'ventas'])
    fireEvent.change(templateSelect, { target: { value: 'ventas' } })

    // Quitar quotes.update (id 3) y agregar contacts.index (id 4)
    fireEvent.click(screen.getByLabelText('quotes.update', { selector: 'input' }))
    fireEvent.click(screen.getByLabelText('contacts.index', { selector: 'input' }))

    fireEvent.submit(screen.getByRole('button', { name: 'Crear usuario' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(accessService.put).toHaveBeenCalledTimes(1))
    expect(mockCreateUser).toHaveBeenCalledWith(expect.not.objectContaining({ roleIds: expect.anything() }))
    const [userId, payload] = vi.mocked(accessService.put).mock.calls[0]
    expect(userId).toBe('42')
    expect(payload.template).toBe('ventas')
    expect(payload.systemRoles).toEqual([])
    expect(payload.permissionIds).toEqual(expect.arrayContaining([1, 2]))
    expect(payload.permissionIds).not.toContain(3)
  })

  it('en edicion arranca con los permisos efectivos del usuario y placeholder de password opcional', async () => {
    mockUpdateUser.mockResolvedValue({ id: '5' })
    vi.mocked(accessService.get).mockResolvedValue({
      userId: '5',
      systemRoles: [],
      templateRoles: ['ventas'],
      permissionTemplate: null,
      effectivePermissionIds: [1, 4],
      directPermissionIds: [],
    })
    vi.mocked(accessService.put).mockResolvedValue({} as never)

    renderForm({
      user: {
        id: '5',
        name: 'Ana Pérez',
        email: 'ana@example.com',
        status: 'active',
        roles: [{ id: '11', name: 'ventas' }],
        branchId: null,
        branchIds: [],
        emailVerifiedAt: null,
        createdAt: '2026-01-01',
        deletedAt: null,
      },
    })

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('placeholder', '(Dejar vacío si no cambia)')
    const submit = screen.getByRole('button', { name: 'Guardar cambios' })
    await waitFor(() => expect(submit).not.toBeDisabled())

    fireEvent.submit(submit.closest('form') as HTMLFormElement)
    await waitFor(() => expect(accessService.put).toHaveBeenCalledTimes(1))
    const [, payload] = vi.mocked(accessService.put).mock.calls[0]
    expect(payload.template).toBe('ventas')
    expect(payload.permissionIds).toEqual([1, 4])
  })

  it('muestra el detalle cuando el backend rechaza el acceso', async () => {
    mockCreateUser.mockResolvedValue({ id: '42' })
    vi.mocked(accessService.put).mockRejectedValue({
      response: { status: 422, data: { errors: { systemRoles: ['Solo un usuario god puede otorgar o retirar el rol god.'] } } },
    })
    renderForm()
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Secreta123!' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Secreta123!' } })

    fireEvent.submit(screen.getByRole('button', { name: 'Crear usuario' }).closest('form') as HTMLFormElement)

    expect(await screen.findByText('Solo un usuario god puede otorgar o retirar el rol god.')).toBeInTheDocument()
  })
})
