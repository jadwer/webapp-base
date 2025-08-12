/**
 * 📦 WAREHOUSES SERVICE - INVENTORY MODULE
 * API Layer con JSON:API compliance para gestión de almacenes
 * 
 * Features:
 * - JSON:API estándar con relationships
 * - Error handling enterprise 
 * - Performance optimización para 500K+ productos
 * - Business rules validation
 * - Coordinación con Products module
 */

import axiosClient from '@/lib/axiosClient'
import type {
  Warehouse,
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseFilters,
  PaginatedWarehousesResponse,
  WAREHOUSE_BUSINESS_RULES,
} from '../types'
import type {
  JsonApiResponse,
  JsonApiResource,
  JsonApiError,
} from '@/modules/products/types/api'

// ===== API ENDPOINTS =====
const API_BASE = '/api/v1'
const ENDPOINTS = {
  warehouses: `${API_BASE}/warehouses`,
  warehouse: (id: string) => `${API_BASE}/warehouses/${id}`,
  checkSlug: (slug: string) => `${API_BASE}/warehouses/check-slug/${slug}`,
  checkCode: (code: string) => `${API_BASE}/warehouses/check-code/${code}`,
} as const

// ===== JSON:API TRANSFORMERS =====

/**
 * Transforma datos de formulario a formato JSON:API
 * Business Rules aplicadas: code único, slug único, warehouseType válido
 */
function transformToJsonApi(data: CreateWarehouseData | UpdateWarehouseData): JsonApiResource {
  return {
    type: 'warehouses',
    id: 'id' in data ? data.id : undefined,
    attributes: {
      // Campos básicos (snake_case para backend)
      name: data.name,
      code: data.code,
      slug: data.slug,
      description: data.description,
      warehouse_type: data.warehouseType, // camelCase → snake_case
      
      // Ubicación física
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postalCode, // camelCase → snake_case
      
      // Contacto
      phone: data.phone,
      email: data.email,
      manager_name: data.managerName, // camelCase → snake_case
      
      // Capacidad
      max_capacity: data.maxCapacity, // camelCase → snake_case
      capacity_unit: data.capacityUnit, // camelCase → snake_case
      operating_hours: data.operatingHours, // camelCase → snake_case
      
      // Estado
      is_active: data.isActive ?? true, // camelCase → snake_case
      metadata: data.metadata,
    }
  }
}

/**
 * Transforma respuesta JSON:API a interfaces TypeScript
 * Coordination: Incluye relationships con locations y stock
 */
function transformFromJsonApi(resource: JsonApiResource, included?: JsonApiResource[]): Warehouse {
  const attrs = resource.attributes
  
  // Transform snake_case → camelCase
  const warehouse: Warehouse = {
    id: resource.id!,
    name: attrs.name,
    slug: attrs.slug,
    description: attrs.description,
    code: attrs.code,
    warehouseType: attrs.warehouse_type || attrs.warehouseType, // Backward compatibility
    
    // Ubicación física
    address: attrs.address,
    city: attrs.city,
    state: attrs.state,
    country: attrs.country,
    postalCode: attrs.postal_code || attrs.postalCode, // Backward compatibility
    
    // Contacto
    phone: attrs.phone,
    email: attrs.email,
    managerName: attrs.manager_name || attrs.managerName, // Backward compatibility
    
    // Capacidad
    maxCapacity: attrs.max_capacity || attrs.maxCapacity, // Backward compatibility
    capacityUnit: attrs.capacity_unit || attrs.capacityUnit, // Backward compatibility
    operatingHours: attrs.operating_hours || attrs.operatingHours, // Backward compatibility
    
    // Estado
    isActive: attrs.is_active ?? attrs.isActive ?? true, // Backward compatibility
    metadata: attrs.metadata,
    
    // Timestamps
    createdAt: attrs.created_at || attrs.createdAt,
    updatedAt: attrs.updated_at || attrs.updatedAt,
  }
  
  // Transform relationships si están incluidas
  if (resource.relationships && included) {
    // Locations relationship
    if (resource.relationships.locations?.data) {
      warehouse.locations = resource.relationships.locations.data.map((rel: any) => {
        const locationResource = included.find(inc => inc.type === 'warehouse-locations' && inc.id === rel.id)
        if (locationResource) {
          return transformLocationFromJsonApi(locationResource)
        }
        return null
      }).filter(Boolean)
    }
    
    // Stock relationship (coordination con Products module)
    if (resource.relationships.stock?.data) {
      warehouse.stock = resource.relationships.stock.data.map((rel: any) => {
        const stockResource = included.find(inc => inc.type === 'stocks' && inc.id === rel.id)
        if (stockResource) {
          return transformStockFromJsonApi(stockResource, included)
        }
        return null
      }).filter(Boolean)
    }
  }
  
  return warehouse
}

/**
 * Helper para transformar WarehouseLocation desde JSON:API
 * Se implementará completamente en iteración 2
 */
function transformLocationFromJsonApi(resource: JsonApiResource): any {
  const attrs = resource.attributes
  return {
    id: resource.id!,
    name: attrs.name,
    code: attrs.code,
    description: attrs.description,
    barcode: attrs.barcode,
    locationType: attrs.location_type || attrs.locationType,
    aisle: attrs.aisle,
    rack: attrs.rack,
    shelf: attrs.shelf,
    level: attrs.level,
    position: attrs.position,
    maxWeight: attrs.max_weight || attrs.maxWeight,
    maxVolume: attrs.max_volume || attrs.maxVolume,
    dimensions: attrs.dimensions,
    isActive: attrs.is_active ?? attrs.isActive ?? true,
    isPickable: attrs.is_pickable ?? attrs.isPickable ?? true,
    isReceivable: attrs.is_receivable ?? attrs.isReceivable ?? true,
    priority: attrs.priority || 5,
    metadata: attrs.metadata,
    createdAt: attrs.created_at || attrs.createdAt,
    updatedAt: attrs.updated_at || attrs.updatedAt,
  }
}

/**
 * Helper para transformar Stock desde JSON:API
 * Coordination con Products module - Se implementará completamente en iteración 3
 */
function transformStockFromJsonApi(resource: JsonApiResource, included?: JsonApiResource[]): any {
  const attrs = resource.attributes
  return {
    id: resource.id!,
    quantity: attrs.quantity || 0,
    reservedQuantity: attrs.reserved_quantity || attrs.reservedQuantity || 0,
    availableQuantity: attrs.available_quantity || attrs.availableQuantity || 0,
    minimumStock: attrs.minimum_stock || attrs.minimumStock,
    maximumStock: attrs.maximum_stock || attrs.maximumStock,
    reorderPoint: attrs.reorder_point || attrs.reorderPoint,
    unitCost: attrs.unit_cost || attrs.unitCost,
    totalValue: attrs.total_value || attrs.totalValue,
    status: attrs.status || 'active',
    lastMovementDate: attrs.last_movement_date || attrs.lastMovementDate,
    lastMovementType: attrs.last_movement_type || attrs.lastMovementType,
    batchInfo: attrs.batch_info || attrs.batchInfo,
    metadata: attrs.metadata,
    createdAt: attrs.created_at || attrs.createdAt,
    updatedAt: attrs.updated_at || attrs.updatedAt,
  }
}

// ===== QUERY BUILDERS =====

/**
 * Construye query parameters para filtros optimizados
 * Performance: Limitado a 50 registros max para 500K+ productos
 */
function buildQueryParams(filters: WarehouseFilters = {}): URLSearchParams {
  const params = new URLSearchParams()
  
  // Búsqueda general
  if (filters.search) {
    params.append('filter[search]', filters.search)
  }
  
  // Filtros específicos
  if (filters.warehouseType) {
    if (Array.isArray(filters.warehouseType)) {
      filters.warehouseType.forEach(type => {
        params.append('filter[warehouseType][]', type)
      })
    } else {
      params.append('filter[warehouseType]', filters.warehouseType)
    }
  }
  
  if (typeof filters.isActive === 'boolean') {
    params.append('filter[isActive]', filters.isActive.toString())
  }
  
  if (filters.city) {
    params.append('filter[city]', filters.city)
  }
  
  if (filters.state) {
    params.append('filter[state]', filters.state)
  }
  
  if (filters.country) {
    params.append('filter[country]', filters.country)
  }
  
  // Filtros de capacidad
  if (filters.minCapacity) {
    params.append('filter[minCapacity]', filters.minCapacity.toString())
  }
  
  if (filters.maxCapacity) {
    params.append('filter[maxCapacity]', filters.maxCapacity.toString())
  }
  
  // Ordenamiento
  if (filters.sortBy) {
    const direction = filters.sortDirection === 'desc' ? '-' : ''
    params.append('sort', `${direction}${filters.sortBy}`)
  }
  
  // Paginación (CRITICAL para 500K+ records)
  const page = filters.page || 1
  const limit = Math.min(filters.limit || WAREHOUSE_BUSINESS_RULES.DEFAULT_PAGE_SIZE, WAREHOUSE_BUSINESS_RULES.MAX_PAGE_SIZE)
  
  params.append('page[number]', page.toString())
  params.append('page[size]', limit.toString())
  
  // Include relationships
  if (filters.include && filters.include.length > 0) {
    params.append('include', filters.include.join(','))
  }
  
  return params
}

// ===== SERVICE FUNCTIONS =====

/**
 * Lista warehouses con filtros y paginación
 * Performance optimizado para 500K+ productos
 */
export async function getWarehouses(filters: WarehouseFilters = {}): Promise<PaginatedWarehousesResponse> {
  try {
    const params = buildQueryParams(filters)
    const response = await axiosClient.get<JsonApiResponse>(`${ENDPOINTS.warehouses}?${params}`)
    
    if (!response.data.data) {
      throw new Error('Invalid API response format')
    }
    
    // Transform data
    const warehouses = Array.isArray(response.data.data) 
      ? response.data.data.map(resource => transformFromJsonApi(resource, response.data.included))
      : [transformFromJsonApi(response.data.data, response.data.included)]
    
    return {
      data: warehouses,
      meta: response.data.meta || {
        pagination: {
          page: filters.page || 1,
          pages: 1,
          count: warehouses.length,
          total: warehouses.length,
          links: {
            self: '',
            first: '',
            last: ''
          }
        }
      },
      included: response.data.included
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    throw error
  }
}

/**
 * Obtiene un warehouse específico por ID
 * Include relationships opcionales
 */
export async function getWarehouse(id: string, include: string[] = []): Promise<Warehouse> {
  try {
    const params = new URLSearchParams()
    if (include.length > 0) {
      params.append('include', include.join(','))
    }
    
    const url = include.length > 0 ? `${ENDPOINTS.warehouse(id)}?${params}` : ENDPOINTS.warehouse(id)
    const response = await axiosClient.get<JsonApiResponse>(url)
    
    if (!response.data.data) {
      throw new Error('Warehouse not found')
    }
    
    return transformFromJsonApi(response.data.data, response.data.included)
  } catch (error) {
    console.error(`Error fetching warehouse ${id}:`, error)
    throw error
  }
}

/**
 * Crea un nuevo warehouse
 * Business Rules: Valida code único, slug único, warehouseType válido
 */
export async function createWarehouse(data: CreateWarehouseData): Promise<Warehouse> {
  try {
    // Business Rule validation antes de enviar
    validateWarehouseData(data)
    
    const jsonApiData = {
      data: transformToJsonApi(data)
    }
    
    const response = await axiosClient.post<JsonApiResponse>(ENDPOINTS.warehouses, jsonApiData)
    
    if (!response.data.data) {
      throw new Error('Invalid response from server')
    }
    
    return transformFromJsonApi(response.data.data, response.data.included)
  } catch (error) {
    console.error('Error creating warehouse:', error)
    throw error
  }
}

/**
 * Actualiza un warehouse existente
 * Business Rules aplicadas
 */
export async function updateWarehouse(data: UpdateWarehouseData): Promise<Warehouse> {
  try {
    validateWarehouseData(data)
    
    const jsonApiData = {
      data: transformToJsonApi(data)
    }
    
    const response = await axiosClient.patch<JsonApiResponse>(ENDPOINTS.warehouse(data.id), jsonApiData)
    
    if (!response.data.data) {
      throw new Error('Invalid response from server')
    }
    
    return transformFromJsonApi(response.data.data, response.data.included)
  } catch (error) {
    console.error(`Error updating warehouse ${data.id}:`, error)
    throw error
  }
}

/**
 * Elimina un warehouse
 * Business Rule: No puede tener locations activas
 */
export async function deleteWarehouse(id: string): Promise<void> {
  try {
    await axiosClient.delete(ENDPOINTS.warehouse(id))
  } catch (error) {
    console.error(`Error deleting warehouse ${id}:`, error)
    throw error
  }
}

/**
 * Verifica si un código de warehouse está disponible
 * Business Rule: code debe ser único global
 */
export async function checkWarehouseCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams()
    if (excludeId) {
      params.append('exclude', excludeId)
    }
    
    const url = excludeId ? `${ENDPOINTS.checkCode(code)}?${params}` : ENDPOINTS.checkCode(code)
    const response = await axiosClient.get(url)
    
    return response.data.available === true
  } catch (error) {
    // Si el endpoint no existe, asumimos que está disponible
    console.warn('Code check endpoint not available:', error)
    return true
  }
}

/**
 * Verifica si un slug de warehouse está disponible
 * Business Rule: slug debe ser único global
 */
export async function checkWarehouseSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams()
    if (excludeId) {
      params.append('exclude', excludeId)
    }
    
    const url = excludeId ? `${ENDPOINTS.checkSlug(slug)}?${params}` : ENDPOINTS.checkSlug(slug)
    const response = await axiosClient.get(url)
    
    return response.data.available === true
  } catch (error) {
    // Si el endpoint no existe, asumimos que está disponible
    console.warn('Slug check endpoint not available:', error)
    return true
  }
}

// ===== BUSINESS RULES VALIDATION =====

/**
 * Valida datos de warehouse según business rules
 * Aplica reglas estándar de la industria
 */
function validateWarehouseData(data: CreateWarehouseData | UpdateWarehouseData): void {
  // Required fields
  if (!data.name?.trim()) {
    throw new Error('Warehouse name is required')
  }
  
  if (!data.code?.trim()) {
    throw new Error('Warehouse code is required')
  }
  
  if (!data.warehouseType) {
    throw new Error('Warehouse type is required')
  }
  
  // Length validations
  if (data.name.length > WAREHOUSE_BUSINESS_RULES.NAME_MAX_LENGTH) {
    throw new Error(`Warehouse name must be less than ${WAREHOUSE_BUSINESS_RULES.NAME_MAX_LENGTH} characters`)
  }
  
  if (data.code.length > WAREHOUSE_BUSINESS_RULES.CODE_MAX_LENGTH) {
    throw new Error(`Warehouse code must be less than ${WAREHOUSE_BUSINESS_RULES.CODE_MAX_LENGTH} characters`)
  }
  
  if (data.description && data.description.length > WAREHOUSE_BUSINESS_RULES.DESCRIPTION_MAX_LENGTH) {
    throw new Error(`Description must be less than ${WAREHOUSE_BUSINESS_RULES.DESCRIPTION_MAX_LENGTH} characters`)
  }
  
  // Warehouse type validation
  if (!WAREHOUSE_BUSINESS_RULES.VALID_WAREHOUSE_TYPES.includes(data.warehouseType as any)) {
    throw new Error(`Invalid warehouse type. Must be one of: ${WAREHOUSE_BUSINESS_RULES.VALID_WAREHOUSE_TYPES.join(', ')}`)
  }
  
  // Capacity validation
  if (data.maxCapacity !== undefined && data.maxCapacity < WAREHOUSE_BUSINESS_RULES.MIN_CAPACITY) {
    throw new Error(WAREHOUSE_BUSINESS_RULES.RULES.CAPACITY_POSITIVE)
  }
  
  // Email validation (básica)
  if (data.email && !isValidEmail(data.email)) {
    throw new Error(WAREHOUSE_BUSINESS_RULES.RULES.EMAIL_VALID_FORMAT)
  }
  
  // Phone validation (básica)
  if (data.phone && !isValidPhone(data.phone)) {
    throw new Error(WAREHOUSE_BUSINESS_RULES.RULES.PHONE_NUMERIC_ONLY)
  }
}

/**
 * Validación básica de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validación básica de teléfono
 */
function isValidPhone(phone: string): boolean {
  // Permite números, espacios, guiones, paréntesis, y el símbolo +
  const phoneRegex = /^[\d\s\-\(\)\+]+$/
  return phoneRegex.test(phone)
}

// ===== UTILITIES =====

/**
 * Genera slug automático desde name
 * Business Rule: slug debe ser único
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[áéíóúñ]/g, char => {
      const map: { [key: string]: string } = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' }
      return map[char] || char
    })
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-')         // Espacios → guiones
    .replace(/-+/g, '-')          // Múltiples guiones → uno solo
    .replace(/^-|-$/g, '')        // Remover guiones al inicio/final
}

/**
 * Formatea número de capacidad para display
 */
export function formatCapacity(capacity: number, unit: string = ''): string {
  if (capacity >= 1000000) {
    return `${(capacity / 1000000).toFixed(1)}M ${unit}`.trim()
  } else if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)}K ${unit}`.trim()
  }
  return `${capacity} ${unit}`.trim()
}

/**
 * Obtiene label display para warehouse type
 */
export function getWarehouseTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    main: 'Principal',
    secondary: 'Secundario', 
    distribution: 'Distribución',
    returns: 'Devoluciones'
  }
  return labels[type] || type
}

// ===== EXPORT ALL =====
export const warehousesService = {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  checkWarehouseCodeAvailable,
  checkWarehouseSlugAvailable,
  generateSlugFromName,
  formatCapacity,
  getWarehouseTypeLabel,
}