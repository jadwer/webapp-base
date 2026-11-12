/**
 * Editor visual de documentos (2026-11-12). El diseno es el formato v1 de
 * atomo/documents tal cual: filas de una o dos celdas sobre una rejilla de 12.
 * El catalogo (que secciones, columnas y datos ofrece cada documento) lo manda
 * el backend; el panel no guarda copia (regla 7).
 */

export type LayoutColumn = string | { key: string; label?: string; width?: number }

export interface LayoutCell {
  block: string
  span?: number
  options?: Record<string, unknown>
}

export interface LayoutRow {
  cells: LayoutCell[]
}

export interface RawLayout {
  version: number
  name?: string
  theme?: { mode?: string }
  page?: { watermark?: string | null; footer?: { legal?: boolean; pageNumbers?: boolean } }
  rows: LayoutRow[]
}

export type BlockOptionType = 'bool' | 'text' | 'cols' | 'columns' | 'keys'

export interface CatalogBlock {
  key: string
  label: string
  description: string
  options: Array<{ key: string; type: BlockOptionType; label: string }>
  /** Las partidas van solas en su fila. */
  alone: boolean
}

export interface DesignCatalog {
  blocks: CatalogBlock[]
  columns: Array<{ key: string; label: string }>
  meta: Array<{ key: string; label: string }>
}

export interface DocumentDesignSummary {
  type: string
  label: string
  enabledKey: string
  enabled: boolean
  modeKey: string
  mode: string
  customized: boolean
}

export interface DocumentDesign extends DocumentDesignSummary {
  layout: RawLayout
  updatedAt: string | null
  catalog: DesignCatalog
  modes: Array<{ value: string; label: string }>
}
