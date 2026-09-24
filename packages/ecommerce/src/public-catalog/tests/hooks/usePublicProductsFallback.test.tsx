/**
 * usePublicProducts con SWR REAL (los otros tests mockean swr/immutable).
 *
 * Caso E2E dev 2026-09-18 (H1): en /productos el usuario busca desde el
 * header; la navegacion suave a /productos?search=x trae nuevos filtros y
 * nuevo fallbackData del servidor, pero SWR con keepPreviousData devolvia
 * los datos de la clave anterior y, como el fallback cuenta como data,
 * tampoco revalidaba: el grid se quedaba con el catalogo viejo.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { usePublicProducts } from '../../hooks/usePublicProducts'
import { publicProductsService } from '../../services/publicProductsService'
import type { EnhancedPublicProduct, PublicProductFilters } from '../../types/publicProduct'
import type { PublicProductsPage } from '../../services/publicProductsTransform'

vi.mock('../../services/publicProductsService', () => ({
  publicProductsService: { getPublicProducts: vi.fn() },
}))

const mockGet = publicProductsService.getPublicProducts as unknown as ReturnType<typeof vi.fn>

function page(names: string[]): PublicProductsPage {
  return {
    products: names.map((name, i) => ({ id: String(i + 1), name, displayName: name }) as unknown as EnhancedPublicProduct),
    meta: { currentPage: 1, lastPage: 1, perPage: 24, total: names.length, from: 1, to: names.length },
    links: {},
  } as unknown as PublicProductsPage
}

// Cache nuevo por test: SWR comparte cache global entre renders.
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
)

describe('usePublicProducts con fallbackData en navegacion suave', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('al cambiar filtros con nuevo fallbackData muestra el fallback nuevo, no los datos previos', async () => {
    const catalog = page(['A base', 'Cap'])
    const search = page(['Acido borico', 'Acido clorhidrico'])

    const { result, rerender } = renderHook(
      ({ filters, fallbackData }) => usePublicProducts(filters, undefined, { page: 1, size: 24 }, 'unit', { fallbackData }),
      { wrapper, initialProps: { filters: { isActive: true } as PublicProductFilters, fallbackData: catalog } }
    )
    expect(result.current.products.map((p) => p.displayName)).toEqual(['A base', 'Cap'])

    rerender({ filters: { isActive: true, search: 'acido' }, fallbackData: search })

    await waitFor(() => expect(result.current.products.map((p) => p.displayName)).toEqual(['Acido borico', 'Acido clorhidrico']))
    expect(result.current.isLoading).toBe(false)
    await new Promise((r) => setTimeout(r, 20))
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('sin fallbackData (cambio de filtro del usuario) conserva los datos previos mientras carga y luego actualiza', async () => {
    const catalog = page(['A base'])
    const fetched = page(['Matraz'])
    let resolve!: (v: PublicProductsPage) => void
    mockGet.mockImplementation(() => new Promise<PublicProductsPage>((r) => { resolve = r }))

    const { result, rerender } = renderHook(
      ({ filters, fallbackData }) => usePublicProducts(filters, undefined, { page: 1, size: 24 }, 'unit', { fallbackData }),
      { wrapper, initialProps: { filters: { isActive: true } as PublicProductFilters, fallbackData: catalog as PublicProductsPage | undefined } }
    )
    expect(result.current.products.map((p) => p.displayName)).toEqual(['A base'])

    rerender({ filters: { isActive: true, categoryId: '3' }, fallbackData: undefined })

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))
    expect(result.current.products.map((p) => p.displayName)).toEqual(['A base'])

    resolve(fetched)
    await waitFor(() => expect(result.current.products.map((p) => p.displayName)).toEqual(['Matraz']))
  })
})
