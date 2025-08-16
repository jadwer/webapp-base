/**
 * COMMON TYPES FOR INVENTORY MODULE
 * Generic types to replace 'any' usage
 */

// Generic API Response
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  errors?: string[]
}

// Generic Form Data
export interface FormData {
  [key: string]: string | number | boolean | undefined | null
}

// Generic Table Props
export interface TableProps<T = unknown> {
  data: T[]
  isLoading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (id: string) => void
  onView?: (item: T) => void
}

// Generic Filter Props
export interface FilterProps<T = Record<string, unknown>> {
  filters: T
  onFiltersChange: (filters: T) => void
  isLoading?: boolean
}

// Generic Mutation Handlers
export interface MutationHandlers<TCreate = FormData, TUpdate = FormData> {
  onCreate?: (data: TCreate) => Promise<void>
  onUpdate?: (id: string, data: TUpdate) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

// Generic Component Props
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}

// Generic Event Handlers
export interface EventHandlers {
  onClick?: () => void
  onChange?: (value: unknown) => void
  onSubmit?: (data: FormData) => void
}

// Generic State
export interface GenericState<T = unknown> {
  data: T | null
  loading: boolean
  error: string | null
}