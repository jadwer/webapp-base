// Compatibility shim. PageBuilder module now lives in @lwm/page-builder.
// `export *` does NOT re-export the default — must do it explicitly.
export * from '@lwm/page-builder'
export { default } from '@lwm/page-builder'
