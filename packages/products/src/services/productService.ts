import { axiosClient as axios } from '@lwm/auth'
import {
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  QueryParams,
  ProductFilters,
  ProductSortOptions
} from '../types'
import { transformJsonApiProduct, JsonApiResource } from '../utils/transformers'
import type { JsonApiResponse } from '../types'

const PRODUCTS_ENDPOINT = '/api/v1/products'

export const productService = {
  async getProducts(params?: {
    page?: { number?: number; size?: number }
    filters?: ProductFilters
    sort?: ProductSortOptions
    include?: string[]
  }): Promise<ProductsResponse> {
    const queryParams: Record<string, unknown> = {}
    
    if (params?.page) {
      if (params.page.number !== undefined) {
        queryParams['page[number]'] = params.page.number
      }
      if (params.page.size !== undefined) {
        queryParams['page[size]'] = params.page.size
      }
    }
    
    if (params?.filters) {
      // Usar el nuevo filtro unificado search que busca en nombre, SKU y descripción con OR
      if (params.filters.name || params.filters.sku) {
        // Usar el primer valor disponible (ambos deberían ser iguales desde ProductsFiltersSimple)
        const searchTerm = params.filters.name || params.filters.sku
        queryParams['filter[search]'] = searchTerm
      }
      // Filtros por ID individuales
      if (params.filters.unitId) queryParams['filter[unit_id]'] = params.filters.unitId
      if (params.filters.categoryId) queryParams['filter[category_id]'] = params.filters.categoryId
      if (params.filters.brandId) queryParams['filter[brand_id]'] = params.filters.brandId
      // Filtros múltiples
      if (params.filters.brands) queryParams['filter[brands]'] = params.filters.brands.join(',')
      if (params.filters.categories) queryParams['filter[categories]'] = params.filters.categories.join(',')
    }
    
    if (params?.sort) {
      const direction = params.sort.direction === 'desc' ? '-' : ''
      queryParams.sort = `${direction}${params.sort.field}`
    }
    
    if (params?.include) {
      queryParams.include = params.include.join(',')
    }

    const response = await axios.get(PRODUCTS_ENDPOINT, { params: queryParams })

    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource[]>
    
    // Transform the response
    const transformedData = Array.isArray(jsonApiResponse.data) 
      ? jsonApiResponse.data.map(resource => transformJsonApiProduct(
          resource as JsonApiResource, 
          (jsonApiResponse.included || []) as JsonApiResource[]
        ))
      : []
    
    
    return {
      data: transformedData,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async getProduct(id: string, include?: string[]): Promise<ProductResponse> {
    const params: QueryParams = {}
    
    if (include) {
      params.include = include.join(',')
    }

    const response = await axios.get(`${PRODUCTS_ENDPOINT}/${id}`, { params })
    
    const jsonApiResponse = response.data as JsonApiResponse<JsonApiResource>
    
    // Transform the single product response
    const transformedProduct = transformJsonApiProduct(
      jsonApiResponse.data as JsonApiResource,
      (jsonApiResponse.included || []) as JsonApiResource[]
    )
    
    return {
      data: transformedProduct,
      meta: jsonApiResponse.meta,
      links: jsonApiResponse.links
    }
  },

  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    const payload = {
      data: {
        type: 'products',
        attributes: {
          name: data.name,
          ...(data.sku && { sku: data.sku }),
          // description + fullDescription are NOT NULL in the products table
          // (no default), even though the Request marks them nullable. The
          // legacy LWM frontend always sent both fields (even as empty
          // strings), which kept inserts safe. The refactor's conditional
          // spread broke that contract and produced SQL 1364. Always send
          // the field; coerce undefined/null to '' so MySQL gets a value.
          description: data.description ?? '',
          fullDescription: data.fullDescription ?? '',
          ...(data.price !== undefined && { price: data.price }),
          ...(data.cost !== undefined && { cost: data.cost }),
          iva: data.iva ?? false,
          ...(data.imgPath && { imgPath: data.imgPath }),
          ...(data.datasheetPath && { datasheetPath: data.datasheetPath }),
          // Datos fiscales SAT. satClaveProdServ/satClaveUnidad usan cadena
          // vacia -> undefined (no se envia el atributo) para no pisar el
          // valor con '' cuando el combobox esta vacio en creacion.
          ...(data.satClaveProdServ && { satClaveProdServ: data.satClaveProdServ }),
          ...(data.satClaveUnidad && { satClaveUnidad: data.satClaveUnidad }),
          ...(data.productType !== undefined && { productType: data.productType }),
          // taxRate: null (Exento) es un valor valido, se debe enviar
          // explicitamente. Solo se omite si es undefined (no tocado).
          ...(data.taxRate !== undefined && { taxRate: data.taxRate })
        },
        relationships: {
          unit: {
            data: { type: 'units', id: data.unitId }
          },
          category: {
            data: { type: 'categories', id: data.categoryId }
          },
          brand: {
            data: { type: 'brands', id: data.brandId }
          },
          ...(data.currencyId && {
            currency: {
              data: { type: 'currencies', id: data.currencyId }
            }
          })
        }
      }
    }

    const response = await axios.post(PRODUCTS_ENDPOINT, payload)
    return response.data
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
    const attributes: Record<string, string | boolean | number | null> = {}
    const relationships: Record<string, { data: { type: string; id: string } }> = {}

    if (data.name !== undefined) attributes.name = data.name
    if (data.sku !== undefined) attributes.sku = data.sku
    // description/fullDescription columns are NOT NULL. Coerce null -> ''
    // so the PATCH never produces SQL 1364 if the operator clears the
    // textarea (which yields null in some controlled-input flows).
    if (data.description !== undefined) attributes.description = data.description ?? ''
    if (data.fullDescription !== undefined) attributes.fullDescription = data.fullDescription ?? ''
    if (data.price !== undefined) attributes.price = data.price
    if (data.cost !== undefined) attributes.cost = data.cost
    if (data.iva !== undefined) attributes.iva = data.iva
    if (data.imgPath !== undefined) attributes.imgPath = data.imgPath
    if (data.datasheetPath !== undefined) attributes.datasheetPath = data.datasheetPath
    if (data.satClaveProdServ !== undefined) attributes.satClaveProdServ = data.satClaveProdServ
    if (data.satClaveUnidad !== undefined) attributes.satClaveUnidad = data.satClaveUnidad
    if (data.productType !== undefined) attributes.productType = data.productType
    // taxRate: null (Exento) es valido y debe viajar en el PATCH.
    if (data.taxRate !== undefined) attributes.taxRate = data.taxRate

    if (data.unitId) {
      relationships.unit = { data: { type: 'units', id: data.unitId } }
    }
    if (data.categoryId) {
      relationships.category = { data: { type: 'categories', id: data.categoryId } }
    }
    if (data.brandId) {
      relationships.brand = { data: { type: 'brands', id: data.brandId } }
    }
    if (data.currencyId) {
      relationships.currency = { data: { type: 'currencies', id: data.currencyId } }
    }

    const payload = {
      data: {
        type: 'products',
        id,
        ...(Object.keys(attributes).length > 0 && { attributes }),
        ...(Object.keys(relationships).length > 0 && { relationships })
      }
    }

    const response = await axios.patch(`${PRODUCTS_ENDPOINT}/${id}`, payload)
    return response.data
  },

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${PRODUCTS_ENDPOINT}/${id}`)
  },

  async duplicateProduct(id: string): Promise<ProductResponse> {
    const originalProduct = await this.getProduct(id)
    const productData = originalProduct.data

    const duplicateData: CreateProductRequest = {
      name: `${productData.name} (Copia)`,
      sku: undefined,
      description: productData.description,
      fullDescription: productData.fullDescription,
      price: productData.price,
      cost: productData.cost,
      iva: productData.iva,
      unitId: productData.unitId,
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      currencyId: productData.currencyId,
      satClaveProdServ: productData.satClaveProdServ,
      satClaveUnidad: productData.satClaveUnidad,
      productType: productData.productType,
      taxRate: productData.taxRate
    }

    return this.createProduct(duplicateData)
  },

  /**
   * Upload product image
   * Returns the path to use when creating/updating a product.
   *
   * Bug G fix (2026-05-15): the axios global client defaults Content-Type
   * to application/vnd.api+json (for JSON:API requests). Sending FormData
   * with that header — OR with a bare 'multipart/form-data' override
   * lacking a boundary — leaves PHP unable to parse $_FILES, so Laravel
   * sees the file as missing and emits the `validation.uploaded` key
   * ("The file failed to upload"). Setting Content-Type to undefined here
   * forces axios to delete the inherited header and regenerate
   * multipart/form-data; boundary=... from the FormData itself.
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post('/api/v1/products/upload-image', formData, {
      headers: {
        'Content-Type': undefined,
      },
    })
    return response.data
  },

  /**
   * Upload product datasheet (PDF). See uploadImage above for the
   * Content-Type: undefined rationale (Bug G).
   */
  async uploadDatasheet(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post('/api/v1/products/upload-datasheet', formData, {
      headers: {
        'Content-Type': undefined,
      },
    })
    return response.data
  }
}

export interface BulkToggleResponse {
  message: string
  affected_count: number
}

export interface BulkPriceUpdateResponse {
  message: string
  affected_count: number
  operation: 'increase' | 'decrease'
  percentage: number
}

export const productBulkService = {
  async bulkToggleActive(productIds: number[], isActive: boolean): Promise<BulkToggleResponse> {
    const response = await axios.post('/api/v1/products/bulk-toggle-active', {
      product_ids: productIds,
      is_active: isActive
    })
    return response.data
  },

  async bulkToggleByBrand(brandId: number, isActive: boolean): Promise<BulkToggleResponse> {
    const response = await axios.post('/api/v1/products/bulk-toggle-by-brand', {
      brand_id: brandId,
      is_active: isActive
    })
    return response.data
  },

  async bulkToggleByCategory(categoryId: number, isActive: boolean): Promise<BulkToggleResponse> {
    const response = await axios.post('/api/v1/products/bulk-toggle-by-category', {
      category_id: categoryId,
      is_active: isActive
    })
    return response.data
  },

  async bulkPriceUpdate(brandId: number, percentage: number, operation: 'increase' | 'decrease'): Promise<BulkPriceUpdateResponse> {
    const response = await axios.post('/api/v1/products/bulk-price-update', {
      brand_id: brandId,
      percentage,
      operation
    })
    return response.data
  }
}

/**
 * Response from file upload endpoints
 */
export interface UploadResponse {
  path: string
  url: string
  filename: string
  originalName: string
  mimeType: string
  size: number
}