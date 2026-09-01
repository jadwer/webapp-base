/**
 * Billing Module - Document Legends Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import { documentLegendsService } from '../../services/documentLegendsService'

vi.mock('../../lib/axiosClient')

const mockedAxios = vi.mocked(axiosClient, true)

const legendResource = {
  id: '1',
  type: 'document-legends',
  attributes: {
    documentType: 'quote',
    body: 'Cotizacion {folio} valida hasta {fecha_vencimiento}.',
    isActive: true,
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z',
  },
}

describe('documentLegendsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll parses JSON:API resources into camelCase legends', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [legendResource] } })

    const legends = await documentLegendsService.getAll()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/document-legends')
    expect(legends).toHaveLength(1)
    expect(legends[0]).toMatchObject({
      id: '1',
      documentType: 'quote',
      body: 'Cotizacion {folio} valida hasta {fecha_vencimiento}.',
      isActive: true,
    })
  })

  it('create posts JSON:API payload with camelCase attributes', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { data: legendResource } })

    await documentLegendsService.create({
      documentType: 'quote',
      body: 'Texto',
      isActive: true,
    })

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/document-legends', {
      data: {
        type: 'document-legends',
        attributes: { documentType: 'quote', body: 'Texto', isActive: true },
      },
    })
  })

  it('update patches only the provided attributes with the resource id', async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { data: legendResource } })

    await documentLegendsService.update('1', { isActive: false })

    expect(mockedAxios.patch).toHaveBeenCalledWith('/api/v1/document-legends/1', {
      data: {
        type: 'document-legends',
        id: '1',
        attributes: { isActive: false },
      },
    })
  })

  it('delete calls the resource endpoint', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: null })

    await documentLegendsService.delete('7')

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/v1/document-legends/7')
  })

  it('getPlaceholders returns the backend catalog', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [{ placeholder: '{folio}', description: 'Folio del documento' }] },
    })

    const placeholders = await documentLegendsService.getPlaceholders()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/document-legends-placeholders')
    expect(placeholders[0].placeholder).toBe('{folio}')
  })
})
