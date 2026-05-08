// @lwm/ui - shared base UI components for the LWM codebase.
//
// Two layers:
//   1) design-system primitives (Button, Card, Input, Modal, Skeleton, ...)
//      that don't know anything about auth or app-config.
//   2) layout primitives (DashboardLayout, Sidebar, HeaderNavbar,
//      DynamicRoleGuard, ...) that DO consume @lwm/auth + @lwm/app-config
//      to render role-aware shells. They expect the consumer (template or
//      a clients/<name>/) to wire its own NavigationConfig.
//
// EXPORT ORDER IS LOAD-BEARING — DO NOT ALPHABETIZE.
// `@lwm/auth` imports `parseJsonApiErrors`, `StatusMessage`, `Input`, and
// `useIsClient` from this file (cycle pre-existing since Subfase 3.1).
// The layout primitives at the bottom of this file then import from
// `@lwm/auth`, closing the cycle. At module-load time, the partial
// namespace re-entered through the cycle MUST already contain those
// symbols, so the design-system primitives MUST be exported before the
// layout primitives. An "alphabetize exports" lint pass would break
// this. Tracked in project memory as deuda B5.

// ============================================
// Design-system primitives (auth-agnostic)
// ============================================
export * from './components/base'
export { default as StatusMessage } from './components/StatusMessage'
export { default as ToastNotifier, type ToastNotifierHandle, type ToastType as ToastNotifierType } from './components/ToastNotifier'
export { Skeleton } from './components/Skeleton'
export * from './hooks/useToast'
export * from './hooks/useIsClient'
export * from './hooks/useNavigationProgress'
export * from './utils/parseJsonApiErrors'
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
// toastStore: zustand store consumed by DashboardLayout (and indirectly by
// useGlobalToast in stores/toastStore.ts, which is a legacy alias of the
// context-based useGlobalToast in GlobalToastProvider). We export only
// `useToastStore` here; the alias `useGlobalToast` from the store
// shadows the provider one and is intentionally NOT re-exported.
export { useToastStore, type ToastItem as ToastStoreItem } from './stores/toastStore'
