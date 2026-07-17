'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '@lwm/ui'
import { useUnits, useCategories, useBrands, useCurrencies } from '../hooks'
import { FileUploader } from './FileUploader'
import { ImageGalleryManager } from './ImageGalleryManager'
import { SatKeyCombobox } from './SatKeyCombobox'
import { productService } from '../services/productService'
import type { Product, CreateProductData, UpdateProductData, ProductType } from '../types'

// Tasas de IVA fijas ofrecidas por el select. 'Exento' mapea a null,
// las demas son numeros. Si el producto trae un taxRate que no calza con
// ninguna de estas, se agrega una opcion "Personalizado" (ver taxRateOptions).
const STANDARD_TAX_RATES = [16, 8, 0] as const
const EXENTO_VALUE = 'exento'
const CUSTOM_VALUE_PREFIX = 'custom:'

// Exportadas (no solo locales) para poder testear el mapeo Exento/null de
// forma aislada, sin tener que montar el formulario completo con sus
// dependencias SWR (useUnits/useCategories/useBrands/useCurrencies).
export function taxRateToSelectValue(taxRate: number | null | undefined): string {
  if (taxRate === null || taxRate === undefined) return EXENTO_VALUE
  if ((STANDARD_TAX_RATES as readonly number[]).includes(taxRate)) return String(taxRate)
  return `${CUSTOM_VALUE_PREFIX}${taxRate}`
}

export function selectValueToTaxRate(selectValue: string): number | null {
  if (selectValue === EXENTO_VALUE) return null
  if (selectValue.startsWith(CUSTOM_VALUE_PREFIX)) {
    return Number(selectValue.slice(CUSTOM_VALUE_PREFIX.length))
  }
  return Number(selectValue)
}

const PRODUCT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Sin definir' },
  { value: 'finished', label: 'Terminado' },
  { value: 'raw_material', label: 'Materia prima' },
  { value: 'both', label: 'Ambos' }
]

/**
 * Extract a human-readable message from an upload error. The backend may
 * return JSON:API errors ({errors:[{detail}]}), a Laravel validation
 * payload ({message, errors:{field:[...]}}), or a plain Error. Falls back
 * to the provided generic message so the UI is never blank.
 */
function extractUploadError(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as {
      response?: { data?: { errors?: Array<{ detail?: string }> | Record<string, string[]>; message?: string } }
      message?: string
    }
    const data = e.response?.data
    if (data) {
      if (Array.isArray(data.errors) && data.errors[0]?.detail) {
        return data.errors[0].detail
      }
      if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        const firstField = Object.values(data.errors)[0]
        if (Array.isArray(firstField) && firstField[0]) return firstField[0]
      }
      if (data.message) return data.message
    }
    if (e.message) return e.message
  }
  return fallback
}

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
    // isPublic default true (marcado). false = producto interno.
    isPublic: product?.isPublic ?? true,
    // Oferta. Las fechas se manejan como YYYY-MM-DD para el input date.
    isOnSale: product?.isOnSale ?? false,
    saleStartsAt: product?.saleStartsAt?.slice(0, 10) || '',
    saleEndsAt: product?.saleEndsAt?.slice(0, 10) || '',
    saleBadge: product?.saleBadge || '',
    imgPath: product?.imgPath || '',
    datasheetPath: product?.datasheetPath || '',
    unitId: product?.unitId || '',
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    currencyId: product?.currencyId || '',
    satClaveProdServ: product?.satClaveProdServ ?? null as string | null,
    satClaveUnidad: product?.satClaveUnidad ?? null as string | null,
    productType: (product?.productType ?? '') as ProductType | '',
    taxRateSelect: taxRateToSelectValue(product?.taxRate)
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
  const { currencies, defaultCurrencyId, isLoading: currenciesLoading } = useCurrencies()

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

  const currencyOptions = useMemo(() => [
    { value: '', label: 'Seleccione una moneda' },
    ...currencies.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))
  ], [currencies])

  // Opciones del select de IVA. Si el producto trae una tasa custom (no 16/8/0
  // ni Exento) se agrega una opcion adicional para no perder ese valor al abrir
  // el formulario de edicion.
  const taxRateOptions = useMemo(() => {
    const base = [
      { value: '16', label: '16%' },
      { value: '8', label: '8%' },
      { value: '0', label: '0%' },
      { value: EXENTO_VALUE, label: 'Exento' }
    ]
    const currentValue = formData.taxRateSelect
    if (currentValue.startsWith(CUSTOM_VALUE_PREFIX)) {
      const customRate = currentValue.slice(CUSTOM_VALUE_PREFIX.length)
      base.push({ value: currentValue, label: `Personalizado: ${customRate}%` })
    }
    return base
  }, [formData.taxRateSelect])

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
        isPublic: product.isPublic ?? true,
        isOnSale: product.isOnSale ?? false,
        saleStartsAt: product.saleStartsAt?.slice(0, 10) || '',
        saleEndsAt: product.saleEndsAt?.slice(0, 10) || '',
        saleBadge: product.saleBadge || '',
        imgPath: product.imgPath || '',
        datasheetPath: product.datasheetPath || '',
        unitId: product.unitId || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        currencyId: product.currencyId || '',
        satClaveProdServ: product.satClaveProdServ ?? null,
        satClaveUnidad: product.satClaveUnidad ?? null,
        productType: product.productType ?? '',
        taxRateSelect: taxRateToSelectValue(product.taxRate)
      })
    }
  }, [product])

  // Auto-set default currency (MXN) for new products
  useEffect(() => {
    if (!product && defaultCurrencyId && !formData.currencyId) {
      setFormData(prev => ({ ...prev, currencyId: defaultCurrencyId }))
    }
  }, [product, defaultCurrencyId, formData.currencyId])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido'
    }

    // Description + fullDescription both required so the catalog isn't
    // filled with skeleton products. Backend columns are both NOT NULL —
    // we enforce client-side too. Service layer also coerces null -> ''
    // as a belt-and-suspenders measure for the SQL 1364 case.
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción corta es requerida'
    }

    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = 'La descripción completa es requerida'
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
  const handleInputChange = useCallback((field: string, value: string | boolean | null) => {
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

    let newImgPath: string | undefined
    let newDatasheetPath: string | undefined

    // Upload image only if a new file was selected (single-image FileUploader used on create)
    if (imageFile) {
      setUploadingImage(true)
      try {
        const result = await productService.uploadImage(imageFile)
        newImgPath = result.path
      } catch (err: unknown) {
        setErrors(prev => ({ ...prev, imgPath: extractUploadError(err, 'Error al subir la imagen') }))
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
        newDatasheetPath = result.path
      } catch (err: unknown) {
        setErrors(prev => ({ ...prev, datasheetPath: extractUploadError(err, 'Error al subir la hoja de datos') }))
        setUploadingDatasheet(false)
        return
      }
      setUploadingDatasheet(false)
    }

    const submitData = {
      name: formData.name,
      ...(formData.sku && { sku: formData.sku }),
      description: formData.description,
      fullDescription: formData.fullDescription,
      ...(formData.price && { price: Number(formData.price) }),
      ...(formData.cost && { cost: Number(formData.cost) }),
      iva: formData.iva,
      isPublic: formData.isPublic,
      // Oferta. Las fechas y el badge viajan como null cuando se limpian, para
      // poder quitar una vigencia (undefined no llegaria al backend).
      isOnSale: formData.isOnSale,
      saleStartsAt: formData.saleStartsAt || null,
      saleEndsAt: formData.saleEndsAt || null,
      saleBadge: formData.saleBadge || null,
      // Only send imgPath if a new file was uploaded. Otherwise let the ProductImage
      // Observer manage it to stay in sync with the gallery.
      ...(newImgPath && { imgPath: newImgPath }),
      ...(newDatasheetPath && { datasheetPath: newDatasheetPath }),
      unitId: formData.unitId,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      ...(formData.currencyId && { currencyId: formData.currencyId }),
      // Datos fiscales SAT. satClaveProdServ/satClaveUnidad siempre se
      // envian (incluso null) para poder limpiarlos con el boton "x" del
      // combobox. taxRate tambien viaja siempre: null == Exento es un
      // valor valido, no "sin tocar".
      satClaveProdServ: formData.satClaveProdServ,
      satClaveUnidad: formData.satClaveUnidad,
      productType: formData.productType || null,
      taxRate: selectValueToTaxRate(formData.taxRateSelect)
    }

    await onSubmit(submitData)
  }

  const isSubmitting = isLoading || uploadingImage || uploadingDatasheet
  const isDropdownsLoading = unitsLoading || categoriesLoading || brandsLoading || currenciesLoading

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
          {/* Imagen del producto */}
          <div className="mb-3">
            {product?.id ? (
              <ImageGalleryManager productId={product.id} />
            ) : (
              <>
                <FileUploader
                  label="Imagen del producto"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  maxSizeMB={10}
                  isImage={true}
                  onFileSelect={(file) => {
                    setImageFile(file)
                    // Clear stale upload error so re-selecting a new file
                    // doesn't keep the red banner from the previous attempt.
                    setErrors(prev => {
                      if (!prev.imgPath) return prev
                      const { imgPath: _drop, ...rest } = prev
                      return rest
                    })
                  }}
                  onClear={() => {
                    setImageFile(null)
                    handleInputChange('imgPath', '')
                    setErrors(prev => {
                      if (!prev.imgPath) return prev
                      const { imgPath: _drop, ...rest } = prev
                      return rest
                    })
                  }}
                  previewUrl={null}
                  isLoading={uploadingImage}
                  helpText="JPG, PNG, GIF o WebP. Máximo 10MB"
                  errorText={errors.imgPath}
                />
                <small className="text-muted d-block mt-1">
                  Podra agregar mas imagenes despues de guardar el producto.
                </small>
              </>
            )}
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
              errorText={touched.description ? errors.description : ''}
              required
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
              errorText={touched.fullDescription ? errors.fullDescription : ''}
              required
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
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="is-public-checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                disabled={isSubmitting}
              />
              <label className="form-check-label" htmlFor="is-public-checkbox">
                Visible en catalogo publico
              </label>
              <div className="form-text">
                Desactiva para productos internos: se pueden cotizar y vender pero no aparecen en la tienda publica.
              </div>
            </div>
          </div>

          {/* Oferta: alimenta la seccion "Ofertas del Mes" del sitio publico. */}
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="is-on-sale-checkbox"
                checked={formData.isOnSale}
                onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                disabled={isSubmitting}
              />
              <label className="form-check-label" htmlFor="is-on-sale-checkbox">
                En oferta
              </label>
              <div className="form-text">
                El producto aparece en la seccion Ofertas del sitio publico.
              </div>
            </div>
          </div>

          {formData.isOnSale && (
            <div className="mb-3 ps-4 border-start">
              <div className="row g-2">
                <div className="col-md-6">
                  <Input
                    label="Oferta desde"
                    type="date"
                    value={formData.saleStartsAt}
                    onChange={(e) => handleInputChange('saleStartsAt', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Oferta hasta"
                    type="date"
                    value={formData.saleEndsAt}
                    onChange={(e) => handleInputChange('saleEndsAt', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mt-2">
                <Input
                  label="Etiqueta"
                  type="text"
                  value={formData.saleBadge}
                  onChange={(e) => handleInputChange('saleBadge', e.target.value)}
                  placeholder="Ej. -20%, LIQUIDACION"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-text">
                Las fechas son opcionales: sin ellas la oferta corre mientras siga marcada.
              </div>
            </div>
          )}

          <div className="mb-3">
            <Input
              label="Moneda"
              type="select"
              value={formData.currencyId}
              onChange={(e) => handleInputChange('currencyId', e.target.value)}
              onBlur={() => handleBlur('currencyId')}
              disabled={isSubmitting || isDropdownsLoading}
              options={currencyOptions}
            />
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
              onFileSelect={(file) => {
                setDatasheetFile(file)
                setErrors(prev => {
                  if (!prev.datasheetPath) return prev
                  const { datasheetPath: _drop, ...rest } = prev
                  return rest
                })
              }}
              onClear={() => {
                setDatasheetFile(null)
                handleInputChange('datasheetPath', '')
                setErrors(prev => {
                  if (!prev.datasheetPath) return prev
                  const { datasheetPath: _drop, ...rest } = prev
                  return rest
                })
              }}
              currentFileName={product?.datasheetPath ? 'Archivo existente' : undefined}
              isLoading={uploadingDatasheet}
              helpText="Archivo PDF. Máximo 10MB"
              errorText={errors.datasheetPath}
            />
          </div>
        </div>
      </div>

      {/* Datos fiscales SAT */}
      <div className="mt-4">
        <h6 className="mb-3">Datos fiscales (SAT)</h6>
        <div className="row">
          <div className="col-md-6">
            <SatKeyCombobox
              label="Clave Prod/Serv (SAT)"
              kind="claveProdServ"
              value={formData.satClaveProdServ}
              onChange={(clave) => handleInputChange('satClaveProdServ', clave)}
              placeholder="Buscar o capturar clave de producto/servicio"
              helpText="Escriba para buscar en el catálogo SAT o capture la clave directamente"
              disabled={isSubmitting}
            />
          </div>
          <div className="col-md-6">
            <SatKeyCombobox
              label="Clave Unidad (SAT)"
              kind="claveUnidad"
              value={formData.satClaveUnidad}
              onChange={(clave) => handleInputChange('satClaveUnidad', clave)}
              placeholder="Buscar o capturar clave de unidad"
              helpText="Escriba para buscar en el catálogo SAT o capture la clave directamente"
              disabled={isSubmitting}
            />
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <Input
                label="Tipo de producto"
                type="select"
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                disabled={isSubmitting}
                options={PRODUCT_TYPE_OPTIONS}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <Input
                label="IVA"
                type="select"
                value={formData.taxRateSelect}
                onChange={(e) => handleInputChange('taxRateSelect', e.target.value)}
                disabled={isSubmitting}
                options={taxRateOptions}
                helpText="Exento no aplica IVA (distinto de tasa 0%)"
              />
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