/**
 * Product View Service Tests
 *
 * trackView es fire-and-forget y el backend exige id numerico
 * (whereNumber en la ruta): ids basura no deben generar ni el request.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productViewService } from '../../services/productViewService';

// Mock axios client
vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return {
    ...actual,
    axiosClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { axiosClient } from '@lwm/auth';

const mockAxios = axiosClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe('productViewService.trackView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts the view for a numeric product id', async () => {
    mockAxios.post.mockResolvedValue({ data: {} });

    await productViewService.trackView('42', 'sess-1');

    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/products/42/track-view', {
      session_id: 'sess-1',
    });
  });

  it('skips the request entirely for non-numeric ids (bot URLs)', async () => {
    await productViewService.trackView('catalogos');
    await productViewService.trackView('Equipamiento de laboratorio');
    await productViewService.trackView('');

    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('swallows backend errors silently (never blocks UX)', async () => {
    mockAxios.post.mockRejectedValue(new Error('500'));

    await expect(productViewService.trackView('42')).resolves.toBeUndefined();
  });
});
