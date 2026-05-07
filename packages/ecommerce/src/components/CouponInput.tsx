/**
 * CouponInput Component
 *
 * Input for applying coupon codes to cart
 */

'use client'

import { useState } from 'react'
import { useCartCoupon } from '../hooks/useCoupons'

interface CouponInputProps {
  cartId: string
  cartTotal: number
  appliedCoupon?: {
    code: string
    discountAmount: number
  } | null
  onCouponApplied?: (coupon: { code: string; discountAmount: number }) => void
  onCouponRemoved?: () => void
}

export function CouponInput({
  cartId,
  cartTotal,
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    validateCoupon,
    applyCoupon,
    removeCoupon,
    validationResult,
    isApplying,
    isRemoving,
  } = useCartCoupon(cartId)

  const handleApply = async () => {
    setError(null)
    setSuccess(null)

    if (!code.trim()) {
      setError('Ingresa un codigo de cupon')
      return
    }

    try {
      // First validate
      const validation = await validateCoupon(code.trim().toUpperCase(), cartTotal)

      if (!validation.valid) {
        setError(validation.error || 'Cupon no valido')
        return
      }

      // Then apply
      const result = await applyCoupon(code.trim().toUpperCase())
      setSuccess(`Cupon aplicado: -$${result.discountAmount?.toFixed(2)}`)
      setCode('')
      onCouponApplied?.({
        code: code.trim().toUpperCase(),
        discountAmount: result.discountAmount || 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aplicar cupon')
    }
  }

  const handleRemove = async () => {
    setError(null)
    setSuccess(null)

    try {
      await removeCoupon()
      onCouponRemoved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover cupon')
    }
  }

  if (appliedCoupon) {
    return (
      <div className="card border-success">
        <div className="card-body py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-tag-fill text-success me-2" />
              <strong>{appliedCoupon.code}</strong>
              <span className="text-success ms-2">
                -${appliedCoupon.discountAmount.toFixed(2)}
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <i className="bi bi-x" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body py-2">
        <label className="form-label small mb-1">Cupon de descuento</label>
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Ingresa tu codigo"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            disabled={isApplying}
          />
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={handleApply}
            disabled={isApplying || !code.trim()}
          >
            {isApplying ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
        {error && <div className="text-danger small mt-1">{error}</div>}
        {success && <div className="text-success small mt-1">{success}</div>}
        {validationResult && validationResult.errors && validationResult.errors.length > 0 && (
          <div className="text-muted small mt-1">
            {validationResult.errors.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}

export default CouponInput
