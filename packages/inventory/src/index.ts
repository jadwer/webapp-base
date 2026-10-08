/**
 * @lwm/inventory
 * Almacenes, ubicaciones, stock, movimientos, lotes, fraccionamiento,
 * conversiones y conteos ciclicos sobre la API JSON:API (SWR + servicios axios).
 * Estructura y esqueletos de pagina en INVENTORY_SIMPLE_README.md.
 */

// Types
export * from './types'

// Services
export * from './services'

// Hooks
export * from './hooks'

// Components
export * from './components'

// Utils
// export * from './utils' // Commented to avoid type conflicts
// Formato y etiquetas se exportan por nombre (el barrel de utils choca con jsonApi.ts)
export { toNumber, formatDate, formatQty, formatMoney } from './utils/format'
export type { FormatDateOptions } from './utils/format'
export {
  STOCK_STATUS,
  BATCH_STATUS,
  MOVEMENT_TYPE,
  MOVEMENT_STATUS,
  WAREHOUSE_TYPE,
  FRACTIONATION_STATUS,
  LOCATION_TYPE,
} from './utils/labels'
export type { InventoryLabelMap } from './utils/labels'
