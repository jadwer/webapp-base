// @lwm/primitives — auth-agnostic UI primitives + utilities shared by
// @lwm/ui (layout) and @lwm/auth (forms). This package sits BELOW both
// in the dependency graph to break the historical @lwm/auth ↔ @lwm/ui
// import cycle.
//
// Migration notes (deuda B5, sesion 2026-05-12):
// - Before: @lwm/ui exported parseJsonApiErrors, StatusMessage, Input,
//   useIsClient. @lwm/auth imported them from @lwm/ui. The layout
//   primitives in @lwm/ui then imported from @lwm/auth, closing a
//   cycle that required load-bearing export order in the barrel.
// - After: these four symbols live here. @lwm/auth imports them from
//   @lwm/primitives. @lwm/ui re-exports them through its barrel so the
//   apps/template and clients/<name>/webapp/ consumers do NOT need to
//   change their imports (`import { Input } from '@lwm/ui'` still works).

// Utils
export * from './utils/parseJsonApiErrors'

// Hooks
export * from './hooks/useIsClient'

// Components
export { default as StatusMessage } from './components/StatusMessage'
export { Input, Textarea, Select } from './components/base/Input'
export type { InputProps, TextareaProps, SelectProps } from './components/base/Input'
