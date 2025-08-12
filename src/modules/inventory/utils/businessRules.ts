/**
 * 📦 BUSINESS RULES UTILITIES - INVENTORY MODULE
 * Utilidades para aplicar reglas de negocio estándar de la industria
 * 
 * Implementa las mejores prácticas para gestión de inventario empresarial:
 * - Validaciones de integridad de datos
 * - Restricciones operativas
 * - Reglas de seguridad
 * - Estándares de la industria
 */

import type { Warehouse, WarehouseLocation, Stock, CreateWarehouseData, UpdateWarehouseData } from '../types'

// ===== WAREHOUSE BUSINESS RULES =====

/**
 * Valida que un warehouse cumpla con las reglas de negocio antes de crear ubicaciones
 */
export function validateWarehouseForLocations(warehouse: Warehouse): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // BR-WH-001: Warehouse debe estar activo para crear locations
  if (!warehouse.isActive) {
    errors.push('El almacén debe estar activo para crear ubicaciones')
  }
  
  // BR-WH-002: Warehouse debe tener información básica completa
  if (!warehouse.name?.trim()) {
    errors.push('El almacén debe tener un nombre válido')
  }
  
  if (!warehouse.code?.trim()) {
    errors.push('El almacén debe tener un código válido')
  }
  
  // BR-WH-003: Validar capacidad si está especificada
  if (warehouse.maxCapacity !== undefined && warehouse.maxCapacity <= 0) {
    errors.push('La capacidad máxima debe ser mayor a cero')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida reglas de negocio para eliminación de warehouse
 */
export function validateWarehouseDeletion(warehouse: Warehouse): {
  canDelete: boolean
  restrictions: string[]
  warnings: string[]
} {
  const restrictions: string[] = []
  const warnings: string[] = []
  
  // BR-WH-004: No eliminar warehouse con locations activas
  if (warehouse.locations && warehouse.locations.length > 0) {
    const activeLocations = warehouse.locations.filter(loc => loc.isActive)
    if (activeLocations.length > 0) {
      restrictions.push(`Tiene ${activeLocations.length} ubicaciones activas`)
    }
  }
  
  // BR-WH-005: No eliminar warehouse con stock
  if (warehouse.stock && warehouse.stock.length > 0) {
    const activeStock = warehouse.stock.filter(stock => stock.quantity > 0)
    if (activeStock.length > 0) {
      restrictions.push(`Tiene ${activeStock.length} productos con stock`)
    }
  }
  
  // BR-WH-006: Advertencias para warehouse tipo 'main'
  if (warehouse.warehouseType === 'main') {
    warnings.push('Es un almacén principal - considere el impacto en operaciones')
  }
  
  return {
    canDelete: restrictions.length === 0,
    restrictions,
    warnings
  }
}

/**
 * Genera código automático para warehouse siguiendo estándares
 */
export function generateWarehouseCode(name: string, warehouseType: string, existingCodes: string[] = []): string {
  // BR-WH-007: Formato estándar de códigos
  const typePrefix = {
    main: 'WH-M',
    secondary: 'WH-S', 
    distribution: 'WH-D',
    returns: 'WH-R'
  }[warehouseType] || 'WH'
  
  // Generar sufijo desde nombre
  const namePart = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3)
    .padEnd(3, 'X')
  
  // Encontrar número disponible
  let counter = 1
  let code = `${typePrefix}${namePart}${counter.toString().padStart(2, '0')}`
  
  while (existingCodes.includes(code) && counter < 99) {
    counter++
    code = `${typePrefix}${namePart}${counter.toString().padStart(2, '0')}`
  }
  
  return code
}

// ===== WAREHOUSE LOCATION BUSINESS RULES =====

/**
 * Valida jerarquía de ubicación según estándares de la industria
 */
export function validateLocationHierarchy(location: Partial<WarehouseLocation>): {
  isValid: boolean
  errors: string[]
  suggestions: string[]
} {
  const errors: string[] = []
  const suggestions: string[] = []
  
  // BR-LOC-001: Código único por warehouse
  if (!location.code?.trim()) {
    errors.push('El código de ubicación es requerido')
  }
  
  // BR-LOC-002: Validar jerarquía lógica
  if (location.rack && !location.aisle) {
    suggestions.push('Se recomienda especificar el pasillo cuando hay rack')
  }
  
  if (location.shelf && !location.rack) {
    suggestions.push('Se recomienda especificar el rack cuando hay shelf')
  }
  
  if (location.level && !location.shelf) {
    suggestions.push('Se recomienda especificar el shelf cuando hay level')
  }
  
  // BR-LOC-003: Capacidades físicas
  if (location.maxWeight !== undefined && location.maxWeight <= 0) {
    errors.push('El peso máximo debe ser mayor a cero')
  }
  
  if (location.maxVolume !== undefined && location.maxVolume <= 0) {
    errors.push('El volumen máximo debe ser mayor a cero')
  }
  
  // BR-LOC-004: Configuración operativa
  if (location.isPickable === false && location.isReceivable === false) {
    errors.push('La ubicación debe permitir picking o recepción (o ambos)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  }
}

/**
 * Genera código de ubicación siguiendo estándares
 */
export function generateLocationCode(
  warehouseCode: string,
  hierarchy: {
    aisle?: string
    rack?: string  
    shelf?: string
    level?: string
    position?: string
  }
): string {
  // BR-LOC-005: Formato estándar: WH-AISLE-RACK-SHELF-LEVEL-POS
  const parts = [warehouseCode]
  
  if (hierarchy.aisle) parts.push(hierarchy.aisle.toUpperCase())
  if (hierarchy.rack) parts.push(hierarchy.rack.toUpperCase())
  if (hierarchy.shelf) parts.push(hierarchy.shelf.toUpperCase())
  if (hierarchy.level) parts.push(hierarchy.level.toUpperCase())
  if (hierarchy.position) parts.push(hierarchy.position.toUpperCase())
  
  return parts.join('-')
}

// ===== STOCK BUSINESS RULES =====

/**
 * Valida reglas de negocio para stock
 */
export function validateStockBusinessRules(stock: Partial<Stock>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // BR-STK-001: Cantidades válidas
  if (stock.quantity !== undefined && stock.quantity < 0) {
    errors.push('La cantidad no puede ser negativa')
  }
  
  if (stock.reservedQuantity !== undefined && stock.reservedQuantity < 0) {
    errors.push('La cantidad reservada no puede ser negativa')
  }
  
  // BR-STK-002: Cantidad reservada no puede exceder cantidad total
  if (stock.quantity !== undefined && stock.reservedQuantity !== undefined) {
    if (stock.reservedQuantity > stock.quantity) {
      errors.push('La cantidad reservada no puede exceder la cantidad total')
    }
  }
  
  // BR-STK-003: Stock mínimo y máximo
  if (stock.minimumStock !== undefined && stock.minimumStock < 0) {
    errors.push('El stock mínimo no puede ser negativo')
  }
  
  if (stock.maximumStock !== undefined && stock.minimumStock !== undefined) {
    if (stock.maximumStock <= stock.minimumStock) {
      errors.push('El stock máximo debe ser mayor al stock mínimo')
    }
  }
  
  // BR-STK-004: Punto de reorden
  if (stock.reorderPoint !== undefined && stock.minimumStock !== undefined) {
    if (stock.reorderPoint < stock.minimumStock) {
      warnings.push('El punto de reorden es menor al stock mínimo')
    }
  }
  
  // BR-STK-005: Costos
  if (stock.unitCost !== undefined && stock.unitCost < 0) {
    errors.push('El costo unitario no puede ser negativo')
  }
  
  // BR-STK-006: Alertas de stock
  if (stock.quantity !== undefined && stock.minimumStock !== undefined) {
    if (stock.quantity <= stock.minimumStock) {
      warnings.push('Stock por debajo del mínimo recomendado')
    }
  }
  
  if (stock.quantity !== undefined && stock.maximumStock !== undefined) {
    if (stock.quantity >= stock.maximumStock) {
      warnings.push('Stock por encima del máximo recomendado')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Calcula valores derivados de stock según business rules
 */
export function calculateStockMetrics(stock: Stock): {
  availableQuantity: number
  totalValue: number
  stockLevel: 'critical' | 'low' | 'optimal' | 'high' | 'overstocked'
  needsReorder: boolean
} {
  // BR-STK-007: Cantidad disponible
  const availableQuantity = Math.max(0, stock.quantity - stock.reservedQuantity)
  
  // BR-STK-008: Valor total
  const totalValue = stock.quantity * (stock.unitCost || 0)
  
  // BR-STK-009: Nivel de stock
  let stockLevel: 'critical' | 'low' | 'optimal' | 'high' | 'overstocked' = 'optimal'
  
  if (stock.minimumStock !== undefined && stock.maximumStock !== undefined) {
    const min = stock.minimumStock
    const max = stock.maximumStock
    const current = stock.quantity
    
    if (current === 0) {
      stockLevel = 'critical'
    } else if (current <= min) {
      stockLevel = 'low'
    } else if (current >= max) {
      stockLevel = 'overstocked'
    } else if (current > max * 0.8) {
      stockLevel = 'high'
    } else {
      stockLevel = 'optimal'
    }
  }
  
  // BR-STK-010: Necesita reorden
  const needsReorder = stock.reorderPoint !== undefined 
    ? stock.quantity <= stock.reorderPoint
    : false
  
  return {
    availableQuantity,
    totalValue,
    stockLevel,
    needsReorder
  }
}

// ===== SECURITY RULES =====

/**
 * Valida permisos para operaciones críticas
 */
export function validateInventoryPermissions(
  operation: 'create' | 'update' | 'delete' | 'adjust_stock',
  userRoles: string[],
  targetEntity: 'warehouse' | 'location' | 'stock'
): {
  hasPermission: boolean
  requiredRoles: string[]
  reason?: string
} {
  // BR-SEC-001: Mapeo de permisos por operación
  const permissionMatrix = {
    warehouse: {
      create: ['admin', 'warehouse_manager'],
      update: ['admin', 'warehouse_manager'],
      delete: ['admin'],
      adjust_stock: ['admin', 'warehouse_manager', 'inventory_manager']
    },
    location: {
      create: ['admin', 'warehouse_manager'],
      update: ['admin', 'warehouse_manager'],
      delete: ['admin', 'warehouse_manager'],
      adjust_stock: ['admin', 'warehouse_manager', 'inventory_manager']
    },
    stock: {
      create: ['admin', 'warehouse_manager', 'inventory_manager'],
      update: ['admin', 'warehouse_manager', 'inventory_manager'],
      delete: ['admin'],
      adjust_stock: ['admin', 'warehouse_manager', 'inventory_manager']
    }
  }
  
  const requiredRoles = permissionMatrix[targetEntity][operation] || []
  const hasPermission = requiredRoles.some(role => userRoles.includes(role))
  
  return {
    hasPermission,
    requiredRoles,
    reason: !hasPermission ? `Operación ${operation} en ${targetEntity} requiere roles: ${requiredRoles.join(', ')}` : undefined
  }
}

// ===== EXPORT ALL UTILITIES =====

export const BusinessRules = {
  // Warehouse rules
  validateWarehouseForLocations,
  validateWarehouseDeletion,
  generateWarehouseCode,
  
  // Location rules
  validateLocationHierarchy,
  generateLocationCode,
  
  // Stock rules
  validateStockBusinessRules,
  calculateStockMetrics,
  
  // Security rules
  validateInventoryPermissions,
}