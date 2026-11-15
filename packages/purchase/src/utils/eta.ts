/**
 * Estado de la fecha estimada de llegada (ETA) de una orden de compra
 * (junta con LWM 2026-11-12, J1). Solo cuenta mientras la orden no se recibe
 * ni se cancela: una orden recibida ya llego, una cancelada no va a llegar.
 */
export type EtaTone = 'none' | 'late' | 'today' | 'ok' | 'closed'

export interface EtaStatus {
  tone: EtaTone
  /** Dias de atraso (late) o que faltan (ok); 0 en el resto. */
  days: number
  label: string
}

const CLOSED = ['received', 'cancelled', 'completed']

/** Dias entre dos fechas Y-m-d, sin zona horaria. */
function daysBetween(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.slice(0, 10).split('-').map(Number)
  const [ty, tm, td] = toYmd.slice(0, 10).split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}

export function localTodayYmd(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function etaStatus(expectedArrivalDate: string | null | undefined, status: string, today: string = localTodayYmd()): EtaStatus {
  if (!expectedArrivalDate) return { tone: 'none', days: 0, label: 'Sin fecha del proveedor' }
  if (CLOSED.includes(status)) return { tone: 'closed', days: 0, label: '' }
  const diff = daysBetween(today, expectedArrivalDate)
  if (diff < 0) {
    const late = -diff
    return { tone: 'late', days: late, label: late === 1 ? 'Atrasada 1 día' : `Atrasada ${late} días` }
  }
  if (diff === 0) return { tone: 'today', days: 0, label: 'Llega hoy' }
  return { tone: 'ok', days: diff, label: diff === 1 ? 'Falta 1 día' : `Faltan ${diff} días` }
}

/** Clase de badge de Bootstrap para cada estado. */
export const ETA_BADGE: Record<EtaTone, string> = {
  none: 'bg-light text-dark',
  late: 'bg-danger',
  today: 'bg-warning text-dark',
  ok: 'bg-info text-dark',
  closed: 'bg-secondary',
}
