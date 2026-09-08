/**
 * UserForm tests: toggle de visibilidad, validacion en vivo de
 * coincidencia y generador de contrasena segura.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserForm } from '../../components/UserForm'
import { useRoleOptions } from '../../hooks/useRoleOptions'
import { useUserMutations } from '../../hooks/useUsers'

vi.mock('../../hooks/useRoleOptions', () => ({
  useRoleOptions: vi.fn(),
}))
vi.mock('../../hooks/useUsers', () => ({
  useUserMutations: vi.fn(),
}))

describe('UserForm', () => {
  const mockCreateUser = vi.fn()
  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRoleOptions).mockReturnValue({
      roles: [
        { id: '1', name: 'admin' },
        { id: '2', name: 'customer' },
      ],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    })
    vi.mocked(useUserMutations).mockReturnValue({
      createUser: mockCreateUser,
      updateUser: mockUpdateUser,
      removeUser: vi.fn(),
      restoreUser: vi.fn(),
    })
  })

  it('el toggle de visibilidad cambia el type del input de contrasena', () => {
    // Arrange
    render(<UserForm />)
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
    render(<UserForm />)
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
    render(<UserForm />)
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

  it('en edicion muestra el placeholder de password opcional y manda roleIds', async () => {
    // Arrange
    mockUpdateUser.mockResolvedValue({ id: '5' })
    render(
      <UserForm
        user={{
          id: '5',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          status: 'active',
          roles: [{ id: '1', name: 'admin' }],
          emailVerifiedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
          deletedAt: null,
        }}
      />
    )

    // Assert - placeholder de edicion en password y confirmacion
    expect(screen.getAllByPlaceholderText('(Dejar vacío si no cambia)')).toHaveLength(2)
    // Rol actual pre-marcado
    expect(screen.getByLabelText('admin')).toBeChecked()
    expect(screen.getByLabelText('customer')).not.toBeChecked()

    // Act - agregar segundo rol y guardar
    fireEvent.click(screen.getByLabelText('customer'))
    fireEvent.submit(screen.getByRole('button', { name: 'Guardar cambios' }).closest('form') as HTMLFormElement)

    // Assert - multi-rol en el payload, password omitido
    await vi.waitFor(() => expect(mockUpdateUser).toHaveBeenCalledTimes(1))
    expect(mockUpdateUser).toHaveBeenCalledWith('5', expect.objectContaining({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      roleIds: ['1', '2'],
      password: undefined,
    }))
  })
})
