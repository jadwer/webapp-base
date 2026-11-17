/**
 * Existencia total del producto (rediseno 2026-11-17): antes la tabla pintaba "N/A" fijo.
 */
import { describe, it, expect } from 'vitest'
import { transformJsonApiProduct } from '../../utils/transformers'

const product = (rel?: unknown) => ({ id: '9', type: 'products', attributes: { name: 'Vaso', isActive: false }, relationships: rel === undefined ? {} : { stock: { data: rel } } })

describe('transformJsonApiProduct stockTotal', () => {
  it('suma las existencias incluidas', () => {
    const p = transformJsonApiProduct(product([{ type: 'stocks', id: '1' }, { type: 'stocks', id: '2' }]) as never, [
      { id: '1', type: 'stocks', attributes: { quantity: '3.5' } },
      { id: '2', type: 'stocks', attributes: { quantity: 2 } },
    ] as never)
    expect(p.stockTotal).toBe(5.5)
    expect(p.isActive).toBe(false)
  })

  it('sin include=stock no inventa el dato', () => {
    expect(transformJsonApiProduct(product() as never, []).stockTotal).toBeUndefined()
  })

  it('con include pero sin registros es cero', () => {
    expect(transformJsonApiProduct(product([]) as never, []).stockTotal).toBe(0)
  })
})
