/**
 * DiscountRule Type Definitions
 *
 * Complete TypeScript types for DiscountRule module (SA-M003).
 * Automatic discount system for sales orders.
 *
 * Backend: Modules/Sales/app/Models/DiscountRule.php
 * API: /api/v1/discount-rules
 */

// Discount type enum
export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y'

// Applies to enum
export type DiscountAppliesTo = 'order' | 'product' | 'category'

// Base DiscountRule interface (API response)
export interface DiscountRule {
  id: string
  name: string
  code: string
  description?: string | null
  discountType: DiscountType
  discountValue: number
  buyQuantity?: number | null // For buy_x_get_y
  getQuantity?: number | null // For buy_x_get_y
  appliesTo: DiscountAppliesTo
  minOrderAmount?: number | null
  minQuantity?: number | null
  maxDiscountAmount?: number | null
  productIds?: number[] | null
  categoryIds?: number[] | null
  customerIds?: number[] | null
  customerClassifications?: string[] | null
  startDate?: string | null
  endDate?: string | null
  usageLimit?: number | null
  usagePerCustomer?: number | null
  currentUsage: number // Read-only
  priority: number
  isCombinable: boolean
  isActive: boolean
  // Computed fields (read-only)
  isValid: boolean
  isExpired: boolean
  usageRemaining?: number | null
  createdAt: string
  updatedAt: string
}

// Parsed DiscountRule for UI (camelCase normalized)
export interface ParsedDiscountRule extends DiscountRule {
  // Additional UI-friendly computed properties
  discountDisplay: string // e.g., "10%", "$50", "Buy 2 Get 1"
  statusLabel: string // e.g., "Active", "Expired", "Inactive"
  validityLabel: string // e.g., "Valid until Dec 31", "Expired"
}

// Create DiscountRule request interface
export interface CreateDiscountRuleRequest {
  name: string
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  buyQuantity?: number
  getQuantity?: number
  appliesTo: DiscountAppliesTo
  minOrderAmount?: number
  minQuantity?: number
  maxDiscountAmount?: number
  productIds?: number[]
  categoryIds?: number[]
  customerIds?: number[]
  customerClassifications?: string[]
  startDate?: string
  endDate?: string
  usageLimit?: number
  usagePerCustomer?: number
  priority?: number
  isCombinable?: boolean
  isActive?: boolean
}

// Update DiscountRule request interface
export interface UpdateDiscountRuleRequest {
  name?: string
  code?: string
  description?: string
  discountType?: DiscountType
  discountValue?: number
  buyQuantity?: number
  getQuantity?: number
  appliesTo?: DiscountAppliesTo
  minOrderAmount?: number
  minQuantity?: number
  maxDiscountAmount?: number
  productIds?: number[]
  categoryIds?: number[]
  customerIds?: number[]
  customerClassifications?: string[]
  startDate?: string
  endDate?: string
  usageLimit?: number
  usagePerCustomer?: number
  priority?: number
  isCombinable?: boolean
  isActive?: boolean
}

// Filters for listing discount rules
export interface DiscountRuleFilters {
  search?: string
  discountType?: DiscountType
  appliesTo?: DiscountAppliesTo
  isActive?: boolean
  code?: string
  validOnly?: boolean // Filter for currently valid rules
}

// Sort options
export interface DiscountRuleSortOptions {
  field: 'name' | 'code' | 'priority' | 'startDate' | 'endDate' | 'createdAt' | 'currentUsage'
  direction: 'asc' | 'desc'
}

// Form data for UI
export interface DiscountRuleFormData {
  name: string
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  buyQuantity?: number
  getQuantity?: number
  appliesTo: DiscountAppliesTo
  minOrderAmount?: number
  minQuantity?: number
  maxDiscountAmount?: number
  productIds?: number[]
  categoryIds?: number[]
  customerIds?: number[]
  customerClassifications?: string[]
  startDate?: string
  endDate?: string
  usageLimit?: number
  usagePerCustomer?: number
  priority: number
  isCombinable: boolean
  isActive: boolean
}

// JSON:API response type
export interface JsonApiDiscountRuleResponse {
  data: {
    id: string
    type: 'discount-rules'
    attributes: Record<string, unknown>
  } | Array<{
    id: string
    type: 'discount-rules'
    attributes: Record<string, unknown>
  }>
  meta?: {
    currentPage?: number
    perPage?: number
    total?: number
    lastPage?: number
  }
  included?: Array<{
    id: string
    type: string
    attributes: Record<string, unknown>
  }>
}

// Hook result types
export interface UseDiscountRulesResult {
  discountRules: ParsedDiscountRule[]
  isLoading: boolean
  error: Error | null
  meta?: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
  }
  mutate: () => void
}

export interface UseDiscountRuleResult {
  discountRule?: ParsedDiscountRule
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

export interface UseDiscountRuleMutationsResult {
  createDiscountRule: (data: CreateDiscountRuleRequest) => Promise<ParsedDiscountRule>
  updateDiscountRule: (id: string, data: UpdateDiscountRuleRequest) => Promise<ParsedDiscountRule>
  deleteDiscountRule: (id: string) => Promise<void>
  toggleActive: (id: string, isActive: boolean) => Promise<ParsedDiscountRule>
  validateCode: (code: string) => Promise<{ valid: boolean; rule?: ParsedDiscountRule; error?: string }>
  isLoading: boolean
}

// Status configuration for UI
export interface DiscountRuleStatusConfig {
  label: string
  color: string
  bgColor: string
  description: string
}

// Discount type configuration for UI
export interface DiscountTypeConfig {
  label: string
  icon: string
  badgeClass: string
  description: string
  requiresBuyGetFields: boolean
}

// Applies To configuration for UI
export interface AppliesToConfig {
  label: string
  badgeClass: string
  description: string
}

// Constants for UI
export const DISCOUNT_TYPE_CONFIG: Record<DiscountType, DiscountTypeConfig> = {
  percentage: {
    label: 'Porcentaje',
    icon: 'bi-percent',
    badgeClass: 'bg-primary',
    description: 'Descuento porcentual sobre el total',
    requiresBuyGetFields: false
  },
  fixed: {
    label: 'Monto Fijo',
    icon: 'bi-currency-dollar',
    badgeClass: 'bg-success',
    description: 'Descuento de cantidad fija',
    requiresBuyGetFields: false
  },
  buy_x_get_y: {
    label: 'Compra X Lleva Y',
    icon: 'bi-gift',
    badgeClass: 'bg-warning text-dark',
    description: 'Compra cierta cantidad y lleva otra gratis',
    requiresBuyGetFields: true
  }
}

export const APPLIES_TO_CONFIG: Record<DiscountAppliesTo, AppliesToConfig> = {
  order: {
    label: 'Orden Completa',
    badgeClass: 'bg-primary',
    description: 'El descuento se aplica al total de la orden'
  },
  product: {
    label: 'Productos Especificos',
    badgeClass: 'bg-secondary',
    description: 'El descuento se aplica solo a productos seleccionados'
  },
  category: {
    label: 'Categorias',
    badgeClass: 'bg-dark',
    description: 'El descuento se aplica a categorias de productos'
  }
}

export const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Porcentaje (%)' },
  { value: 'fixed', label: 'Monto Fijo ($)' },
  { value: 'buy_x_get_y', label: 'Compra X Lleva Y' }
]

export const APPLIES_TO_OPTIONS = [
  { value: 'order', label: 'Orden Completa' },
  { value: 'product', label: 'Productos Especificos' },
  { value: 'category', label: 'Categorias' }
]
