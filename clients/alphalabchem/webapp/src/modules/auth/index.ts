// Compatibility shim. Auth module now lives in @lwm/auth.
// Existing imports `from '@/modules/auth'` keep working through this re-export.
// Future cleanup pass replaces them with `from '@lwm/auth'`.
export * from '@lwm/auth'
