// Backend API status values
export type PurchaseOrderStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'received'
  | 'cancelled'
  // Legacy frontend value
  | 'completed'

export type InvoicingStatus = 'pending' | 'partial' | 'invoiced' | 'not_required'
// Legacy frontend financial status
export type FinancialStatus = 'not_invoiced' | 'invoiced' | 'paid'

export interface PurchaseOrder {
  id: string
  contactId: number
  contact?: Contact
  orderNumber?: string // Frontend-generated, not in backend
  orderDate: string
  status: PurchaseOrderStatus
  totalAmount: number
  notes: string | null
  // Finance integration fields
  apInvoiceId: number | null
  invoicingStatus: InvoicingStatus | string | null
  invoicingNotes: string | null
  // Legacy frontend fields (not in backend)
  financialStatus?: FinancialStatus
  subtotalAmount?: number
  taxAmount?: number
  discountTotal?: number
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: number
  productId: number
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
  total: number
  totalPrice?: number // Legacy frontend alias for total
  metadata?: Record<string, unknown> | null
  // Finance integration fields
  apInvoiceLineId: number | null
  invoicedQuantity: number | null
  invoicedAmount: number | null
  // Metadata
  createdAt: string
  updatedAt: string
  // Relationships
  product?: Record<string, unknown>
  purchaseOrder?: PurchaseOrder | Record<string, unknown>
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  type: 'individual' | 'company'
}

export interface PurchaseOrderFormData {
  contactId: number
  orderNumber?: string
  orderDate: string
  status: PurchaseOrderStatus
  notes?: string | null
  items?: PurchaseOrderItem[]
}

// JSON:API related types (common interface used across modules)
export interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, unknown>
}

export interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[]
  meta?: Record<string, unknown>
  included?: JsonApiResource[]
}

// API Response types
export interface PurchaseOrdersResponse {
  data: PurchaseOrder[]
  meta: Record<string, unknown>
}

export interface PurchaseOrderItemsResponse {
  data: PurchaseOrderItem[]
  meta: Record<string, unknown>
}

// Filter and pagination types
export interface PurchaseOrderFilters {
  search?: string
  status?: string
  contactId?: number
  dateFrom?: string
  dateTo?: string
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

// Reports types
export interface PurchaseReportData {
  totalPurchases: number
  totalOrders: number
  averageOrderValue: number
  topSuppliers: SupplierPurchaseData[]
  purchasesByStatus: StatusPurchaseData[]
  purchasesByPeriod: PeriodPurchaseData[]
}

export interface SupplierPurchaseData {
  supplierId: number
  supplierName: string
  totalPurchases: number
  orderCount: number
}

export interface StatusPurchaseData {
  status: string
  count: number
  totalAmount: number
}

export interface PeriodPurchaseData {
  period: string
  totalPurchases: number
  orderCount: number
}

// ===== BUDGET (v1.1) =====

export type BudgetType = 'department' | 'category' | 'project' | 'supplier' | 'general';
export type BudgetPeriodType = 'monthly' | 'quarterly' | 'annual' | 'custom';
export type BudgetStatusLevel = 'normal' | 'warning' | 'critical' | 'exceeded';
export type BudgetAllocationStatus = 'committed' | 'spent' | 'released' | 'cancelled';

export interface Budget {
  id: string;
  name: string;
  code: string;
  description: string | null;
  budgetType: BudgetType;
  departmentCode: string | null;
  categoryId: number | null;
  projectCode: string | null;
  contactId: number | null;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  fiscalYear: number | null;
  budgetedAmount: number;
  committedAmount: number;
  spentAmount: number;
  availableAmount?: number;
  warningThreshold: number;
  criticalThreshold: number;
  hardLimit: boolean;
  allowOvercommit: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed
  utilizationPercent?: number;
  statusLevel?: BudgetStatusLevel;
  // Relationships
  categoryName?: string;
  contactName?: string;
}

export interface ParsedBudget extends Budget {
  budgetedAmountDisplay: string;
  committedAmountDisplay: string;
  spentAmountDisplay: string;
  availableAmountDisplay: string;
  utilizationDisplay: string;
  budgetTypeLabel: string;
  periodTypeLabel: string;
  statusLevelLabel: string;
}

export interface BudgetAllocation {
  id: string;
  budgetId: number;
  purchaseOrderId: number;
  allocatedAmount: number;
  status: BudgetAllocationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Relationships
  budgetName?: string;
  purchaseOrderNumber?: string;
}

export interface BudgetFormData {
  name: string;
  code: string;
  description?: string;
  budgetType: BudgetType;
  departmentCode?: string;
  categoryId?: number;
  projectCode?: string;
  contactId?: number;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  fiscalYear?: number;
  budgetedAmount: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  hardLimit?: boolean;
  allowOvercommit?: boolean;
  isActive?: boolean;
}

export type CreateBudgetRequest = BudgetFormData

export type UpdateBudgetRequest = Partial<BudgetFormData>

export interface BudgetFilters {
  budgetType?: BudgetType;
  periodType?: BudgetPeriodType;
  departmentCode?: string;
  categoryId?: number;
  contactId?: number;
  fiscalYear?: number;
  isActive?: boolean;
  current?: boolean;
  overWarning?: boolean;
  overCritical?: boolean;
}

export interface BudgetSortOptions {
  field: 'name' | 'code' | 'budgetType' | 'periodType' | 'startDate' | 'endDate' | 'budgetedAmount' | 'isActive' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface UseBudgetsResult {
  budgets: ParsedBudget[];
  meta?: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

export interface UseBudgetResult {
  budget: ParsedBudget | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

export interface UseBudgetMutationsResult {
  createBudget: (data: CreateBudgetRequest) => Promise<ParsedBudget>;
  updateBudget: (id: string, data: UpdateBudgetRequest) => Promise<ParsedBudget>;
  deleteBudget: (id: string) => Promise<void>;
  isLoading: boolean;
}

export interface BudgetSummary {
  totalBudgets: number;
  activeBudgets: number;
  totalBudgeted: number;
  totalCommitted: number;
  totalSpent: number;
  totalAvailable: number;
  budgetsOverWarning: number;
  budgetsOverCritical: number;
}

// UI Config Constants
export const BUDGET_TYPE_CONFIG: Record<BudgetType, { label: string; icon: string; badgeClass: string }> = {
  department: { label: 'Departamento', icon: 'bi-building', badgeClass: 'bg-primary' },
  category: { label: 'Categoria', icon: 'bi-tags', badgeClass: 'bg-info' },
  project: { label: 'Proyecto', icon: 'bi-folder', badgeClass: 'bg-success' },
  supplier: { label: 'Proveedor', icon: 'bi-person-badge', badgeClass: 'bg-warning' },
  general: { label: 'General', icon: 'bi-globe', badgeClass: 'bg-secondary' },
};

export const BUDGET_PERIOD_TYPE_CONFIG: Record<BudgetPeriodType, { label: string }> = {
  monthly: { label: 'Mensual' },
  quarterly: { label: 'Trimestral' },
  annual: { label: 'Anual' },
  custom: { label: 'Personalizado' },
};

export const BUDGET_STATUS_LEVEL_CONFIG: Record<BudgetStatusLevel, { label: string; badgeClass: string; icon: string }> = {
  normal: { label: 'Normal', badgeClass: 'bg-success', icon: 'bi-check-circle' },
  warning: { label: 'Advertencia', badgeClass: 'bg-warning text-dark', icon: 'bi-exclamation-triangle' },
  critical: { label: 'Critico', badgeClass: 'bg-danger', icon: 'bi-exclamation-circle' },
  exceeded: { label: 'Excedido', badgeClass: 'bg-dark', icon: 'bi-x-circle' },
};

export const BUDGET_TYPE_OPTIONS: Array<{ value: BudgetType; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'department', label: 'Departamento' },
  { value: 'category', label: 'Categoria' },
  { value: 'project', label: 'Proyecto' },
  { value: 'supplier', label: 'Proveedor' },
];

export const BUDGET_PERIOD_TYPE_OPTIONS: Array<{ value: BudgetPeriodType; label: string }> = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'custom', label: 'Personalizado' },
];