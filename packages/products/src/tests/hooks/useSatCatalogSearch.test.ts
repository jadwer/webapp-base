import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSatClaveProdServSearch, useSatClaveUnidadSearch } from '../../hooks/useSatCatalogSearch'
import { satCatalogsService } from '../../services/satCatalogsService'

vi.mock('../../services/satCatalogsService', () => ({
  satCatalogsService: {
    searchClaveProdServ: vi.fn(),
    searchClaveUnidad: vi.fn(),
  },
}))

describe('useSatCatalogSearch (via useSatClaveProdServSearch / useSatClaveUnidadSearch)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not search with fewer than 2 characters', async () => {
    const { result } = renderHook(() => useSatClaveProdServSearch())

    act(() => {
      result.current.setTerm('a')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(satCatalogsService.searchClaveProdServ).not.toHaveBeenCalled()
    expect(result.current.results).toEqual([])
  })

  it('waits 300ms of debounce before calling the service', async () => {
    vi.mocked(satCatalogsService.searchClaveProdServ).mockResolvedValue([
      { clave: '10101500', descripcion: 'Animales vivos' }
    ])

    const { result } = renderHook(() => useSatClaveProdServSearch())

    act(() => {
      result.current.setTerm('animal')
    })

    // Antes de los 300ms no debe haberse llamado
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299)
    })
    expect(satCatalogsService.searchClaveProdServ).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(satCatalogsService.searchClaveProdServ).toHaveBeenCalledWith('animal')
    expect(result.current.results).toEqual([{ clave: '10101500', descripcion: 'Animales vivos' }])
  })

  it('resets the debounce timer on each keystroke (only the last term is searched)', async () => {
    vi.mocked(satCatalogsService.searchClaveProdServ).mockResolvedValue([])

    const { result } = renderHook(() => useSatClaveProdServSearch())

    act(() => {
      result.current.setTerm('an')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    act(() => {
      result.current.setTerm('animal')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299)
    })
    expect(satCatalogsService.searchClaveProdServ).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(satCatalogsService.searchClaveProdServ).toHaveBeenCalledTimes(1)
    expect(satCatalogsService.searchClaveProdServ).toHaveBeenCalledWith('animal')
  })

  it('routes to searchClaveUnidad for the unidad variant', async () => {
    vi.mocked(satCatalogsService.searchClaveUnidad).mockResolvedValue([
      { clave: 'H87', nombre: 'Pieza' }
    ])

    const { result } = renderHook(() => useSatClaveUnidadSearch())

    act(() => {
      result.current.setTerm('pieza')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(satCatalogsService.searchClaveUnidad).toHaveBeenCalledWith('pieza')
    expect(satCatalogsService.searchClaveProdServ).not.toHaveBeenCalled()
  })

  it('clears results when the term is cleared', async () => {
    vi.mocked(satCatalogsService.searchClaveProdServ).mockResolvedValue([
      { clave: '10101500', descripcion: 'Animales vivos' }
    ])

    const { result } = renderHook(() => useSatClaveProdServSearch())

    act(() => {
      result.current.setTerm('animal')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(result.current.results).toHaveLength(1)

    act(() => {
      result.current.setTerm('')
    })

    expect(result.current.results).toEqual([])
  })
})
