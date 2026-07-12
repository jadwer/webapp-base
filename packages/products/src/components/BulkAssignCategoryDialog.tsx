'use client'

import React, { useState } from 'react'
import { Modal, Button } from '@lwm/ui'
import { productBulkService } from '../services/productService'
import type { Brand } from '../types'
import type { Category } from '../types/category'

interface BulkAssignCategoryDialogProps {
  show: boolean
  onHide: () => void
  brands: Brand[]
  categories: Category[]
  preselectedBrandId?: string
  onSuccess?: (affectedCount: number) => void
}

export const BulkAssignCategoryDialog = React.memo<BulkAssignCategoryDialogProps>(({
  show,
  onHide,
  brands,
  categories,
  preselectedBrandId,
  onSuccess
}) => {
  const [brandId, setBrandId] = useState(preselectedBrandId || '')
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const selectedBrand = brands.find(b => b.id === brandId)
  const selectedCategory = categories.find(c => c.id === categoryId)
  const isValid = Boolean(brandId && categoryId)

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const res = await productBulkService.bulkAssignCategoryByBrand(
        parseInt(brandId),
        parseInt(categoryId)
      )
      setResult(`${res.affected_count} producto(s) reasignados a "${selectedCategory?.name ?? ''}"`)
      onSuccess?.(res.affected_count)
      setTimeout(() => {
        onHide()
        setResult(null)
        setBrandId(preselectedBrandId || '')
        setCategoryId('')
      }, 2000)
    } catch {
      setError('Error al reasignar la categoria. Verifique los datos e intente de nuevo.')
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
          <i className="bi bi-diagram-3 text-primary me-2" />
          Reasignar Categoria por Marca
        </div>
      }
      size="medium"
    >
      <div className="p-3">
        {/* Source brand selector */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Marca origen</label>
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
          <div className="form-text">Todos los productos de esta marca cambiaran de categoria.</div>
        </div>

        {/* Target category selector */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Categoria destino</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar categoria...</option>
            {categories.filter(c => c.isActive !== false).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {isValid && selectedBrand && selectedCategory && (
          <div className="alert alert-info mb-3">
            <i className="bi bi-info-circle me-2" />
            Esto reasignara <strong>{selectedBrand.productsCount ?? 0}</strong> producto(s) de <strong>{selectedBrand.name}</strong> a la categoria <strong>{selectedCategory.name}</strong>.
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
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            <i className="bi bi-check-lg me-2" />
            Confirmar Reasignacion
          </Button>
        </div>
      </div>
    </Modal>
  )
})

BulkAssignCategoryDialog.displayName = 'BulkAssignCategoryDialog'
