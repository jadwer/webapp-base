/**
 * AYUDAS DE FRACCIONAMIENTO (P3 granel)
 * Clave de idempotencia del formulario y calculo del factor de conversion a
 * partir del contenido de cada pieza.
 */

import { formatDate } from './format'

/**
 * Clave unica para una operacion de fraccionamiento. Se genera al abrir el
 * formulario y se reusa en cada reintento: el backend responde el mismo
 * fraccionamiento si el POST se repite (doble clic, red caida).
 */
export const newIdempotencyKey = (): string => {
  const c = (globalThis as { crypto?: Crypto }).crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  // Respaldo para entornos sin randomUUID (contexto no seguro)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = Math.floor(Math.random() * 16)
    const v = ch === 'x' ? r : (r % 4) + 8
    return v.toString(16)
  })
}

type Dimension = 'volume' | 'mass'

interface UnitScale {
  dimension: Dimension
  /** Cuantas unidades base (L o kg) es 1 de esta unidad */
  toBase: number
  label: string
}

/** Unidades SAT con equivalencia conocida (clave SAT -> escala) */
export const UNIT_SCALES: Record<string, UnitScale> = {
  MLT: { dimension: 'volume', toBase: 0.001, label: 'ml' },
  LTR: { dimension: 'volume', toBase: 1, label: 'L' },
  GLL: { dimension: 'volume', toBase: 3.785411784, label: 'gal' },
  MGM: { dimension: 'mass', toBase: 0.000001, label: 'mg' },
  GRM: { dimension: 'mass', toBase: 0.001, label: 'g' },
  KGM: { dimension: 'mass', toBase: 1, label: 'kg' },
}

/** Valor especial: el contenido se captura en la unidad del producto origen (factor inverso) */
export const SOURCE_UNIT = 'SOURCE'

export interface ContentUnitOption {
  code: string
  label: string
}

/**
 * Unidades en que se puede capturar el contenido de una pieza. Siempre
 * incluye la unidad del origen (captura inversa); si la unidad del origen es
 * de volumen o masa conocida, agrega las de la misma dimension.
 */
export const contentUnitOptions = (sourceUnit?: { code?: string; name?: string } | null): ContentUnitOption[] => {
  const code = sourceUnit?.code?.toUpperCase()
  const scale = code ? UNIT_SCALES[code] : undefined
  const sourceLabel = scale?.label || sourceUnit?.name || 'unidad del origen'
  const options: ContentUnitOption[] = [{ code: SOURCE_UNIT, label: `${sourceLabel} (unidad del origen)` }]
  if (!scale) return options
  Object.entries(UNIT_SCALES)
    .filter(([other, s]) => s.dimension === scale.dimension && other !== code)
    .forEach(([other, s]) => options.push({ code: other, label: s.label }))
  return options
}

/**
 * Factor de conversion (piezas destino por 1 unidad origen) a partir del
 * contenido de cada pieza. Redondeado a 6 decimales, que es lo que guarda el
 * backend. null si el dato no alcanza.
 *
 * Ej.: granel en L y pieza de 25 ml -> 1 / 0.025 = 40.
 */
export const factorFromContent = (
  content: number,
  contentUnit: string,
  sourceUnitCode?: string | null,
): number | null => {
  if (!(content > 0)) return null
  let contentInSource: number
  if (contentUnit === SOURCE_UNIT) {
    contentInSource = content
  } else {
    const from = UNIT_SCALES[contentUnit]
    const to = sourceUnitCode ? UNIT_SCALES[sourceUnitCode.toUpperCase()] : undefined
    if (!from || !to || from.dimension !== to.dimension) return null
    contentInSource = (content * from.toBase) / to.toBase
  }
  if (!(contentInSource > 0)) return null
  return Math.round((1 / contentInSource) * 1e6) / 1e6
}

/** Redondea a 6 decimales (la columna conversion_factor es decimal 15,6) */
export const roundFactor = (value: number): number => Math.round(value * 1e6) / 1e6

/** Estados de lote (ProductBatchRequest) en texto para la razon de bloqueo. */
const BATCH_STATUS_TEXT: Record<string, string> = {
  expired: 'vencido',
  quarantine: 'en cuarentena',
  recalled: 'retirado',
  consumed: 'consumido',
}

/**
 * D10: por que un lote de la vista previa NO se puede fraccionar, o null si
 * se puede. Manda el backend (`is_usable` + `unavailable_reason`, ya en
 * espanol); como respaldo se deriva en el mismo orden que
 * FractionationService::assertBatchUsable: estado, calidad y caducidad (con
 * fecha dd/mm/aaaa).
 */
export const batchUnavailableReason = (batch: {
  status?: string | null
  quality_status?: string | null
  is_expired?: boolean
  expiration_date?: string | null
  is_usable?: boolean
  unavailable_reason?: string | null
}): string | null => {
  if (batch.is_usable === true) return null
  if (batch.unavailable_reason) return batch.unavailable_reason
  if (batch.status && batch.status !== 'active') {
    return `lote inactivo (${BATCH_STATUS_TEXT[batch.status] ?? batch.status})`
  }
  if (batch.quality_status === 'quarantine') return 'en cuarentena por calidad'
  if (batch.quality_status === 'failed') return 'calidad rechazada'
  if (batch.is_expired) {
    return batch.expiration_date ? `caducado el ${formatDate(batch.expiration_date)}` : 'caducado'
  }
  if (batch.is_usable === false) return 'el lote no está disponible'
  return null
}
