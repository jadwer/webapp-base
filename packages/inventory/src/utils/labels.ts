/**
 * ETIQUETAS DE INVENTARIO
 * Mapas valor -> { label, variant, icon } para StatusBadge. Las llaves son
 * exactamente los valores que valida el backend (Requests de
 * Modules/Inventory); si el backend agrega uno, se agrega aqui.
 */

import type { BadgeVariant } from '@lwm/ui'

export type InventoryLabelMap = Record<string, { label: string; variant: BadgeVariant; icon?: string }>

// StockRequest: in:active,inactive,quarantine,damaged
export const STOCK_STATUS: InventoryLabelMap = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
  quarantine: { label: 'Cuarentena', variant: 'warning' },
  damaged: { label: 'Dañado', variant: 'danger' },
}

// ProductBatchRequest: in:active,expired,quarantine,recalled,consumed
export const BATCH_STATUS: InventoryLabelMap = {
  active: { label: 'Activo', variant: 'success' },
  expired: { label: 'Vencido', variant: 'danger' },
  quarantine: { label: 'Cuarentena', variant: 'warning' },
  recalled: { label: 'Retirado', variant: 'dark' },
  consumed: { label: 'Consumido', variant: 'secondary' },
}

// InventoryMovementRequest: movementType in entry,exit,transfer,adjustment
export const MOVEMENT_TYPE: InventoryLabelMap = {
  entry: { label: 'Entrada', variant: 'success', icon: 'bi-box-arrow-in-down' },
  exit: { label: 'Salida', variant: 'danger', icon: 'bi-box-arrow-up' },
  transfer: { label: 'Transferencia', variant: 'info', icon: 'bi-arrow-left-right' },
  adjustment: { label: 'Ajuste', variant: 'warning', icon: 'bi-sliders' },
}

// InventoryMovementRequest: status in pending,completed,cancelled
export const MOVEMENT_STATUS: InventoryLabelMap = {
  pending: { label: 'Pendiente', variant: 'warning' },
  completed: { label: 'Completado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
}

// WarehouseRequest: warehouseType in main,secondary,distribution,returns
export const WAREHOUSE_TYPE: InventoryLabelMap = {
  main: { label: 'Principal', variant: 'primary' },
  secondary: { label: 'Secundario', variant: 'secondary' },
  distribution: { label: 'Distribución', variant: 'info' },
  returns: { label: 'Devoluciones', variant: 'warning' },
}

// FractionationRequest: status in pending,completed,cancelled
export const FRACTIONATION_STATUS: InventoryLabelMap = {
  pending: { label: 'Pendiente', variant: 'warning' },
  completed: { label: 'Completado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
}

// WarehouseLocationRequest: locationType in aisle,rack,shelf,bin,zone,bay
export const LOCATION_TYPE: InventoryLabelMap = {
  aisle: { label: 'Pasillo', variant: 'secondary' },
  rack: { label: 'Rack', variant: 'secondary' },
  shelf: { label: 'Estante', variant: 'secondary' },
  bin: { label: 'Contenedor', variant: 'secondary' },
  zone: { label: 'Zona', variant: 'secondary' },
  bay: { label: 'Bahía', variant: 'secondary' },
}
