import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ContactDocuments } from '../../components/ContactDocuments'
import type { ContactDocument } from '../../types'

const baseDoc = {
  id: '1',
  contactId: 1,
  documentType: 'other',
  fileName: 'acta.pdf',
  originalFilename: 'acta.pdf',
  fileSize: 1024,
  createdAt: '2026-10-01T15:00:00.000000Z',
  verifiedAt: null,
  notes: null,
}

const renderDocs = (doc: Partial<ContactDocument>) =>
  render(
    <ContactDocuments
      documents={[{ ...baseDoc, ...doc } as unknown as ContactDocument]}
      onUploadDocument={vi.fn()}
      onDeleteDocument={vi.fn()}
      onDownloadDocument={vi.fn()}
    />
  )

describe('ContactDocuments fechas', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('vencimiento ISO medianoche se muestra con su dia', () => {
    const { container } = renderDocs({ expiresAt: '2026-10-25T00:00:00.000000Z' })
    expect(container.textContent).toContain('Vence: 25/10/2026')
  })

  it('un documento que vence hoy no se marca vencido', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 25, 20, 0))
    const { container } = renderDocs({ expiresAt: '2026-10-25T00:00:00.000000Z' })
    expect(container.textContent).not.toContain('Vencido')
    expect(container.textContent).toContain('Pendiente')
  })
})
