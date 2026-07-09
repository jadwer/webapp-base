// Compatibility shim. toastStore now lives in @lwm/ui (stores/toastStore).
// The store-flavored useGlobalToast (zustand wrapper) is intentionally not
// re-exported here; consumers that need it pull `useGlobalToast` from the
// context-based provider in @lwm/ui directly.
export { useToastStore, type ToastStoreItem as ToastItem } from '@lwm/ui'
