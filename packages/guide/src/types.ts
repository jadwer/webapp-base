/**
 * Contrato de GET /api/v1/guide/{type}/{id}, version 1 (atomo/guide,
 * guide-v1.schema.json). El backend arma las frases y decide quien puede;
 * la pantalla solo muestra y enruta.
 */

export interface GuideBlocker {
  field: string
  message: string
}

export type GuideActionKind = 'primary' | 'secondary'

export interface GuideAction {
  key: string
  /** La frase en espanol, con el folio ("Confirma el pedido OV-26-000112"). */
  phrase: string
  department: string
  /** primary: el camino hacia adelante; secondary: cancelar o un paso que se salta a proposito. */
  kind: GuideActionKind
  /** Quien pregunta la puede hacer (la misma regla que el endpoint). */
  allowed: boolean
  requiresReason: boolean
  /** Datos que pide el endpoint: la pantalla abre su propio formulario (D10). */
  asks: string[]
  blockers: GuideBlocker[]
  action: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
    body: Record<string, unknown> | null
  }
}

export interface GuideHistoryStep {
  from: string | null
  to: string
  at: string | null
  by: string | null
  reason: string | null
}

export interface GuideDocument {
  type: string
  id: string
  label: string
  status: string | null
  department: string
  next: GuideAction[]
}

export interface GuideTrailEntry extends GuideDocument {
  current: boolean
  history: GuideHistoryStep[]
}

export interface GuideData extends GuideDocument {
  trail: GuideTrailEntry[]
}

export interface GuideResponse {
  version: 1
  data: GuideData
}
