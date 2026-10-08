import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CampaignsTableSimple } from '../../components/CampaignsTableSimple'
import type { Campaign } from '../../types'

describe('CampaignsTableSimple fechas', () => {
  it('muestra inicio y fin con el dia guardado (Y-m-d e ISO medianoche)', () => {
    const campaign = {
      id: '1',
      name: 'Campana',
      type: 'email',
      status: 'active',
      startDate: '2026-10-25T00:00:00.000000Z',
      endDate: '2026-11-01',
      budget: 0,
      actualCost: 0,
    } as unknown as Campaign
    const { container } = render(<CampaignsTableSimple campaigns={[campaign]} />)
    expect(container.textContent).toContain('25 oct 2026')
    expect(container.textContent).toContain('1 nov 2026')
  })
})
