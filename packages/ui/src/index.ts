// @lwm/ui - shared design system + layout components for the LWM codebase.
//
// Two layers:
//   1) design-system primitives (Button, Card, Modal, Skeleton, ...). The
//      cycle-sensitive primitives (parseJsonApiErrors, StatusMessage,
//      Input/Textarea/Select, useIsClient) now live in @lwm/primitives
//      and are re-exported here for backward-compat with consumers that
//      do `import { Input, StatusMessage } from '@lwm/ui'`.
//   2) layout primitives (DashboardLayout, Sidebar, HeaderNavbar,
//      DynamicRoleGuard, ...) that DO consume @lwm/auth + @lwm/app-config
//      to render role-aware shells. They expect the consumer (template or
//      a clients/<name>/) to wire its own NavigationConfig.
//
// The historical @lwm/auth ↔ @lwm/ui cycle was broken in 2026-05-12 by
// extracting the cycle-sensitive primitives to @lwm/primitives (deuda B5
// in project memory). Export order in this barrel is no longer
// load-bearing — feel free to alphabetize.

// ============================================
// Primitives re-exported for backward-compat
// ============================================
export {
  parseJsonApiErrors,
  useIsClient,
  StatusMessage,
  Input,
  Textarea,
  Select,
  type InputProps,
  type TextareaProps,
  type SelectProps,
} from '@lwm/primitives'

// ============================================
// Design-system components (auth-agnostic)
// ============================================
export * from './components/base'
export { default as ToastNotifier, type ToastNotifierHandle, type ToastType as ToastNotifierType } from './components/ToastNotifier'
export { Skeleton } from './components/Skeleton'
export * from './hooks/useToast'
export * from './hooks/useNavigationProgress'
export { toast } from './utils/toast'
export { formatCurrency, formatQuantity, getCurrentCurrency, getCurrentLocale } from './utils/formatters'

// ============================================
// Layout primitives (require @lwm/auth as peer)
// ============================================
export { default as DashboardLayout, type DashboardLayoutProps } from './components/DashboardLayout'
export { default as Sidebar, type SidebarProps } from './components/Sidebar'
export { default as HeaderNavbar } from './components/HeaderNavbar'
export { PublicHeader } from './components/PublicHeader'
export { PublicFooter } from './components/PublicFooter'
export { DynamicRoleGuard } from './components/DynamicRoleGuard'
export { default as RoleGuard, withRoleGuard } from './components/RoleGuard'
export { default as NavigationProgress } from './components/NavigationProgress'
export {
  GlobalToastProvider,
  useGlobalToast,
} from './components/GlobalToastProvider'

// ============================================
// Layout-level hook + types (consumer wires its own NavigationConfig)
// ============================================
export {
  useNavigation,
  type NavigationItem,
  type NavigationGroup,
  type DisabledModule,
  type NavigationSection,
  type NavigationConfig,
  type UseNavigationResult,
} from './hooks/useNavigation'
// toastStore: zustand store consumed by DashboardLayout. The store also
// exposes a convenience hook `useToastStoreHook` (intentionally renamed
// from `useGlobalToast` in 2026-05-12 to avoid colliding with the
// context-based useGlobalToast in GlobalToastProvider — deuda B4). We
// only re-export the bare store and its item type here.
export { useToastStore, type ToastItem as ToastStoreItem } from './stores/toastStore'
