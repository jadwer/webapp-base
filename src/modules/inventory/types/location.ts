/**
 * 📍 WAREHOUSE LOCATION TYPES - INVENTORY MODULE
 * Types completos para WarehouseLocation con jerarquía y validaciones
 * 
 * Features:
 * - Interface completa con 15+ campos
 * - Jerarquía visual (aisle → rack → shelf → level → position)
 * - Business rules y validaciones
 * - Coordination con Warehouse parent
 * - API DTOs y filtros especializados
 */

import type { Warehouse } from './warehouse'
import type { Stock } from './warehouse' // Re-export para consistency
import type { JsonApiResource, PaginationMeta, SortDirection } from './warehouse'

// ===== LOCATION TYPES ENUM =====

/**
 * Tipos de ubicación dentro de un almacén
 * Jerarquía típica de warehouse management
 */
export type LocationType = 
  | 'zone'          // Zona general del almacén
  | 'aisle'         // Pasillo
  | 'rack'          // Estante/estructura
  | 'shelf'         // Estantería dentro del rack  
  | 'bin'           // Contenedor/cajón específico
  | 'floor'         // Ubicación en el suelo
  | 'dock'          // Muelle de carga/descarga
  | 'staging'       // Área de staging/preparación
  | 'quarantine'    // Cuarentena/hold area
  | 'returns'       // Área de devoluciones
  | 'bulk'          // Almacenamiento a granel
  | 'picking'       // Área de picking
  | 'packing'       // Área de empaque
  | 'receiving'     // Área de recepción
  | 'shipping'      // Área de envío

/**
 * Estados operativos de ubicación
 */
export type LocationStatus = 
  | 'available'     // Disponible para uso
  | 'occupied'      // Ocupada con mercancía
  | 'reserved'      // Reservada para operación específica
  | 'maintenance'   // En mantenimiento

/**
 * Niveles de prioridad para picking
 */
export type PickingPriority = 
  | 'critical'      // Prioridad crítica (1)
  | 'high'          // Alta prioridad (2-3)
  | 'normal'        // Prioridad normal (4-6)
  | 'low'           // Baja prioridad (7-8)
  | 'bulk'          // Picking a granel (9-10)

// ===== MAIN INTERFACE =====

/**
 * Interface completa para WarehouseLocation
 * Representa una ubicación específica dentro de un almacén
 * 
 * Relationships:
 * - BelongsTo: Warehouse (parent)
 * - HasMany: Stock (items almacenados en esta ubicación)
 */
export interface WarehouseLocation {
  // ===== IDENTIFICACIÓN =====
  id: string
  name: string                    // Nombre descriptivo de la ubicación
  code: string                   // Código único dentro del warehouse
  description?: string           // Descripción opcional
  barcode?: string              // Código de barras para scanning
  
  // ===== JERARQUÍA FÍSICA =====
  locationType: LocationType    // Tipo de ubicación
  aisle?: string               // Pasillo (ej: "A", "B", "01", "02")
  rack?: string                // Rack/Estante (ej: "R1", "R2", "001")
  shelf?: string               // Estantería (ej: "S1", "S2", "A", "B")
  level?: string               // Nivel/Piso (ej: "1", "2", "Ground", "Mezzanine")
  position?: string            // Posición específica (ej: "001", "A1", "Left")
  
  // ===== CAPACIDADES FÍSICAS =====
  maxWeight?: number           // Peso máximo soportado (kg)
  maxVolume?: number          // Volumen máximo (m³)
  maxItems?: number           // Número máximo de items/SKUs
  dimensions?: string         // Dimensiones físicas (LxWxH)
  temperature?: number        // Temperatura requerida (°C)
  humidity?: number          // Humedad relativa (%)
  
  // ===== CONFIGURACIÓN OPERATIVA =====
  isActive: boolean           // Ubicación operativa
  isPickable: boolean        // Permite picking de productos
  isReceivable: boolean      // Permite recepción de productos  
  isCountable: boolean       // Incluir en conteos de inventario
  isRestricted: boolean      // Acceso restringido
  
  // ===== PRIORIDADES Y FLUJO =====
  pickingPriority: PickingPriority  // Prioridad para picking
  putawayPriority?: number          // Prioridad para putaway (1-10)
  cycleCountGroup?: string          // Grupo para cycle counting
  
  // ===== ESTADO Y TRACKING =====
  status: LocationStatus      // Estado operativo actual
  lastInventoryDate?: string  // Último conteo de inventario
  lastMovementDate?: string   // Último movimiento registrado
  
  // ===== METADATOS =====
  metadata?: Record<string, any>    // Datos adicionales JSON
  notes?: string                    // Notas administrativas
  
  // ===== TIMESTAMPS =====
  createdAt: string
  updatedAt: string
  
  // ===== RELATIONSHIPS =====
  warehouse: Warehouse        // Warehouse parent (BelongsTo)
  warehouseId: string        // FK al warehouse
  stock?: Stock[]            // Items almacenados (HasMany)
  
  // ===== COMPUTED FIELDS =====
  fullCode?: string          // Código completo: warehouse.code + "-" + code
  hierarchyPath?: string     // Path jerarquico: "A/R1/S2/L1/P001"
  utilizationPercentage?: number  // Porcentaje de utilización (calculado)
  currentItems?: number      // Número actual de items (calculado)
  currentWeight?: number     // Peso actual total (calculado)
  currentVolume?: number     // Volumen ocupado actual (calculado)
}

// ===== BUSINESS RULES =====

/**
 * Reglas de negocio para WarehouseLocations
 * Validaciones y constraints del dominio
 */
export const LOCATION_BUSINESS_RULES = {
  // Códigos y nombres
  CODE_MIN_LENGTH: 1,
  CODE_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  
  // Jerarquía física
  AISLE_MAX_LENGTH: 10,
  RACK_MAX_LENGTH: 10, 
  SHELF_MAX_LENGTH: 10,
  LEVEL_MAX_LENGTH: 10,
  POSITION_MAX_LENGTH: 20,
  
  // Capacidades
  MAX_WEIGHT_LIMIT: 100000,      // 100 toneladas
  MAX_VOLUME_LIMIT: 10000,       // 10,000 m³
  MAX_ITEMS_LIMIT: 100000,       // 100K items
  TEMPERATURE_MIN: -50,          // -50°C
  TEMPERATURE_MAX: 60,           // 60°C
  HUMIDITY_MIN: 0,               // 0%
  HUMIDITY_MAX: 100,             // 100%
  
  // Prioridades
  PRIORITY_MIN: 1,
  PRIORITY_MAX: 10,
  
  // Validaciones de estado
  VALID_LOCATION_TYPES: [
    'zone', 'aisle', 'rack', 'shelf', 'bin', 'floor', 
    'dock', 'staging', 'quarantine', 'returns', 'bulk',
    'picking', 'packing', 'receiving', 'shipping'
  ] as LocationType[],
  
  VALID_STATUSES: [
    'available', 'occupied', 'reserved', 'maintenance'
  ] as LocationStatus[],
  
  VALID_PRIORITIES: [
    'critical', 'high', 'normal', 'low', 'bulk'
  ] as PickingPriority[],
  
  // Reglas operativas
  OPERATIONAL_RULES: {
    // Si isPickable = false, no se puede usar para picking
    // Si isReceivable = false, no se puede recibir mercancía
    // Si isActive = false, no se puede usar para ninguna operación
    // isCountable determina si se incluye en inventarios
    PICKABLE_REQUIRES_ACTIVE: true,
    RECEIVABLE_REQUIRES_ACTIVE: true,
    COUNTABLE_REQUIRES_ACTIVE: true,
  }
} as const

// ===== API DTOS =====

/**
 * DTO para crear nueva WarehouseLocation
 */
export interface CreateWarehouseLocationData {
  name: string
  code: string
  description?: string
  warehouseId: string           // Required: parent warehouse
  
  // Jerarquía (opcional pero recomendada)
  locationType: LocationType
  aisle?: string
  rack?: string
  shelf?: string
  level?: string
  position?: string
  
  // Capacidades (opcional)
  maxWeight?: number
  maxVolume?: number
  maxItems?: number
  dimensions?: string
  temperature?: number
  humidity?: number
  
  // Configuración operativa
  isActive?: boolean            // default: true
  isPickable?: boolean         // default: true
  isReceivable?: boolean       // default: true
  isCountable?: boolean        // default: true
  isRestricted?: boolean       // default: false
  
  // Prioridades
  pickingPriority?: PickingPriority  // default: 'normal'
  putawayPriority?: number          // default: 5
  cycleCountGroup?: string
  
  // Estado inicial
  status?: LocationStatus       // default: 'active'
  
  // Metadatos
  metadata?: Record<string, any>
  notes?: string
  barcode?: string
}

/**
 * DTO para actualizar WarehouseLocation existente
 */
export interface UpdateWarehouseLocationData {
  name?: string
  description?: string
  
  // Jerarquía modificable
  aisle?: string
  rack?: string
  shelf?: string
  level?: string
  position?: string
  
  // Capacidades modificables
  maxWeight?: number
  maxVolume?: number
  maxItems?: number
  dimensions?: string
  temperature?: number
  humidity?: number
  
  // Configuración operativa modificable
  isActive?: boolean
  isPickable?: boolean
  isReceivable?: boolean
  isCountable?: boolean
  isRestricted?: boolean
  
  // Prioridades modificables
  pickingPriority?: PickingPriority
  putawayPriority?: number
  cycleCountGroup?: string
  
  // Estado modificable
  status?: LocationStatus
  
  // Metadatos modificables
  metadata?: Record<string, any>
  notes?: string
  barcode?: string
}

// ===== FILTERS =====

/**
 * Filtros especializados para WarehouseLocations
 * Incluye filtros por warehouse parent y jerarquía
 */
export interface WarehouseLocationFilters {
  // Básicos
  search?: string              // Búsqueda en name, code, description
  warehouseId?: string        // Filtro por warehouse parent
  warehouseIds?: string[]     // Múltiples warehouses
  
  // Estados
  isActive?: boolean
  status?: LocationStatus
  statuses?: LocationStatus[]
  
  // Configuración operativa
  isPickable?: boolean
  isReceivable?: boolean  
  isCountable?: boolean
  isRestricted?: boolean
  
  // Tipos y jerarquía
  locationType?: LocationType
  locationTypes?: LocationType[]
  aisle?: string
  aisles?: string[]
  rack?: string
  racks?: string[]
  shelf?: string
  level?: string
  
  // Prioridades
  pickingPriority?: PickingPriority
  pickingPriorities?: PickingPriority[]
  putawayPriorityMin?: number
  putawayPriorityMax?: number
  
  // Capacidades
  hasMaxWeight?: boolean       // Locations with weight limit
  hasMaxVolume?: boolean      // Locations with volume limit
  hasTemperature?: boolean    // Temperature controlled
  
  // Fechas y actividad
  hasRecentActivity?: boolean  // Movimientos recientes
  needsInventory?: boolean     // Requiere conteo
  cycleCountGroup?: string
  
  // Ordenamiento
  sortBy?: 'name' | 'code' | 'warehouse' | 'type' | 'priority' | 'status' | 'createdAt'
  sortDirection?: SortDirection
  
  // Paginación (heredada)
  page?: number
  limit?: number
}

// ===== API RESPONSES =====

/**
 * Respuesta paginada de WarehouseLocations
 */
export interface PaginatedWarehouseLocationsResponse {
  data: WarehouseLocation[]
  meta: PaginationMeta
}

/**
 * Response single WarehouseLocation con relationships
 */
export interface WarehouseLocationResponse {
  data: WarehouseLocation
}

/**
 * WarehouseLocation como JsonApiResource
 */
export interface WarehouseLocationResource extends JsonApiResource {
  type: 'warehouse-locations'
  attributes: Omit<WarehouseLocation, 'id' | 'warehouse' | 'stock'>
  relationships?: {
    warehouse: {
      data: { type: 'warehouses', id: string }
    }
    stock?: {
      data: Array<{ type: 'stocks', id: string }>
    }
  }
}

// ===== UI STATE TYPES =====

/**
 * Estado de loading para WarehouseLocations
 */
export interface LocationLoadingState {
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoadingWarehouses: boolean  // Para warehouse selector
}

/**
 * Métricas de WarehouseLocations para dashboard
 */
export interface LocationMetrics {
  totalLocations: number
  activeLocations: number
  pickableLocations: number
  receivableLocations: number
  blockedLocations: number
  utilizationPercentage: number
  locationsByWarehouse: Record<string, number>
  locationsByType: Record<LocationType, number>
  locationsByStatus: Record<LocationStatus, number>
  locationsByPriority: Record<PickingPriority, number>
}

// ===== HIERARCHY HELPERS =====

/**
 * Helper para construir jerarquía de ubicación
 */
export interface LocationHierarchy {
  warehouse: string
  aisle?: string
  rack?: string
  shelf?: string
  level?: string
  position?: string
  fullPath: string             // "WH01/A/R1/S2/L1/P001"
  displayPath: string          // "Aisle A → Rack R1 → Shelf S2"
}

/**
 * Configuración para tree view de locations
 */
export interface LocationTreeNode {
  id: string
  label: string
  type: 'warehouse' | 'aisle' | 'rack' | 'shelf' | 'level' | 'position'
  children?: LocationTreeNode[]
  location?: WarehouseLocation  // Solo en nodos leaf
  isExpanded?: boolean
  hasChildren?: boolean
  level: number
}

// ===== EXPORTS =====

export type {
  LocationType,
  LocationStatus, 
  PickingPriority,
  LocationHierarchy,
  LocationTreeNode,
}