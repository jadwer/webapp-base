/**
 * INVENTORY TESTING UTILITIES
 * Utilidades específicas para testing del módulo inventory-simple
 * Incluye mocks, factories y helpers
 */

import { vi } from 'vitest'
import type { 
  Warehouse, 
  WarehouseLocation, 
  Stock, 
  InventoryMovement,
  JsonApiResponse 
} from '../../types'

// =================
// MOCK FACTORIES
// =================

/**
 * Factory para crear mock de Warehouse
 */
export const createMockWarehouse = (overrides: Partial<Warehouse> = {}): Warehouse => ({
  id: '1',
  name: 'Test Warehouse',
  slug: 'test-warehouse', 
  description: 'Test warehouse description',
  code: 'WH-001',
  warehouseType: 'main',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  country: 'Test Country',
  postalCode: '12345',
  phone: '+1234567890',
  email: 'test@warehouse.com',
  managerName: 'Test Manager',
  maxCapacity: 10000,
  capacityUnit: 'm3',
  isActive: true,
  createdAt: '2025-01-14T10:00:00.000Z',
  updatedAt: '2025-01-14T10:00:00.000Z',
  ...overrides
})

/**
 * Factory para crear mock de WarehouseLocation
 */
export const createMockLocation = (overrides: Partial<WarehouseLocation> = {}): WarehouseLocation => ({
  id: '1',
  name: 'Zone A - Aisle 1 - Rack 1',
  code: 'A-1-1',
  description: 'Test location description',
  locationType: 'rack',
  aisle: 'A',
  rack: '1',
  shelf: '1',
  level: '1',
  position: 'Left',
  barcode: 'LOC-001',
  maxWeight: 1000,
  maxVolume: 100,
  dimensions: '2m x 1m x 3m',
  isActive: true,
  isPickable: true,
  isReceivable: true,
  priority: 1,
  warehouseId: '1',
  metadata: null,
  createdAt: '2025-01-14T10:00:00.000Z',
  updatedAt: '2025-01-14T10:00:00.000Z',
  ...overrides
})

/**
 * Factory para crear mock de Stock
 */
export const createMockStock = (overrides: Partial<Stock> = {}): Stock => ({
  id: '1',
  quantity: 100,
  reservedQuantity: 10,
  availableQuantity: 90,
  minimumStock: 20,
  maximumStock: 500,
  reorderPoint: 30,
  unitCost: 15.50,
  totalValue: 1550,
  status: 'active',
  lastMovementDate: '2025-01-14T10:00:00.000Z',
  lastMovementType: 'entry',
  batchInfo: {
    batchNumber: 'BATCH-001',
    expiryDate: '2025-12-31',
    manufacturingDate: '2025-01-01'
  },
  metadata: {
    temperature: 'room',
    humidity: '50%'
  },
  productId: '1',
  warehouseId: '1',
  warehouseLocationId: '1',
  createdAt: '2025-01-14T10:00:00.000Z',
  updatedAt: '2025-01-14T10:00:00.000Z',
  ...overrides
})

/**
 * Factory para crear mock de InventoryMovement
 */
export const createMockMovement = (overrides: Partial<InventoryMovement> = {}): InventoryMovement => ({
  id: '1',
  movementType: 'entry',
  referenceType: 'purchase',
  referenceId: 123,
  movementDate: '2025-01-14T10:00:00.000Z',
  description: 'Test movement description',
  quantity: 50,
  unitCost: 15.50,
  totalValue: 775,
  status: 'completed',
  previousStock: 50,
  newStock: 100,
  batchInfo: {
    batchNumber: 'BATCH-001',
    expiryDate: '2025-12-31'
  },
  metadata: {
    source: 'purchase_order',
    notes: 'Test movement'
  },
  productId: '1',
  warehouseId: '1',
  locationId: '1',
  destinationWarehouseId: undefined,
  destinationLocationId: undefined,
  userId: 'user1',
  createdAt: '2025-01-14T10:00:00.000Z',
  updatedAt: '2025-01-14T10:00:00.000Z',
  ...overrides
})

// =================
// JSON:API RESPONSE FACTORIES
// =================

/**
 * Factory para crear respuesta JSON:API
 */
export const createMockJsonApiResponse = <T>(
  data: T,
  included?: any[],
  meta?: any
): JsonApiResponse<T> => ({
  data,
  included,
  meta,
  links: {
    self: 'http://localhost:8000/api/v1/test',
    first: 'http://localhost:8000/api/v1/test?page[number]=1',
    last: 'http://localhost:8000/api/v1/test?page[number]=10'
  }
})

/**
 * Factory para lista de JSON:API
 */
export const createMockJsonApiListResponse = <T>(
  items: T[],
  included?: any[],
  meta?: any
): JsonApiResponse<T[]> => createMockJsonApiResponse(
  items,
  included,
  {
    pagination: {
      count: items.length,
      currentPage: 1,
      perPage: 20,
      total: items.length,
      totalPages: 1
    },
    ...meta
  }
)

/**
 * Factory para single item JSON:API
 */
export const createMockJsonApiSingleResponse = <T>(
  item: T,
  included?: any[],
  meta?: any
): JsonApiResponse<T> => createMockJsonApiResponse(
  item,
  included,
  meta
)

// =================
// SERVICE MOCKS
// =================

/**
 * Mock para warehousesService
 */
export const createMockWarehousesService = () => ({
  getAll: vi.fn(),
  getById: vi.fn(), 
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getLocations: vi.fn(),
  getStock: vi.fn()
})

/**
 * Mock para locationsService
 */
export const createMockLocationsService = () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getStock: vi.fn()
})

/**
 * Mock para stockService
 */
export const createMockStockService = () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getByProduct: vi.fn(),
  getWarehouseSummary: vi.fn(),
  getLocationSummary: vi.fn()
})

/**
 * Mock para inventoryMovementsService
 */
export const createMockMovementsService = () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getByProduct: vi.fn(),
  getByWarehouse: vi.fn(),
  getEntries: vi.fn(),
  getExits: vi.fn()
})

// =================
// SWR MOCKS
// =================

/**
 * Mock SWR response exitoso
 */
export const createMockSWRSuccess = <T>(data: T) => ({
  data,
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: vi.fn()
})

/**
 * Mock SWR response con loading
 */
export const createMockSWRLoading = () => ({
  data: undefined,
  error: undefined,
  isLoading: true,
  isValidating: true,
  mutate: vi.fn()
})

/**
 * Mock SWR response con error
 */
export const createMockSWRError = (error: Error) => ({
  data: undefined,
  error,
  isLoading: false,
  isValidating: false,
  mutate: vi.fn()
})

// =================
// AXIOS MOCKS
// =================

/**
 * Mock axios response exitoso
 */
export const createMockAxiosSuccess = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : status === 204 ? 'No Content' : 'Success',
  headers: {},
  config: {}
})

/**
 * Mock axios error
 */
export const createMockAxiosError = (status: number, message: string) => {
  const error = new Error(message) as any
  error.response = {
    status,
    data: { message },
    headers: {},
    config: {}
  }
  return error
}

// =================
// FORM UTILITIES
// =================

/**
 * Simular cambio en input
 */
export const simulateInputChange = (input: HTMLInputElement, value: string) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Simular submit de form
 */
export const simulateFormSubmit = (form: HTMLFormElement) => {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

// =================
// ASSERTION HELPERS
// =================

/**
 * Verificar que elemento tiene loading state
 */
export const expectLoadingState = (container: HTMLElement) => {
  expect(container.querySelector('.spinner-border')).toBeInTheDocument()
}

/**
 * Verificar que elemento tiene error state
 */
export const expectErrorState = (container: HTMLElement, message?: string) => {
  expect(container.querySelector('.alert-danger')).toBeInTheDocument()
  if (message) {
    expect(container).toHaveTextContent(message)
  }
}

/**
 * Verificar que tabla tiene datos
 */
export const expectTableWithData = (container: HTMLElement, rowCount: number) => {
  const rows = container.querySelectorAll('tbody tr')
  expect(rows).toHaveLength(rowCount)
}