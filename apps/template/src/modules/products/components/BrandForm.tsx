'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { Brand, CreateBrandData, UpdateBrandData } from '../types'

interface BrandFormProps {
  brand?: Brand
  isLoading?: boolean
  onSubmit: (data: CreateBrandData | UpdateBrandData) => Promise<void>
  onCancel?: () => void
}

export const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    description: brand?.description || '',
    slug: brand?.slug || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        slug: brand.slug || ''
      })
    }
  }, [brand])

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la marca es requerido'
    }

    if (formData.slug && formData.slug.length > 100) {
      newErrors.slug = 'El slug no puede exceder los 100 caracteres'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder los 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name if slug is empty
    if (field === 'name' && !formData.slug && !brand) {
      const newSlug = generateSlug(value)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Clean up slug when user leaves the field
    if (field === 'slug' && formData.slug) {
      const cleanSlug = generateSlug(formData.slug)
      setFormData(prev => ({ ...prev, slug: cleanSlug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData = {
      name: formData.name.trim(),
      ...(formData.description && { description: formData.description.trim() }),
      ...(formData.slug && { slug: formData.slug.trim() })
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <Input
              label="Nombre de la marca"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              errorText={touched.name ? errors.name : ''}
              required
              placeholder="Ej: Nike, Apple, Samsung"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Descripción"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              errorText={touched.description ? errors.description : ''}
              placeholder="Descripción de la marca (opcional)"
              disabled={isLoading}
              helpText={`${formData.description.length}/500 caracteres`}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              onBlur={() => handleBlur('slug')}
              errorText={touched.slug ? errors.slug : ''}
              placeholder="slug-de-la-marca"
              helpText="URL amigable para la marca. Se genera automáticamente del nombre."
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2" />
                Vista previa
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Nombre:</strong>
                <div className="text-muted">
                  {formData.name || 'Sin nombre'}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Slug:</strong>
                <div className="text-muted">
                  <code>{formData.slug || 'sin-slug'}</code>
                </div>
              </div>

              {formData.description && (
                <div className="mb-3">
                  <strong>Descripción:</strong>
                  <div className="text-muted small">
                    {formData.description.length > 100 
                      ? `${formData.description.substring(0, 100)}...`
                      : formData.description
                    }
                  </div>
                </div>
              )}

              <div className="mb-0">
                <strong>URL resultante:</strong>
                <div className="text-muted small">
                  /products/brand/{formData.slug || 'sin-slug'}
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2" />
                Consejos
              </h6>
            </div>
            <div className="card-body">
              <ul className="mb-0 small">
                <li>Usa el nombre oficial de la marca</li>
                <li>El slug se genera automáticamente</li>
                <li>Las marcas ayudan a identificar fabricantes</li>
                <li>Mantén consistencia en los nombres</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            buttonStyle="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          <i className="bi bi-check-lg me-2" />
          {brand ? 'Actualizar marca' : 'Crear marca'}
        </Button>
      </div>
    </form>
  )
}

export default BrandForm