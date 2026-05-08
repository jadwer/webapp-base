// Compatibility shim. AppConfig module now lives in @lwm/app-config.
// Existing imports `from '@/modules/app-config'` keep working through this re-export.
// Future cleanup pass replaces them with `from '@lwm/app-config'`.
export * from '@lwm/app-config'
