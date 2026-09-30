/**
 * Selector de avatar del perfil (diseno 2026-09-30).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../lib/profileApi', () => ({
  setAvatarPreset: vi.fn(),
  uploadAvatar: vi.fn(),
  removeAvatar: vi.fn(),
}))
vi.mock('swr', () => ({ mutate: vi.fn() }))

import { AvatarPickerModal } from '../../components/AvatarPickerModal'
import { setAvatarPreset, uploadAvatar } from '../../lib/profileApi'
import { avatarSrc, initials, presetNumber } from '../../lib/avatar'

describe('helpers de avatar', () => {
  it('resuelve presets, fotos e iniciales', () => {
    expect(avatarSrc('preset:3')).toBe('/images/avatars/avatar-3.svg')
    expect(avatarSrc('preset:99')).toBeNull()
    expect(avatarSrc('https://api/storage/avatars/1.jpg')).toBe('https://api/storage/avatars/1.jpg')
    expect(avatarSrc(null)).toBeNull()
    expect(presetNumber('preset:5')).toBe(5)
    expect(initials('Gabino Ramirez Soto')).toBe('GS')
    expect(initials('')).toBe('?')
  })
})

describe('AvatarPickerModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('aplica el avatar elegido', async () => {
    vi.mocked(setAvatarPreset).mockResolvedValue({ avatar: 'preset:4' })
    const onApplied = vi.fn()
    const onHide = vi.fn()
    render(<AvatarPickerModal show onHide={onHide} name="Ana" current={null} onApplied={onApplied} />)

    expect(screen.getByText('Editar foto de perfil')).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(8)
    fireEvent.click(screen.getByLabelText('Avatar 4'))
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    await waitFor(() => expect(setAvatarPreset).toHaveBeenCalledWith(4))
    expect(onApplied).toHaveBeenCalledWith('preset:4')
    expect(onHide).toHaveBeenCalled()
  })

  it('rechaza una foto pesada sin llamar al backend', () => {
    render(<AvatarPickerModal show onHide={() => {}} name="Ana" />)
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'yo.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByLabelText('Subir foto'), { target: { files: [big] } })
    expect(screen.getByText(/no puede pesar más de 2 MB/)).toBeTruthy()
    expect(uploadAvatar).not.toHaveBeenCalled()
  })

  it('muestra el error del backend con detalle', async () => {
    vi.mocked(setAvatarPreset).mockRejectedValue({ response: { data: { errors: { preset: ['El avatar elegido no existe.'] } } } })
    render(<AvatarPickerModal show onHide={() => {}} name="Ana" />)
    fireEvent.click(screen.getByLabelText('Avatar 1'))
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    await waitFor(() => expect(screen.getByText('El avatar elegido no existe.')).toBeTruthy())
  })
})
