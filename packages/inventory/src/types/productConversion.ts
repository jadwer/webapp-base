/**
 * PRODUCT CONVERSION TYPES
 * Conversiones entre productos para fraccionamiento
 */

interface ProductBasic {
  id: string
  name: string
  sku: string
}

export interface ProductConversion {
  id: string
  sourceProductId: number
  destinationProductId: number
  conversionFactor: number
  wastePercentage: number
  /** Solo piezas completas: lo producido se redondea hacia abajo */
  wholeUnits?: boolean
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string

  // Relationships
  sourceProduct?: ProductBasic
  destinationProduct?: ProductBasic
}

export interface CreateProductConversionData {
  sourceProductId: number
  destinationProductId: number
  conversionFactor: number
  wastePercentage?: number
  wholeUnits?: boolean
  isActive?: boolean
  notes?: string
}

export interface UpdateProductConversionData {
  sourceProductId?: number
  destinationProductId?: number
  conversionFactor?: number
  wastePercentage?: number
  wholeUnits?: boolean
  isActive?: boolean
  notes?: string
}

export interface ProductConversionFilters {
  sourceProduct?: string
  destinationProduct?: string
  isActive?: string
}

export interface ProductConversionSortOptions {
  field: 'conversionFactor' | 'wastePercentage' | 'isActive' | 'createdAt'
  direction: 'asc' | 'desc'
}
