// Compatibility shim. parseJsonApiErrors now lives in @lwm/ui. Existing
// imports `from '@/lib/parseJsonApiErrors'` keep working through this
// re-export. Future cleanup pass replaces them with `from '@lwm/ui'`.
export { parseJsonApiErrors } from '@lwm/ui'
