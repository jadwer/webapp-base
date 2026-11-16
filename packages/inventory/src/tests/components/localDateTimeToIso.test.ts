import { describe, it, expect } from 'vitest'
import { localDateTimeToIso } from '../../components/InventoryMovementForm'

describe('localDateTimeToIso', () => {
  it('convierte la hora local del input a ISO con zona (el backend corre en UTC)', () => {
    const local = '2026-11-15T21:43'
    expect(localDateTimeToIso(local)).toBe(new Date(local).toISOString())
    expect(localDateTimeToIso(local).endsWith('Z')).toBe(true)
  })
  it('deja pasar un valor que no es fecha para que el backend lo rechace con su mensaje', () => {
    expect(localDateTimeToIso('no-es-fecha')).toBe('no-es-fecha')
  })
})
