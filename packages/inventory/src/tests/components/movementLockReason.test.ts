import { describe, it, expect } from 'vitest'
import { movementLockReason } from '../../components/MovementsListPage'

describe('movementLockReason', () => {
  it('bloquea un movimiento completado con el motivo en espanol', () => {
    expect(movementLockReason('completed')).toBe('Un movimiento completado no se edita; corrige con un ajuste.')
  })
  it('deja editar pendientes y cancelados, como el autorizador del backend', () => {
    expect(movementLockReason('pending')).toBeNull()
    expect(movementLockReason('cancelled')).toBeNull()
    expect(movementLockReason(undefined)).toBeNull()
  })
})
