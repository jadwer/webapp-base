import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { JournalEntriesTableSimple } from '../../components/JournalEntriesTableSimple'
import type { JournalEntry } from '../../types'

describe('JournalEntriesTableSimple fechas', () => {
  it('muestra la fecha del asiento sin correrla un dia (ISO medianoche)', () => {
    const entry = {
      id: '1',
      number: 'AS-1',
      date: '2026-10-25T00:00:00.000000Z',
      description: 'Asiento de prueba',
      status: 'draft',
    } as unknown as JournalEntry
    const { container } = render(<JournalEntriesTableSimple journalEntries={[entry]} />)
    expect(container.textContent).toContain('25/10/2026')
    expect(container.textContent).not.toContain('24/10/2026')
  })
})
