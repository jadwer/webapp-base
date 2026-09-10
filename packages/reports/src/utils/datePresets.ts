// Compatibility shim. Date presets now live in @lwm/ui.
// Existing imports `from '@/modules/reports/utils/datePresets'` (and the
// relative ones inside reports) keep working through this re-export.
export { DATE_PRESETS, getPresetDates } from '@lwm/ui'
