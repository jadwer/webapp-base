// @vitest-environment node
/**
 * POST /api/revalidate (P1 granel, decision D5): el route handler de la app
 * conecta createRevalidateHandler con next/cache. El mismo archivo vive en
 * cada tenant (clients/<tenant>/webapp/src/app/api/revalidate/route.ts).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const cache = vi.hoisted(() => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('next/cache', () => cache)

import { POST, dynamic } from '@/app/api/revalidate/route'

function call(body: unknown, token = 'tok') {
  return POST(new Request('http://localhost/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }))
}

describe('app/api/revalidate/route', () => {
  const prev = process.env.REVALIDATE_TOKEN

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.REVALIDATE_TOKEN = 'tok'
  })

  afterEach(() => {
    if (prev === undefined) delete process.env.REVALIDATE_TOKEN
    else process.env.REVALIDATE_TOKEN = prev
  })

  it('es dinamico (nunca se cachea)', () => {
    expect(dynamic).toBe('force-dynamic')
  })

  it('revalida la ficha con next/cache cuando el token coincide', async () => {
    const res = await call({ paths: ['/productos/alcohol'], tags: ['public-product:12'] })
    expect(res.status).toBe(200)
    expect(cache.revalidatePath).toHaveBeenCalledWith('/productos/alcohol')
    expect(cache.revalidateTag).toHaveBeenCalledWith('public-product:12')
  })

  it('sin REVALIDATE_TOKEN responde 503', async () => {
    delete process.env.REVALIDATE_TOKEN
    const res = await call({ paths: ['/productos/alcohol'] })
    expect(res.status).toBe(503)
    expect(cache.revalidatePath).not.toHaveBeenCalled()
  })

  it('token incorrecto responde 401', async () => {
    const res = await call({ paths: ['/productos/alcohol'] }, 'otro')
    expect(res.status).toBe(401)
  })
})
