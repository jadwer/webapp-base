import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import { fractionationService } from '../../services/fractionationService'

vi.mock('../../lib/axiosClient')

describe('fractionationService.cancel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('manda el motivo al endpoint de cancelación', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: {} })

    await fractionationService.cancel('7', 'Captura equivocada')

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/fraccionamiento/7/cancel', { reason: 'Captura equivocada' })
  })

  it('sin motivo manda null', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: {} })

    await fractionationService.cancel('7', '')

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/fraccionamiento/7/cancel', { reason: null })
  })
})
