// @vitest-environment node
/**
 * Route handler de revalidacion (P1 granel, decision D5): token de servidor,
 * 503 sin token, lista blanca de rutas y tags.
 */

import { describe, it, expect, vi } from 'vitest'
import { createRevalidateHandler, STOREFRONT_TAGS } from '../revalidate'

function setup(token: string | undefined = 'secreto') {
  const revalidatePath = vi.fn()
  const revalidateTag = vi.fn()
  const POST = createRevalidateHandler({ revalidatePath, revalidateTag, getToken: () => token })
  return { POST, revalidatePath, revalidateTag }
}

function request(body: unknown, auth: string | null = 'Bearer secreto'): Request {
  return new Request('https://tienda.test/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('createRevalidateHandler', () => {
  it('sin token configurado responde 503 y no revalida', async () => {
    const { POST, revalidatePath, revalidateTag } = setup('')
    const res = await POST(request({ paths: ['/productos/abc'] }))
    expect(res.status).toBe(503)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('usa process.env.REVALIDATE_TOKEN por defecto', async () => {
    const prev = process.env.REVALIDATE_TOKEN
    delete process.env.REVALIDATE_TOKEN
    const revalidatePath = vi.fn()
    const POST = createRevalidateHandler({ revalidatePath, revalidateTag: vi.fn() })
    expect((await POST(request({ paths: ['/productos/abc'] }))).status).toBe(503)
    process.env.REVALIDATE_TOKEN = 'secreto'
    expect((await POST(request({ paths: ['/productos/abc'] }))).status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/productos/abc')
    if (prev === undefined) delete process.env.REVALIDATE_TOKEN
    else process.env.REVALIDATE_TOKEN = prev
  })

  it('token ausente o distinto responde 401', async () => {
    const { POST, revalidatePath } = setup()
    expect((await POST(request({ paths: ['/productos/abc'] }, null))).status).toBe(401)
    expect((await POST(request({ paths: ['/productos/abc'] }, 'Bearer otro'))).status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalida rutas y tags validos del producto', async () => {
    const { POST, revalidatePath, revalidateTag } = setup()
    const res = await POST(request({
      paths: ['/productos/alcohol-isopropilico', '/productos/604'],
      tags: [STOREFRONT_TAGS.catalog, STOREFRONT_TAGS.product(604), STOREFRONT_TAGS.productSlug('alcohol-isopropilico')],
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.revalidated).toBe(true)
    expect(revalidatePath).toHaveBeenCalledTimes(2)
    expect(revalidatePath).toHaveBeenCalledWith('/productos/alcohol-isopropilico')
    expect(revalidateTag).toHaveBeenCalledWith('public-product:604')
    expect(revalidateTag).toHaveBeenCalledWith('public-product-slug:alcohol-isopropilico')
    expect(revalidateTag).toHaveBeenCalledWith('public-catalog')
  })

  it('rechaza rutas o tags fuera de la lista blanca sin revalidar nada', async () => {
    const { POST, revalidatePath, revalidateTag } = setup()
    const bad = await POST(request({ paths: ['/dashboard'], tags: ['public-catalog'] }))
    expect(bad.status).toBe(400)
    expect((await bad.json()).error).toContain('/dashboard')
    expect((await POST(request({ tags: ['otra-cosa'] }))).status).toBe(400)
    expect((await POST(request({ paths: '/productos/x' }))).status).toBe(400)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('cuerpo vacío o JSON invalido responde 400', async () => {
    const { POST } = setup()
    expect((await POST(request({}))).status).toBe(400)
    expect((await POST(request('{no json'))).status).toBe(400)
  })
})
