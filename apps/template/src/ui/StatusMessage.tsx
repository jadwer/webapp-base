// Compatibility shim. StatusMessage now lives in @lwm/ui. Existing default
// imports `from '@/ui/StatusMessage'` keep working through the named-to-default
// re-aliasing below; named imports also resolve via the same line.
export { StatusMessage as default, StatusMessage } from '@lwm/ui'
