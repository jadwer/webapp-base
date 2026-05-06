import { CreateProductData, UpdateProductData, CreateUnitData, CreateCategoryData, CreateBrandData } from '../types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateProduct(data: CreateProductData | UpdateProductData): ValidationResult {
  const errors: Record<string, string> = {}

  // Required fields for creation
  if ('name' in data || data.name !== undefined) {
    if (!data.name || !data.name.trim()) {
      errors.name = 'El nombre del producto es requerido'
    } else if (data.name.length > 400) {
      errors.name = 'El nombre no puede exceder los 400 caracteres'
    }
  }

  if ('unitId' in data || data.unitId !== undefined) {
    if (!data.unitId) {
      errors.unitId = 'La unidad de medida es requerida'
    }
  }

  if ('categoryId' in data || data.categoryId !== undefined) {
    if (!data.categoryId) {
      errors.categoryId = 'La categoría es requerida'
    }
  }

  if ('brandId' in data || data.brandId !== undefined) {
    if (!data.brandId) {
      errors.brandId = 'La marca es requerida'
    }
  }

  // Optional field validations
  if (data.sku && data.sku.length > 50) {
    errors.sku = 'El SKU no puede exceder los 50 caracteres'
  }

  if (data.price !== undefined && data.price !== null && data.price < 0) {
    errors.price = 'El precio no puede ser negativo'
  }

  if (data.cost !== undefined && data.cost !== null && data.cost < 0) {
    errors.cost = 'El costo no puede ser negativo'
  }

  if (data.imgPath && data.imgPath.length > 400) {
    errors.imgPath = 'La ruta de imagen no puede exceder los 400 caracteres'
  }

  if (data.datasheetPath && data.datasheetPath.length > 400) {
    errors.datasheetPath = 'La ruta de hoja de datos no puede exceder los 400 caracteres'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateUnit(data: CreateUnitData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'El nombre de la unidad es requerido'
  }

  if (!data.code || !data.code.trim()) {
    errors.code = 'El código es requerido'
  } else if (data.code.length > 10) {
    errors.code = 'El código no puede exceder los 10 caracteres'
  }

  if (!data.unitType || !data.unitType.trim()) {
    errors.unitType = 'El tipo de unidad es requerido'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateCategory(data: CreateCategoryData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'El nombre de la categoría es requerido'
  }

  if (data.slug && data.slug.length > 100) {
    errors.slug = 'El slug no puede exceder los 100 caracteres'
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'La descripción no puede exceder los 500 caracteres'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateBrand(data: CreateBrandData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'El nombre de la marca es requerido'
  }

  if (data.slug && data.slug.length > 100) {
    errors.slug = 'El slug no puede exceder los 100 caracteres'
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'La descripción no puede exceder los 500 caracteres'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateSKU(sku: string): boolean {
  if (!sku) return true // SKU is optional
  
  // SKU should only contain alphanumeric characters, hyphens, and underscores
  const skuRegex = /^[A-Za-z0-9\-_]+$/
  return skuRegex.test(sku)
}

export function validatePrice(price: string): boolean {
  if (!price) return true // Price is optional
  
  const numPrice = parseFloat(price)
  return !isNaN(numPrice) && numPrice >= 0
}

export function validateSlug(slug: string): boolean {
  if (!slug) return true // Slug is optional
  
  // Slug should only contain lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9\-]+$/
  return slugRegex.test(slug)
}