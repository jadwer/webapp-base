/**
 * Fechas sin hora de ventas. La logica vive en @lwm/ui (utils/dates); aqui
 * se conserva la API previa del paquete, con el formato corto de mes que ya
 * usaban las tablas de ventas ("16 jul 2026").
 */

import { formatDateOnly as formatDateOnlyUi, parseDateOnly } from '@lwm/ui'

export { parseDateOnly }

export function formatDateOnly(
  dateString: string | null | undefined,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  return formatDateOnlyUi(dateString, locale, options)
}
