// Compatibility shim. useToast now lives in @lwm/ui.
// Existing imports `from '@/ui/hooks/useToast'` keep working through this
// re-export. Fase 3 / future cleanup pass replaces them with `from '@lwm/ui'`.
export { useToast } from '@lwm/ui'
export type { ToastItem } from '@lwm/ui'
