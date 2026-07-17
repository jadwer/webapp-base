import { Unit } from './unit'
import { Category } from './category'
import { Brand } from './brand'
import { ProductImage } from './productImage'

export interface ProductCurrency {
  id: string
  code: string
  name: string
  symbol: string
}

/**
 * Tipo de producto para efectos de manufactura/inventario SAT.
 * 'both' = el producto puede venderse terminado o consumirse como insumo.
 */
export type ProductType = 'finished' | 'raw_material' | 'both'

export interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  fullDescription?: string
  price?: number
  cost?: number
  iva: boolean
  isActive: boolean
  // isPublic false = producto interno: cotizable y vendible pero oculto del
  // catalogo publico. Default true en backend, opcional aqui por compatibilidad.
  isPublic?: boolean

  // Oferta. Alimenta la seccion "Ofertas del Mes" del sitio publico: el hook
  // useSaleProducts filtra por isOnSale y el backend respeta la ventana de
  // fechas (scope onSale). Sin fechas, la oferta corre mientras isOnSale este
  // activo. saleBadge es la etiqueta que se muestra (ej. "-20%", "LIQUIDACION").
  isOnSale?: boolean
  saleStartsAt?: string | null
  saleEndsAt?: string | null
  saleBadge?: string | null

  imgPath?: string
  datasheetPath?: string
  imgUrl?: string
  datasheetUrl?: string
  unitId: string
  categoryId: string | null
  brandId: string | null
  currencyId?: string | null
  createdAt: string
  updatedAt: string

  // Datos fiscales SAT (ver packages/products/README.md, seccion
  // "Campos fiscales SAT" para la semantica completa).
  satClaveProdServ?: string | null
  satClaveUnidad?: string | null
  productType?: ProductType | null
  // taxRate: null = Exento de IVA; 0 = tasa 0%; number = tasa en % (16, 8, etc.)
  taxRate?: number | null

  // Relationships
  unit?: Unit
  category?: Category
  brand?: Brand
  currency?: ProductCurrency
  images?: ProductImage[]
}

export interface CreateProductData {
  name: string
  sku?: string
  description?: string
  fullDescription?: string
  price?: number
  cost?: number
  iva?: boolean
  isActive?: boolean
  isPublic?: boolean
  isOnSale?: boolean
  saleStartsAt?: string | null
  saleEndsAt?: string | null
  saleBadge?: string | null
  imgPath?: string
  datasheetPath?: string
  unitId: string
  categoryId?: string | null
  brandId?: string | null
  currencyId?: string | null
  satClaveProdServ?: string | null
  satClaveUnidad?: string | null
  productType?: ProductType | null
  taxRate?: number | null
}

export type UpdateProductData = Partial<CreateProductData>

export interface ProductFilters {
  name?: string
  sku?: string
  isActive?: boolean
  isPublic?: boolean
  isOnSale?: boolean
  unitId?: string
  categoryId?: string
  brandId?: string
  brands?: string[]
  categories?: string[]
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'cost' | 'sku' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}