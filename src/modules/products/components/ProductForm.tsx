'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useUnits, useCategories, useBrands } from '../hooks'
import type { Product, CreateProductData, UpdateProductData } from '../types'

interface ProductFormProps {
  product?: Product
  isLoading?: boolean
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>
  onCancel?: () => void
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    fullDescription: product?.fullDescription || '',
    price: product?.price?.toString() || '',
    cost: product?.cost?.toString() || '',
    iva: product?.iva || false,
    imgPath: product?.imgPath || '',
    datasheetPath: product?.datasheetPath || '',
    unitId: product?.unitId || '',
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { units, isLoading: unitsLoading } = useUnits()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { brands, isLoading: brandsLoading } = useBrands()

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        fullDescription: product.fullDescription || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        iva: product.iva || false,
        imgPath: product.imgPath || '',
        datasheetPath: product.datasheetPath || '',
        unitId: product.unitId || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || ''
      })
    }
  }, [product])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido'
    }

    if (!formData.unitId) {
      newErrors.unitId = 'La unidad de medida es requerida'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'La categoría es requerida'
    }

    if (!formData.brandId) {
      newErrors.brandId = 'La marca es requerida'
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'El precio debe ser un número válido'
    }

    if (formData.cost && isNaN(Number(formData.cost))) {
      newErrors.cost = 'El costo debe ser un número válido'
    }

    if (formData.sku && formData.sku.length > 50) {
      newErrors.sku = 'El SKU no puede exceder los 50 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData = {
      name: formData.name,
      ...(formData.sku && { sku: formData.sku }),
      ...(formData.description && { description: formData.description }),
      ...(formData.fullDescription && { fullDescription: formData.fullDescription }),
      ...(formData.price && { price: Number(formData.price) }),
      ...(formData.cost && { cost: Number(formData.cost) }),
      iva: formData.iva,
      ...(formData.imgPath && { imgPath: formData.imgPath }),
      ...(formData.datasheetPath && { datasheetPath: formData.datasheetPath }),
      unitId: formData.unitId,
      categoryId: formData.categoryId,
      brandId: formData.brandId
    }

    await onSubmit(submitData)
  }

  const isFormLoading = isLoading || unitsLoading || categoriesLoading || brandsLoading

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <Input
              label="Nombre del producto"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              errorText={touched.name ? errors.name : ''}
              required
              placeholder="Ingrese el nombre del producto"
              disabled={isFormLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="SKU"
              type="text"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              onBlur={() => handleBlur('sku')}
              errorText={touched.sku ? errors.sku : ''}
              placeholder="Código único del producto (opcional)"
              helpText="Código único para identificar el producto"
              disabled={isFormLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Descripción corta"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="Descripción breve del producto"
              
              disabled={isFormLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Descripción completa"
              type="textarea"
              value={formData.fullDescription}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              onBlur={() => handleBlur('fullDescription')}
              placeholder="Descripción detallada del producto"
              
              disabled={isFormLoading}
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <Input
              label="Precio de venta"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              onBlur={() => handleBlur('price')}
              errorText={touched.price ? errors.price : ''}
              placeholder="0.00"
              step="0.01"
              min="0"
              leftIcon="bi-currency-dollar"
              disabled={isFormLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Costo"
              type="number"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', e.target.value)}
              onBlur={() => handleBlur('cost')}
              errorText={touched.cost ? errors.cost : ''}
              placeholder="0.00"
              step="0.01"
              min="0"
              leftIcon="bi-currency-dollar"
              disabled={isFormLoading}
            />
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="iva-checkbox"
                checked={formData.iva}
                onChange={(e) => handleInputChange('iva', e.target.checked)}
                disabled={isFormLoading}
              />
              <label className="form-check-label" htmlFor="iva-checkbox">
                IVA incluido
              </label>
            </div>
          </div>

          <div className="mb-3">
            <Input
              label="Unidad de medida"
              type="select"
              value={formData.unitId}
              onChange={(e) => handleInputChange('unitId', e.target.value)}
              onBlur={() => handleBlur('unitId')}
              errorText={touched.unitId ? errors.unitId : ''}
              required
              disabled={isFormLoading}
              options={[
                { value: '', label: 'Seleccione una unidad' },
                ...units.map(unit => ({ value: unit.id, label: `${unit.name} (${unit.code})` }))
              ]}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Categoría"
              type="select"
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              onBlur={() => handleBlur('categoryId')}
              errorText={touched.categoryId ? errors.categoryId : ''}
              required
              disabled={isFormLoading}
              options={[
                { value: '', label: 'Seleccione una categoría' },
                ...categories.map(category => ({ value: category.id, label: category.name }))
              ]}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Marca"
              type="select"
              value={formData.brandId}
              onChange={(e) => handleInputChange('brandId', e.target.value)}
              onBlur={() => handleBlur('brandId')}
              errorText={touched.brandId ? errors.brandId : ''}
              required
              disabled={isFormLoading}
              options={[
                { value: '', label: 'Seleccione una marca' },
                ...brands.map(brand => ({ value: brand.id, label: brand.name }))
              ]}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Imagen"
              type="text"
              value={formData.imgPath}
              onChange={(e) => handleInputChange('imgPath', e.target.value)}
              onBlur={() => handleBlur('imgPath')}
              placeholder="URL de la imagen"
              leftIcon="bi-image"
              disabled={isFormLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Hoja de datos"
              type="text"
              value={formData.datasheetPath}
              onChange={(e) => handleInputChange('datasheetPath', e.target.value)}
              onBlur={() => handleBlur('datasheetPath')}
              placeholder="URL de la hoja de datos"
              leftIcon="bi-file-earmark-pdf"
              disabled={isFormLoading}
            />
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
          disabled={isFormLoading}
        >
          <i className="bi bi-check-lg me-2" />
          {product ? 'Actualizar producto' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm