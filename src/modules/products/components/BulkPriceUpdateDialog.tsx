'use client'

import React, { useState } from 'react'
import { Modal, Button } from '@/ui/components/base'
import { productBulkService } from '../services/productService'
import type { Brand } from '../types'

interface BulkPriceUpdateDialogProps {
  show: boolean
  onHide: () => void
  brands: Brand[]
  preselectedBrandId?: string
  onSuccess?: () => void
}

export const BulkPriceUpdateDialog = React.memo<BulkPriceUpdateDialogProps>(({
  show,
  onHide,
  brands,
  preselectedBrandId,
  onSuccess
}) => {
  const [brandId, setBrandId] = useState(preselectedBrandId || '')
  const [percentage, setPercentage] = useState('')
  const [operation, setOperation] = useState<'increase' | 'decrease'>('increase')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const selectedBrand = brands.find(b => b.id === brandId)
  const percentageNum = parseFloat(percentage)
  const isValid = brandId && percentage && percentageNum >= 0.01 && percentageNum <= 100

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const res = await productBulkService.bulkPriceUpdate(
        parseInt(brandId),
        percentageNum,
        operation
      )
      setResult(`${res.affected_count} producto(s) actualizados (${operation === 'increase' ? '+' : '-'}${percentageNum}%)`)
      onSuccess?.()
      setTimeout(() => {
        onHide()
        setResult(null)
        setBrandId(preselectedBrandId || '')
        setPercentage('')
        setOperation('increase')
      }, 2000)
    } catch {
      setError('Error al actualizar precios. Verifique los datos e intente de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null)
      setResult(null)
      onHide()
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      title={
        <div className="d-flex align-items-center">
          <i className="bi bi-currency-dollar text-success me-2" />
          Actualización Masiva de Precios
        </div>
      }
      size="medium"
    >
      <div className="p-3">
        {/* Brand selector */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Marca</label>
          <select
            className="form-select"
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar marca...</option>
            {brands.filter(b => b.isActive !== false).map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.productsCount ?? 0} productos)
              </option>
            ))}
          </select>
        </div>

        {/* Percentage */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Porcentaje (%)</label>
          <input
            type="number"
            className="form-control"
            min="0.01"
            max="100"
            step="0.01"
            placeholder="Ej: 3.5"
            value={percentage}
            onChange={e => setPercentage(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="form-text">Valor entre 0.01% y 100%</div>
        </div>

        {/* Operation */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Operación</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="operation"
                id="op-increase"
                checked={operation === 'increase'}
                onChange={() => setOperation('increase')}
                disabled={isSubmitting}
              />
              <label className="form-check-label" htmlFor="op-increase">
                <i className="bi bi-arrow-up-circle text-success me-1" />
                Aumentar
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="operation"
                id="op-decrease"
                checked={operation === 'decrease'}
                onChange={() => setOperation('decrease')}
                disabled={isSubmitting}
              />
              <label className="form-check-label" htmlFor="op-decrease">
                <i className="bi bi-arrow-down-circle text-danger me-1" />
                Disminuir
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        {isValid && selectedBrand && (
          <div className="alert alert-info mb-3">
            <i className="bi bi-info-circle me-2" />
            Esto {operation === 'increase' ? 'aumentará' : 'disminuirá'} los precios un <strong>{percentageNum}%</strong> para <strong>{selectedBrand.productsCount ?? 0}</strong> producto(s) de <strong>{selectedBrand.name}</strong>.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="alert alert-success mb-3">
            <i className="bi bi-check-circle me-2" />
            {result}
          </div>
        )}

        {/* Actions */}
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="secondary"
            buttonStyle="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            <i className="bi bi-check-lg me-2" />
            Confirmar Actualización
          </Button>
        </div>
      </div>
    </Modal>
  )
})

BulkPriceUpdateDialog.displayName = 'BulkPriceUpdateDialog'
