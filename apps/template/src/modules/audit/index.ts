// Audit Module - Main Exports

// Components
export {
  AuditAdminPage,
  AuditDetail,
  AuditFilters,
  AuditTable,
  AuditTimeline,
  EntityHistoryTab,
  RecentActivityWidget,
  UserLoginHistory,
} from './components'

// Hooks
export {
  useAudits,
  useAudit,
  useRecentAudits,
  useEntityHistory,
  useUserActivity,
  useLoginHistory,
} from './hooks/useAudits'

// Services
export { auditService } from './services/auditService'

// Types
export type {
  Audit,
  AuditEvent,
  AuditFilters as AuditFiltersType,
  AuditQueryParams,
  FieldChange,
} from './types'

export {
  EVENT_LABELS,
  EVENT_COLORS,
  EVENT_ICONS,
  AUDITABLE_TYPE_LABELS,
  formatAuditableType,
} from './types'
