// Compatibility shim. axiosClient now lives in @lwm/auth (the package owns
// the Bearer token interceptor). Existing imports `from '@/lib/axiosClient'`
// keep working through this re-export.
export { axiosClient as default } from '@lwm/auth'
