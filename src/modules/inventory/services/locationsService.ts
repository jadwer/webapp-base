'use client'

/**
 * 📍 LOCATIONS SERVICE - INVENTORY MODULE  
 * API Layer con JSON:API compliance para gestión de ubicaciones de almacén
 * 
 * Features:
 * - JSON:API estándar con relationships (warehouse parent)
 * - Error handling enterprise con FK constraints
 * - Business rules validation para jerarquía
 * - Performance optimización para locations masivas
 * - Warehouse relationship automático
 */

import axiosClient from '@/lib/axiosClient'
import type {
  WarehouseLocation,
  CreateWarehouseLocationData,
  UpdateWarehouseLocationData,  
  WarehouseLocationFilters,
  PaginatedWarehouseLocationsResponse,
  LOCATION_BUSINESS_RULES,
  LocationType,
  LocationStatus,
  PickingPriority,
} from '../types'
import type {
  JsonApiResponse,
  JsonApiResource,
  JsonApiError,
} from '@/modules/products/types/api'

// ===== API ENDPOINTS =====
const API_BASE = '/api/v1'
const ENDPOINTS = {
  locations: `${API_BASE}/warehouse-locations`,
  location: (id: string) => `${API_BASE}/warehouse-locations/${id}`,
  locationsByWarehouse: (warehouseId: string) => `${API_BASE}/warehouses/${warehouseId}/locations`,
  checkCode: (code: string, warehouseId: string) => `${API_BASE}/warehouse-locations/check-code/${code}?warehouse_id=${warehouseId}`,
  hierarchy: (warehouseId: string) => `${API_BASE}/warehouses/${warehouseId}/locations/hierarchy`,
} as const

// ===== JSON:API TRANSFORMERS =====

/**
 * Transforma datos de formulario a formato JSON:API
 * Business Rules aplicadas: code único por warehouse, locationType válido, jerarquía consistente
 */
function transformToJsonApi(data: CreateWarehouseLocationData | UpdateWarehouseLocationData): JsonApiResource {
  return {
    type: 'warehouse-locations',
    id: 'id' in data ? data.id : undefined,
    attributes: {
      // Campos básicos (snake_case para backend)
      name: data.name,
      code: data.code,
      description: data.description || null,
      barcode: data.barcode || null,
      
      // Jerarquía física (snake_case)
      location_type: data.locationType,
      aisle: data.aisle || null,
      rack: data.rack || null,
      shelf: data.shelf || null,
      level: data.level || null,
      position: data.position || null,
      
      // Capacidades físicas
      max_weight: data.maxWeight || null,
      max_volume: data.maxVolume || null,
      max_items: data.maxItems || null,
      dimensions: data.dimensions || null,
      temperature: data.temperature || null,
      humidity: data.humidity || null,
      
      // Configuración operativa
      is_active: data.isActive ?? true,
      is_pickable: data.isPickable ?? true,
      is_receivable: data.isReceivable ?? true,
      is_countable: data.isCountable ?? true,
      is_restricted: data.isRestricted ?? false,
      
      // Prioridades
      picking_priority: data.pickingPriority || 'normal',
      putaway_priority: data.putawayPriority || 5,
      cycle_count_group: data.cycleCountGroup || null,
      
      // Estado
      status: data.status || 'active',
      
      // Metadatos
      metadata: data.metadata || null,
      notes: data.notes || null,
    },
    relationships: 'warehouseId' in data ? {
      warehouse: {
        data: { type: 'warehouses', id: data.warehouseId }
      }
    } : undefined
  }
}

/**
 * Transforma respuesta JSON:API a objeto WarehouseLocation
 * Incluye processing de relationships y computed fields
 */
function transformFromJsonApi(resource: JsonApiResource, included: JsonApiResource[] = []): WarehouseLocation {
  const attrs = resource.attributes as any
  const relationships = resource.relationships || {}
  
  // Buscar warehouse relationship en included
  let warehouse = null
  if (relationships.warehouse?.data) {
    const warehouseResource = included.find(
      item => item.type === 'warehouses' && item.id === relationships.warehouse.data.id
    )
    if (warehouseResource) {
      warehouse = transformWarehouseFromJsonApi(warehouseResource)
    }
  }
  
  // Buscar stock relationship en included (opcional)
  let stock = null
  if (relationships.stock?.data) {
    stock = relationships.stock.data.map((stockRef: any) => {
      const stockResource = included.find(
        item => item.type === 'stocks' && item.id === stockRef.id
      )
      return stockResource ? transformStockFromJsonApi(stockResource) : null
    }).filter(Boolean)
  }
  
  // Construir computed fields
  const fullCode = warehouse ? `${warehouse.code}-${attrs.code}` : attrs.code
  
  const hierarchyParts = [
    attrs.aisle,
    attrs.rack,
    attrs.shelf,
    attrs.level,
    attrs.position
  ].filter(Boolean)
  const hierarchyPath = hierarchyParts.length > 0 ? hierarchyParts.join('/') : null
  
  return {
    id: resource.id,
    
    // Básicos
    name: attrs.name,
    code: attrs.code,
    description: attrs.description,
    barcode: attrs.barcode,
    
    // Jerarquía física (camelCase para frontend)
    locationType: attrs.location_type,
    aisle: attrs.aisle,
    rack: attrs.rack,
    shelf: attrs.shelf,
    level: attrs.level,
    position: attrs.position,
    
    // Capacidades físicas
    maxWeight: attrs.max_weight,
    maxVolume: attrs.max_volume,
    maxItems: attrs.max_items,
    dimensions: attrs.dimensions,
    temperature: attrs.temperature,
    humidity: attrs.humidity,
    
    // Configuración operativa
    isActive: attrs.is_active,
    isPickable: attrs.is_pickable,
    isReceivable: attrs.is_receivable,
    isCountable: attrs.is_countable,
    isRestricted: attrs.is_restricted,
    
    // Prioridades
    pickingPriority: attrs.picking_priority,
    putawayPriority: attrs.putaway_priority,
    cycleCountGroup: attrs.cycle_count_group,
    
    // Estado
    status: attrs.status,
    lastInventoryDate: attrs.last_inventory_date,
    lastMovementDate: attrs.last_movement_date,
    
    // Metadatos
    metadata: attrs.metadata,
    notes: attrs.notes,
    
    // Timestamps
    createdAt: attrs.created_at,
    updatedAt: attrs.updated_at,
    
    // Relationships
    warehouse: warehouse!,
    warehouseId: relationships.warehouse?.data?.id || attrs.warehouse_id,
    stock: stock || undefined,
    
    // Computed fields
    fullCode,
    hierarchyPath,
    utilizationPercentage: attrs.utilization_percentage || 0,
    currentItems: attrs.current_items || 0,
    currentWeight: attrs.current_weight || 0,
    currentVolume: attrs.current_volume || 0,
  }
}

/**
 * Helper: Transforma warehouse desde JsonApi (simplified)
 */
function transformWarehouseFromJsonApi(resource: JsonApiResource): any {
  const attrs = resource.attributes as any
  return {
    id: resource.id,
    name: attrs.name,
    code: attrs.code,
    warehouseType: attrs.warehouse_type,
    isActive: attrs.is_active,
    city: attrs.city,
    country: attrs.country,
  }
}

/**
 * Helper: Transforma stock desde JsonApi (simplified)
 */
function transformStockFromJsonApi(resource: JsonApiResource): any {
  const attrs = resource.attributes as any
  return {
    id: resource.id,
    quantity: attrs.quantity,
    availableQuantity: attrs.available_quantity,
    reservedQuantity: attrs.reserved_quantity,
    status: attrs.status,
  }
}

// ===== FILTERS TRANSFORMER =====

/**
 * Convierte filtros de frontend a query parameters de backend
 */
function transformFiltersToQuery(filters: WarehouseLocationFilters = {}): Record<string, string> {
  const query: Record<string, string> = {}
  
  // Búsqueda unificada
  if (filters.search) {
    query['filter[search]'] = filters.search
  }
  
  // Filtros por warehouse
  if (filters.warehouseId) {
    query['filter[warehouse_id]'] = filters.warehouseId
  }
  
  if (filters.warehouseIds?.length) {
    query['filter[warehouse_id]'] = filters.warehouseIds.join(',')
  }
  
  // Estados básicos
  if (filters.isActive !== undefined) {
    query['filter[is_active]'] = String(filters.isActive)
  }
  
  if (filters.status) {
    query['filter[status]'] = filters.status
  }
  
  if (filters.statuses?.length) {
    query['filter[status]'] = filters.statuses.join(',')
  }
  
  // Configuración operativa
  if (filters.isPickable !== undefined) {
    query['filter[is_pickable]'] = String(filters.isPickable)
  }
  
  if (filters.isReceivable !== undefined) {
    query['filter[is_receivable]'] = String(filters.isReceivable)
  }
  
  if (filters.isCountable !== undefined) {
    query['filter[is_countable]'] = String(filters.isCountable)
  }
  
  if (filters.isRestricted !== undefined) {
    query['filter[is_restricted]'] = String(filters.isRestricted)
  }
  
  // Tipos y jerarquía
  if (filters.locationType) {
    query['filter[location_type]'] = filters.locationType
  }
  
  if (filters.locationTypes?.length) {
    query['filter[location_type]'] = filters.locationTypes.join(',')
  }
  
  if (filters.aisle) {
    query['filter[aisle]'] = filters.aisle
  }
  
  if (filters.aisles?.length) {
    query['filter[aisle]'] = filters.aisles.join(',')
  }
  
  if (filters.rack) {
    query['filter[rack]'] = filters.rack
  }
  
  if (filters.shelf) {
    query['filter[shelf]'] = filters.shelf
  }
  
  if (filters.level) {
    query['filter[level]'] = filters.level
  }
  
  // Prioridades
  if (filters.pickingPriority) {
    query['filter[picking_priority]'] = filters.pickingPriority
  }
  
  if (filters.putawayPriorityMin !== undefined) {
    query['filter[putaway_priority_min]'] = String(filters.putawayPriorityMin)
  }
  
  if (filters.putawayPriorityMax !== undefined) {
    query['filter[putaway_priority_max]'] = String(filters.putawayPriorityMax)
  }
  
  // Capacidades
  if (filters.hasMaxWeight !== undefined) {
    query['filter[has_max_weight]'] = String(filters.hasMaxWeight)
  }
  
  if (filters.hasMaxVolume !== undefined) {
    query['filter[has_max_volume]'] = String(filters.hasMaxVolume)
  }
  
  if (filters.hasTemperature !== undefined) {
    query['filter[has_temperature]'] = String(filters.hasTemperature)
  }
  
  // Fechas y actividad
  if (filters.hasRecentActivity !== undefined) {
    query['filter[has_recent_activity]'] = String(filters.hasRecentActivity)
  }
  
  if (filters.needsInventory !== undefined) {
    query['filter[needs_inventory]'] = String(filters.needsInventory)
  }
  
  if (filters.cycleCountGroup) {
    query['filter[cycle_count_group]'] = filters.cycleCountGroup
  }
  
  // Ordenamiento
  if (filters.sortBy && filters.sortDirection) {
    const sortField = filters.sortBy === 'warehouse' ? 'warehouse.name' : filters.sortBy
    const prefix = filters.sortDirection === 'desc' ? '-' : ''
    query['sort'] = `${prefix}${sortField}`
  }
  
  // Paginación
  if (filters.page !== undefined) {
    query['page[number]'] = String(filters.page)
  }
  
  if (filters.limit !== undefined) {
    query['page[size]'] = String(filters.limit)
  }
  
  return query
}

// ===== API METHODS =====

/**
 * Obtiene lista paginada de warehouse locations
 * Incluye warehouse relationship por defecto
 */
export async function getWarehouseLocations(
  filters: WarehouseLocationFilters = {}
): Promise<PaginatedWarehouseLocationsResponse> {
  try {
    const query = transformFiltersToQuery(filters)
    
    // Incluir warehouse relationship por defecto + stock opcional
    const includes = ['warehouse']
    if (filters.warehouseId) {
      includes.push('stock')
    }
    
    const response = await axiosClient.get<JsonApiResponse>(ENDPOINTS.locations, {
      params: {
        ...query,
        include: includes.join(','),
      }
    })
    
    // Transform response
    const locations = response.data.data.map(resource => 
      transformFromJsonApi(resource, response.data.included || [])
    )
    
    return {
      data: locations,
      meta: response.data.meta || {
        pagination: {
          page: 1,
          pages: 1,
          count: locations.length,
          total: locations.length,
          links: {}
        }
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching warehouse locations:', error)
    throw new Error(`Error al cargar ubicaciones: ${error?.response?.data?.message || error.message}`)
  }
}

/**
 * Obtiene ubicaciones específicas por warehouse
 * Optimizado para selector y navegación jerárquica  
 */
export async function getLocationsByWarehouse(warehouseId: string): Promise<WarehouseLocation[]> {
  try {
    const response = await axiosClient.get<JsonApiResponse>(
      ENDPOINTS.locationsByWarehouse(warehouseId),
      {
        params: {
          include: 'warehouse,stock',
          sort: 'aisle,rack,shelf,level,position',
        }
      }
    )
    
    return response.data.data.map(resource => 
      transformFromJsonApi(resource, response.data.included || [])
    )
    
  } catch (error: any) {
    console.error('❌ Error fetching locations by warehouse:', error)
    throw new Error(`Error al cargar ubicaciones del almacén: ${error?.response?.data?.message || error.message}`)
  }
}

/**
 * Obtiene una warehouse location específica por ID
 */
export async function getWarehouseLocation(id: string): Promise<WarehouseLocation> {
  try {
    const response = await axiosClient.get<JsonApiResponse>(
      ENDPOINTS.location(id),
      {
        params: {
          include: 'warehouse,stock',
        }
      }
    )
    
    if (!response.data.data) {
      throw new Error('Ubicación no encontrada')
    }
    
    return transformFromJsonApi(response.data.data, response.data.included || [])
    
  } catch (error: any) {
    console.error('❌ Error fetching warehouse location:', error)
    
    if (error?.response?.status === 404) {
      throw new Error('Ubicación no encontrada')
    }
    
    throw new Error(`Error al cargar ubicación: ${error?.response?.data?.message || error.message}`)
  }
}

/**
 * Crea nueva warehouse location
 * Aplica business rules y validaciones
 */
export async function createWarehouseLocation(data: CreateWarehouseLocationData): Promise<WarehouseLocation> {
  try {
    // Business rules validation
    validateLocationData(data)
    
    const jsonApiData = {
      data: transformToJsonApi(data)
    }
    
    const response = await axiosClient.post<JsonApiResponse>(
      ENDPOINTS.locations,
      jsonApiData,
      {
        params: {
          include: 'warehouse',
        }
      }
    )
    
    return transformFromJsonApi(response.data.data, response.data.included || [])
    
  } catch (error: any) {
    console.error('❌ Error creating warehouse location:', error)
    
    // Business logic errors
    if (error?.response?.status === 422) {
      const errorData = error.response.data
      if (errorData.errors?.some((e: any) => e.code === 'DUPLICATE_CODE')) {
        throw new Error(`El código "${data.code}" ya existe en este almacén`)
      }
    }
    
    throw new Error(`Error al crear ubicación: ${error?.response?.data?.message || error.message}`)
  }
}

/**
 * Actualiza warehouse location existente
 */
export async function updateWarehouseLocation(
  id: string, 
  data: UpdateWarehouseLocationData
): Promise<WarehouseLocation> {
  try {
    // Business rules validation para updates
    if (data.code || data.locationType || data.isActive !== undefined) {
      validateLocationData(data as any, false)
    }
    
    const jsonApiData = {
      data: transformToJsonApi({ ...data, id } as any)
    }
    
    const response = await axiosClient.patch<JsonApiResponse>(
      ENDPOINTS.location(id),
      jsonApiData,
      {
        params: {
          include: 'warehouse,stock',
        }
      }
    )
    
    return transformFromJsonApi(response.data.data, response.data.included || [])
    
  } catch (error: any) {
    console.error('❌ Error updating warehouse location:', error)
    throw new Error(`Error al actualizar ubicación: ${error?.response?.data?.message || error.message}`)
  }
}

/**
 * Elimina warehouse location
 * Valida que no tenga stock asociado (FK constraints)
 */
export async function deleteWarehouseLocation(id: string): Promise<void> {
  try {
    await axiosClient.delete(ENDPOINTS.location(id))
    
  } catch (error: any) {
    console.error('❌ Error deleting warehouse location:', error)
    
    // FK constraint errors (stock asociado)
    if (error?.response?.status === 409) {
      const errorData = error.response.data
      if (errorData.errors?.some((e: any) => e.code === 'FOREIGN_KEY_CONSTRAINT')) {
        throw new Error('No se puede eliminar la ubicación porque tiene stock asociado')
      }
    }
    
    throw new Error(`Error al eliminar ubicación: ${error?.response?.data?.message || error.message}`)
  }
}

/**
 * Verifica disponibilidad de código en warehouse
 * Para validación en tiempo real
 */
export async function checkLocationCodeAvailable(
  code: string, 
  warehouseId: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const params: any = { warehouse_id: warehouseId }
    if (excludeId) {
      params.exclude_id = excludeId
    }
    
    const response = await axiosClient.get(
      ENDPOINTS.checkCode(code, warehouseId),
      { params }
    )
    
    return response.data.available === true
    
  } catch (error: any) {
    console.error('❌ Error checking location code availability:', error)
    return false // Conservative: asumir no disponible en caso de error
  }
}

/**
 * Obtiene jerarquía de ubicaciones para tree view
 */
export async function getLocationHierarchy(warehouseId: string): Promise<any> {
  try {
    const response = await axiosClient.get(
      ENDPOINTS.hierarchy(warehouseId)
    )
    
    return response.data.data || []
    
  } catch (error: any) {
    console.error('❌ Error fetching location hierarchy:', error)
    throw new Error(`Error al cargar jerarquía: ${error?.response?.data?.message || error.message}`)
  }
}

// ===== VALIDATION HELPERS =====

/**
 * Valida datos de location según business rules
 */
function validateLocationData(data: CreateWarehouseLocationData, isCreate: boolean = true): void {
  const rules = LOCATION_BUSINESS_RULES
  
  // Validaciones básicas
  if (isCreate) {
    if (!data.name?.trim()) {
      throw new Error('El nombre es requerido')
    }
    
    if (!data.code?.trim()) {
      throw new Error('El código es requerido')
    }
    
    if (!data.warehouseId) {
      throw new Error('El almacén es requerido')
    }
    
    if (!data.locationType) {
      throw new Error('El tipo de ubicación es requerido')
    }
  }
  
  // Validaciones de longitud
  if (data.name && (data.name.length < rules.NAME_MIN_LENGTH || data.name.length > rules.NAME_MAX_LENGTH)) {
    throw new Error(`El nombre debe tener entre ${rules.NAME_MIN_LENGTH} y ${rules.NAME_MAX_LENGTH} caracteres`)
  }
  
  if (data.code && (data.code.length < rules.CODE_MIN_LENGTH || data.code.length > rules.CODE_MAX_LENGTH)) {
    throw new Error(`El código debe tener entre ${rules.CODE_MIN_LENGTH} y ${rules.CODE_MAX_LENGTH} caracteres`)
  }
  
  // Validaciones de capacidad
  if (data.maxWeight !== undefined && (data.maxWeight < 0 || data.maxWeight > rules.MAX_WEIGHT_LIMIT)) {
    throw new Error(`El peso máximo debe estar entre 0 y ${rules.MAX_WEIGHT_LIMIT} kg`)
  }
  
  if (data.maxVolume !== undefined && (data.maxVolume < 0 || data.maxVolume > rules.MAX_VOLUME_LIMIT)) {
    throw new Error(`El volumen máximo debe estar entre 0 y ${rules.MAX_VOLUME_LIMIT} m³`)
  }
  
  // Validaciones de temperatura
  if (data.temperature !== undefined && (data.temperature < rules.TEMPERATURE_MIN || data.temperature > rules.TEMPERATURE_MAX)) {
    throw new Error(`La temperatura debe estar entre ${rules.TEMPERATURE_MIN}°C y ${rules.TEMPERATURE_MAX}°C`)
  }
  
  // Validaciones operativas
  if (data.isPickable !== undefined && data.isReceivable !== undefined) {
    if (!data.isPickable && !data.isReceivable) {
      throw new Error('Una ubicación debe ser pickable, receivable, o ambas')
    }
  }
  
  // Validaciones de enum
  if (data.locationType && !rules.VALID_LOCATION_TYPES.includes(data.locationType)) {
    throw new Error(`Tipo de ubicación inválido: ${data.locationType}`)
  }
  
  if (data.status && !rules.VALID_STATUSES.includes(data.status)) {
    throw new Error(`Estado de ubicación inválido: ${data.status}`)
  }
  
  if (data.pickingPriority && !rules.VALID_PRIORITIES.includes(data.pickingPriority)) {
    throw new Error(`Prioridad de picking inválida: ${data.pickingPriority}`)
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Formatea jerarquía de ubicación para display
 */
export function formatLocationHierarchy(location: WarehouseLocation): string {
  const parts = []
  
  if (location.aisle) parts.push(`Pasillo ${location.aisle}`)
  if (location.rack) parts.push(`Rack ${location.rack}`)
  if (location.shelf) parts.push(`Estante ${location.shelf}`)
  if (location.level) parts.push(`Nivel ${location.level}`)
  if (location.position) parts.push(`Posición ${location.position}`)
  
  return parts.length > 0 ? parts.join(' → ') : location.name
}

/**
 * Obtiene label de tipo de ubicación
 */
export function getLocationTypeLabel(type: LocationType): string {
  const labels: Record<LocationType, string> = {
    zone: 'Zona',
    aisle: 'Pasillo',
    rack: 'Rack',
    shelf: 'Estante',
    bin: 'Contenedor',
    floor: 'Suelo',
    dock: 'Muelle',
    staging: 'Preparación',
    quarantine: 'Cuarentena',
    returns: 'Devoluciones',
    bulk: 'Granel',
    picking: 'Picking',
    packing: 'Empaque',
    receiving: 'Recepción',
    shipping: 'Envío',
  }
  
  return labels[type] || type
}

/**
 * Obtiene label de estado de ubicación
 */
export function getLocationStatusLabel(status: LocationStatus): string {
  const labels: Record<LocationStatus, string> = {
    available: 'Disponible',
    occupied: 'Ocupado',
    reserved: 'Reservado',
    maintenance: 'Mantenimiento',
  }
  
  return labels[status] || status
}

/**
 * Obtiene color de prioridad para UI
 */
export function getPickingPriorityColor(priority: PickingPriority): string {
  const colors: Record<PickingPriority, string> = {
    critical: 'danger',
    high: 'warning',
    normal: 'primary',
    low: 'info',
    bulk: 'secondary',
  }
  
  return colors[priority] || 'secondary'
}

/**
 * Formatea el código de ubicación con warehouse prefix
 */
export function formatLocationCode(location: WarehouseLocation): string {
  const warehouseCode = location.warehouse?.code || 'XXX'
  return `${warehouseCode}-${location.code}`
}

/**
 * Genera display de jerarquía visual
 */
export function getLocationHierarchyDisplay(location: WarehouseLocation): string | null {
  const parts: string[] = []
  
  if (location.aisle) parts.push(`Pasillo ${location.aisle}`)
  if (location.rack) parts.push(`Rack ${location.rack}`)
  if (location.shelf) parts.push(`Estante ${location.shelf}`)
  if (location.level) parts.push(`Nivel ${location.level}`)
  if (location.position) parts.push(`Pos. ${location.position}`)
  
  return parts.length > 0 ? parts.join(' → ') : null
}

// ===== DEFAULT EXPORT =====

/**
 * Service object con todos los métodos
 * Para importación conveniente
 */
export const locationsService = {
  // CRUD operations
  getAll: getWarehouseLocations,
  getById: getWarehouseLocation,
  getByWarehouse: getLocationsByWarehouse,
  create: createWarehouseLocation,
  update: updateWarehouseLocation,
  delete: deleteWarehouseLocation,
  
  // Validations
  checkCodeAvailable: checkLocationCodeAvailable,
  
  // Hierarchy
  getHierarchy: getLocationHierarchy,
  
  // Formatters
  formatHierarchy: formatLocationHierarchy,
  getTypeLabel: getLocationTypeLabel,
  getStatusLabel: getLocationStatusLabel,
  getPriorityColor: getPickingPriorityColor,
} as const

export default locationsService