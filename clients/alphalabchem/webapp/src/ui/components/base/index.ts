/**
 * Compatibility re-export shim.
 *
 * The base UI primitives (Button, Card, Input, Modal, etc.) live in the
 * `@lwm/ui` workspace package after Fase 2 of the WP-style refactor. This
 * shim lets the existing `import { X } from '@/ui/components/base'` calls in
 * `apps/template` keep working without rewriting 218 import sites in this
 * phase. Fase 3 (or a later cleanup pass) replaces the imports directly with
 * `from '@lwm/ui'` and removes this shim.
 */
export * from '@lwm/ui'
