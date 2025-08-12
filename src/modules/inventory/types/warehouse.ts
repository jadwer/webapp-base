/**
 * 📦 WAREHOUSE TYPES - INVENTORY MODULE
 * Definiciones TypeScript para la entidad Warehouse
 * 
 * Business Rules Aplicadas:
 * - code debe ser único global
 * - slug debe ser único global  
 * - warehouseType debe ser enum válido
 * - isActive false impide crear new locations
 * - Coordinated con Products module para stock integration
 */

// ===== CORE WAREHOUSE INTERFACE =====
export interface Warehouse {
  // Identificación básica
  id: string
  name: string           // required - Nombre del almacén
  slug: string          // required, unique - URL-friendly identifier
  description?: string   // Descripción opcional del almacén
  code: string          // required, unique - Código corto identificador
  
  // Clasificación empresarial
  warehouseType: WarehouseType  // required - Tipo de almacén
  
  // Información de ubicación física
  address?: string       // Dirección física
  city?: string         // Ciudad
  state?: string        // Estado/Provincia
  country?: string      // País
  postalCode?: string   // Código postal
  
  // Información de contacto
  phone?: string        // Teléfono principal
  email?: string        // Email de contacto
  managerName?: string  // Nombre del gerente/responsable
  
  // Capacidad y configuración
  maxCapacity?: number    // Capacidad máxima
  capacityUnit?: string   // Unidad de capacidad (m3, ton, etc.)
  operatingHours?: string // Horarios de operación
  
  // Estado y metadatos
  isActive: boolean      // true = operativo, false = inactivo
  metadata?: Record<string, any> // Datos adicionales JSON
  
  // Timestamps automáticos
  createdAt: string     // ISO datetime - Fecha de creación
  updatedAt: string     // ISO datetime - Última actualización
  
  // Relaciones (populated cuando se incluyen)
  locations?: WarehouseLocation[]  // HasMany - Ubicaciones dentro del almacén
  stock?: Stock[]                  // HasMany - Stock items en este almacén
}

// ===== ENUMS Y TIPOS AUXILIARES =====

/**
 * Tipos de almacén estándar en la industria
 * Business Rule: Cada tipo tiene características operativas diferentes
 */
export type WarehouseType = 
  | 'main'          // Principal - Almacén central de distribución
  | 'secondary'     // Secundario - Almacén de soporte regional
  | 'distribution'  // Distribución - Centro de envíos
  | 'returns'       // Devoluciones - Manejo de productos devueltos

/**
 * Estado operativo del almacén
 */
export type WarehouseStatus = 'active' | 'inactive' | 'maintenance'

// ===== INTERFACES AUXILIARES =====

/**
 * Ubicación específica dentro de un almacén
 * Relationship: BelongsTo Warehouse
 */
export interface WarehouseLocation {
  id: string
  name: string
  code: string
  description?: string
  barcode?: string
  
  // Ubicación jerárquica
  locationType?: string   // aisle, rack, shelf, etc.
  aisle?: string         // Pasillo
  rack?: string          // Estante  
  shelf?: string         // Estantería
  level?: string         // Nivel/Piso
  position?: string      // Posición específica
  
  // Capacidades físicas
  maxWeight?: number     // Peso máximo soportado
  maxVolume?: number     // Volumen máximo
  dimensions?: string    // Dimensiones físicas
  
  // Configuración operativa  
  isActive: boolean      // Ubicación activa/inactiva
  isPickable: boolean    // Permite picking de productos
  isReceivable: boolean  // Permite recepción de productos
  priority?: number      // Prioridad de picking (1=alta, 10=baja)
  
  // Metadatos
  metadata?: Record<string, any>
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Relationships
  warehouse: Warehouse   // BelongsTo - Almacén padre
  stock?: Stock[]        // HasMany - Stock en esta ubicación
}

/**
 * Registro de stock/inventario
 * Relationships: BelongsTo Product, BelongsTo WarehouseLocation
 */
export interface Stock {
  id: string
  
  // Cantidades (Business Rule: quantity >= reservedQuantity >= 0)
  quantity: number              // Stock actual físico
  reservedQuantity: number      // Cantidad reservada (pedidos, etc.)
  availableQuantity: number     // Disponible = quantity - reservedQuantity (calculado)
  
  // Configuración de stock (Business Rules aplicadas)
  minimumStock?: number         // Punto de reorden (>= 0)
  maximumStock?: number         // Stock máximo (> minimumStock si se especifica)
  reorderPoint?: number         // Trigger automático para reabastecimiento
  
  // Valores económicos
  unitCost?: number            // Costo unitario actual
  totalValue?: number          // Valor total = quantity * unitCost (calculado)
  
  // Control y seguimiento
  status: StockStatus          // Estado del stock
  lastMovementDate?: string    // Último movimiento registrado
  lastMovementType?: MovementType // Tipo de último movimiento
  
  // Información adicional
  batchInfo?: Record<string, any>  // Información de lotes/series
  metadata?: Record<string, any>   // Datos adicionales
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Relationships (Coordination con Products module)
  product: Product             // BelongsTo - Producto del stock
  warehouse: Warehouse         // BelongsTo - Almacén (calculado via location)
  location: WarehouseLocation  // BelongsTo - Ubicación específica
}

// ===== TIPOS PARA STOCK =====

/**
 * Estados de stock estándar industria
 */
export type StockStatus = 
  | 'active'      // Stock activo y disponible
  | 'inactive'    // Stock inactivo (no disponible para venta)
  | 'reserved'    // Stock reservado
  | 'damaged'     // Stock dañado
  | 'expired'     // Stock vencido
  | 'quarantine'  // Stock en cuarentena

/**
 * Tipos de movimiento de stock
 */
export type MovementType = 
  | 'in'          // Entrada (compras, devoluciones de cliente)
  | 'out'         // Salida (ventas, devoluciones a proveedor)
  | 'adjustment'  // Ajuste manual de inventario
  | 'transfer'    // Transferencia entre ubicaciones
  | 'damaged'     // Marcado como dañado
  | 'expired'     // Marcado como vencido

// ===== INTERFACES PARA COORDINATION CON PRODUCTS =====

/**
 * Producto simplificado para coordination
 * Evita circular dependencies con Products module
 */
export interface Product {
  id: string
  name: string
  code?: string
  description?: string
  price?: number
  
  // Relationships coordinadas
  unit?: Unit
  category?: Category
  brand?: Brand
}

export interface Unit {
  id: string
  name: string
  code: string
  description?: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Brand {
  id: string
  name: string
  description?: string
}

// ===== INTERFACES PARA API Y FORMS =====

/**
 * Data Transfer Object para crear Warehouse
 * Business Rules: code y slug únicos, warehouseType válido
 */
export interface CreateWarehouseData {
  name: string
  code: string
  slug?: string  // Se genera automáticamente si no se proporciona
  description?: string
  warehouseType: WarehouseType
  
  // Ubicación (opcional en creación)
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  
  // Contacto (opcional)
  phone?: string
  email?: string
  managerName?: string
  
  // Capacidad (opcional)
  maxCapacity?: number
  capacityUnit?: string
  operatingHours?: string
  
  // Estado (default: true)
  isActive?: boolean
  metadata?: Record<string, any>
}

/**
 * Data Transfer Object para actualizar Warehouse
 */
export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {
  id: string
}

/**
 * Filtros para búsqueda de Warehouses
 * Optimizado para 500K+ productos
 */
export interface WarehouseFilters {
  // Búsqueda general (across name, code, description)
  search?: string
  
  // Filtros específicos
  warehouseType?: WarehouseType | WarehouseType[]
  isActive?: boolean
  city?: string
  state?: string
  country?: string
  
  // Filtros de capacidad
  minCapacity?: number
  maxCapacity?: number
  
  // Orden
  sortBy?: 'name' | 'code' | 'warehouseType' | 'city' | 'createdAt' | 'updatedAt'
  sortDirection?: 'asc' | 'desc'
  
  // Paginación (Critical para 500K+ records)
  page?: number
  limit?: number  // Max 50 para performance
  
  // Include relationships (optional)
  include?: ('locations' | 'stock')[]
}

// ===== BUSINESS RULES CONSTANTS =====

/**
 * Constantes de negocio para validaciones
 */
export const WAREHOUSE_BUSINESS_RULES = {
  // Limits para performance con 500K+ productos
  MAX_PAGE_SIZE: 50,
  DEFAULT_PAGE_SIZE: 20,
  
  // Validaciones de campos
  NAME_MAX_LENGTH: 255,
  CODE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  PHONE_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 255,
  
  // Capacidad
  MIN_CAPACITY: 0,
  MAX_CAPACITY: 999999999,
  
  // Debounce para search con 500K+ records
  SEARCH_DEBOUNCE_MS: 500,
  
  // Warehouse Types válidos
  VALID_WAREHOUSE_TYPES: ['main', 'secondary', 'distribution', 'returns'] as const,
  
  // Reglas de negocio
  RULES: {
    CODE_UNIQUE_GLOBAL: 'Warehouse code must be unique across all warehouses',
    SLUG_UNIQUE_GLOBAL: 'Warehouse slug must be unique across all warehouses', 
    ACTIVE_REQUIRED_FOR_LOCATIONS: 'Warehouse must be active to create new locations',
    CAPACITY_POSITIVE: 'Max capacity must be positive number if specified',
    EMAIL_VALID_FORMAT: 'Email must be valid format if specified',
    PHONE_NUMERIC_ONLY: 'Phone should contain only numbers and basic formatting',
  }
} as const

// ===== UTILITY TYPES =====

/**
 * Tipo para respuesta paginada de API
 */
export interface PaginatedWarehousesResponse {
  data: Warehouse[]
  meta: {
    pagination: {
      page: number
      pages: number
      count: number
      total: number
      links: {
        self: string
        first: string
        last: string
        prev?: string
        next?: string
      }
    }
  }
  included?: (WarehouseLocation | Stock | Product)[]
}

/**
 * Estado de carga para UI
 */
export interface WarehouseLoadingState {
  isLoading: boolean
  isError: boolean
  error?: string
  isEmpty: boolean
}

/**
 * Métricas de warehouse para dashboard (preparado para fase posterior)
 */
export interface WarehouseMetrics {
  id: string
  name: string
  totalLocations: number
  activeLocations: number
  totalStock: number
  totalValue: number
  utilizationPercentage: number
  lowStockAlerts: number
  lastActivity?: string
}