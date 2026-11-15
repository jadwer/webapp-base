import { describe, it, expect } from 'vitest'
import { etaStatus } from '../../utils/eta'

describe('etaStatus (ETA de la orden de compra)', () => {
  const today = '2026-11-15'

  it('marca atrasada, llega hoy y en tiempo contra la fecha de hoy', () => {
    expect(etaStatus('2026-11-12', 'approved', today)).toEqual({ tone: 'late', days: 3, label: 'Atrasada 3 días' })
    expect(etaStatus('2026-11-14', 'pending', today).label).toBe('Atrasada 1 día')
    expect(etaStatus('2026-11-15', 'approved', today)).toEqual({ tone: 'today', days: 0, label: 'Llega hoy' })
    expect(etaStatus('2026-11-16', 'approved', today).label).toBe('Falta 1 día')
    expect(etaStatus('2026-12-01', 'approved', today)).toEqual({ tone: 'ok', days: 16, label: 'Faltan 16 días' })
  })

  it('sin fecha lo dice; recibida o cancelada ya no cuenta', () => {
    expect(etaStatus(null, 'approved', today).tone).toBe('none')
    expect(etaStatus('2026-11-01', 'received', today).tone).toBe('closed')
    expect(etaStatus('2026-11-01', 'cancelled', today).tone).toBe('closed')
  })

  it('cruza fin de mes y de año sin desfase', () => {
    expect(etaStatus('2027-01-02', 'approved', '2026-12-31').days).toBe(2)
  })
})
