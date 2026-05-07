// @lwm/ui - shared base UI components for the LWM codebase.
//
// Currently exports the design-system base primitives (Button, Card, Input,
// Modal, etc.). Layout-level components (DashboardLayout, Sidebar,
// HeaderNavbar) and module-specific UI live in the apps/template repo until
// Fase 3 extracts them too.

export * from './components/base'
export { default as StatusMessage } from './components/StatusMessage'
export * from './hooks/useToast'
export * from './hooks/useIsClient'
export * from './utils/parseJsonApiErrors'
