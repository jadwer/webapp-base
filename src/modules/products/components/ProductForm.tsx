'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useUnits, useCategories, useBrands } from '../hooks'
import { FileUploader } from './FileUploader'
import { productService } from '../services/productService'
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

  // File upload states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [datasheetFile, setDatasheetFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingDatasheet, setUploadingDatasheet] = useState(false)

  const { units, isLoading: unitsLoading } = useUnits()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { brands, isLoading: brandsLoading } = useBrands()

  // Memoize options to prevent re-renders when SWR hooks update
  const unitOptions = useMemo(() => [
    { value: '', label: 'Seleccione una unidad' },
    ...units.map(unit => ({ value: unit.id, label: `${unit.name} (${unit.code})` }))
  ], [units])

  const categoryOptions = useMemo(() => [
    { value: '', label: 'Seleccione una categoría' },
    ...categories.map(category => ({ value: category.id, label: category.name }))
  ], [categories])

  const brandOptions = useMemo(() => [
    { value: '', label: 'Seleccione una marca' },
    ...brands.map(brand => ({ value: brand.id, label: brand.name }))
  ], [brands])

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

  const validateForm = useCallback((): boolean => {
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
  }, [formData])

  // Memoized input handler to prevent unnecessary re-renders
  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field without triggering full validation
    setErrors(prev => {
      if (prev[field]) {
        const { [field]: _removed, ...rest } = prev
        void _removed // Satisfy linter
        return rest
      }
      return prev
    })
  }, [])

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => {
      if (prev[field]) return prev // No update if already touched
      return { ...prev, [field]: true }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    let finalImgPath = formData.imgPath
    let finalDatasheetPath = formData.datasheetPath

    // Upload image if new file selected
    if (imageFile) {
      setUploadingImage(true)
      try {
        const result = await productService.uploadImage(imageFile)
        finalImgPath = result.path
      } catch {
        setErrors(prev => ({ ...prev, imgPath: 'Error al subir la imagen' }))
        setUploadingImage(false)
        return
      }
      setUploadingImage(false)
    }

    // Upload datasheet if new file selected
    if (datasheetFile) {
      setUploadingDatasheet(true)
      try {
        const result = await productService.uploadDatasheet(datasheetFile)
        finalDatasheetPath = result.path
      } catch {
        setErrors(prev => ({ ...prev, datasheetPath: 'Error al subir la hoja de datos' }))
        setUploadingDatasheet(false)
        return
      }
      setUploadingDatasheet(false)
    }

    const submitData = {
      name: formData.name,
      ...(formData.sku && { sku: formData.sku }),
      ...(formData.description && { description: formData.description }),
      ...(formData.fullDescription && { fullDescription: formData.fullDescription }),
      ...(formData.price && { price: Number(formData.price) }),
      ...(formData.cost && { cost: Number(formData.cost) }),
      iva: formData.iva,
      ...(finalImgPath && { imgPath: finalImgPath }),
      ...(finalDatasheetPath && { datasheetPath: finalDatasheetPath }),
      unitId: formData.unitId,
      categoryId: formData.categoryId,
      brandId: formData.brandId
    }

    await onSubmit(submitData)
  }

  const isSubmitting = isLoading || uploadingImage || uploadingDatasheet
  const isDropdownsLoading = unitsLoading || categoriesLoading || brandsLoading

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      {/* Nombre del producto - Full width */}
      <div className="mb-4">
        <Input
          label="Nombre del producto"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          errorText={touched.name ? errors.name : ''}
          required
          placeholder="Ingrese el nombre del producto"
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="row">
        <div className="col-md-8">
          {/* Imagen del producto - First in left column, above SKU */}
          <div className="mb-3">
            <FileUploader
              label="Imagen del producto"
              accept="image/jpeg,image/png,image/gif,image/webp"
              maxSizeMB={10}
              isImage={true}
              onFileSelect={(file) => setImageFile(file)}
              onClear={() => {
                setImageFile(null)
                handleInputChange('imgPath', '')
              }}
              previewUrl={product?.imgUrl || null}
              isLoading={uploadingImage}
              helpText="JPG, PNG, GIF o WebP. Máximo 10MB"
              errorText={errors.imgPath}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting || isDropdownsLoading}
              options={unitOptions}
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
              disabled={isSubmitting || isDropdownsLoading}
              options={categoryOptions}
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
              disabled={isSubmitting || isDropdownsLoading}
              options={brandOptions}
            />
          </div>

          <div className="mb-3">
            <FileUploader
              label="Hoja de datos (PDF)"
              accept="application/pdf"
              maxSizeMB={10}
              isImage={false}
              onFileSelect={(file) => setDatasheetFile(file)}
              onClear={() => {
                setDatasheetFile(null)
                handleInputChange('datasheetPath', '')
              }}
              currentFileName={product?.datasheetPath ? 'Archivo existente' : undefined}
              isLoading={uploadingDatasheet}
              helpText="Archivo PDF. Máximo 10MB"
              errorText={errors.datasheetPath}
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
          disabled={isSubmitting || isDropdownsLoading}
        >
          <i className="bi bi-check-lg me-2" />
          {product ? 'Actualizar producto' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm