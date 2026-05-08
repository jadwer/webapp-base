// SystemHealth Module - Main Exports

// Components
export {
  StatusBadge,
  HealthCheckCard,
  DatabaseMetricsTable,
  ApplicationMetricsGrid,
  RecentErrorsList,
  SystemHealthAdminPage,
  SystemHealthWidget,
} from './components'

// Hooks
export {
  useSystemHealth,
  usePing,
  useDatabaseHealth,
  useStorageHealth,
  useQueueHealth,
  useErrorLogs,
  useApplicationMetrics,
} from './hooks/useSystemHealth'

// Services
export { systemHealthService } from './services/systemHealthService'

// Types
export type {
  HealthStatus,
  PingStatus,
  HealthCheck,
  QueueCheck,
  StorageCheck,
  CacheCheck,
  TableInfo,
  DatabaseMetrics,
  DatabaseHealth,
  ApplicationMetrics,
  ExceptionInfo,
  ErrorMetrics,
  SystemHealthStatus,
  PingResponse,
} from './types'

export {
  STATUS_COLORS,
  STATUS_ICONS,
  STATUS_LABELS,
  getStatusColorClass,
  getStatusBadgeClass,
} from './types'
