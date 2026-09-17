/**
 * usePublicCategories: fetch en cliente por defecto; con initialData
 * (prerender en servidor, SEO Bloque 1) no hay fetch ni estado de carga.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { axiosClient } from '@lwm/auth'
import { usePublicCategories } from '../../hooks/usePublicCategories'

vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return { ...actual, axiosClient: { get: vi.fn() } }
})

const mockGet = (axiosClient as unknown as { get: ReturnType<typeof vi.fn> }).get

describe('usePublicCategories', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('sin initialData hace fetch y mapea', async () => {
    mockGet.mockResolvedValue({ data: { data: [{ id: '1', attributes: { name: 'Reactivos', slug: 'reactivos' } }] } })
    const { result } = renderHook(() => usePublicCategories({ limit: 50 }))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGet).toHaveBeenCalledWith('/api/public/v1/public-categories', { params: { 'page[size]': 50, sort: 'name' } })
    expect(result.current.categories[0]).toMatchObject({ id: '1', name: 'Reactivos', slug: 'reactivos' })
  })

  it('con initialData no llama a la API y arranca sin carga', async () => {
    const initialData = [{ id: '7', name: 'Vidrio', slug: 'vidrio' }]
    const { result } = renderHook(() => usePublicCategories({ limit: 50, initialData }))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.categories).toEqual(initialData)
    await new Promise((r) => setTimeout(r, 10))
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('initialData vacio tambien cuenta como prerenderizado (no refetch)', async () => {
    const { result } = renderHook(() => usePublicCategories({ initialData: [] }))
    expect(result.current.isLoading).toBe(false)
    await new Promise((r) => setTimeout(r, 10))
    expect(mockGet).not.toHaveBeenCalled()
  })
})
