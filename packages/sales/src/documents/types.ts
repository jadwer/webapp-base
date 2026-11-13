/**
 * Diseno de los PDF (2026-11-12): el usuario elige COMO se ve cada documento
 * (plantilla de la galeria y estilo fila por fila, como las plantillas de
 * Bind), no su contenido. El diseno es el formato v1 de atomo/documents tal
 * cual. La galeria, las opciones con sus valores y nombres y las miniaturas
 * las manda el backend; el panel no guarda copia (regla 7).
 */

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
  theme?: { mode?: string; accent?: string }
  page?: { watermark?: string | null; footer?: { legal?: boolean; pageNumbers?: boolean; rule?: string } }
  rows: LayoutRow[]
}

export interface StyleOption {
  key: string
  label: string
  type: 'enum' | 'bool' | 'color' | 'text' | 'keys' | 'columns'
  style: boolean
  default: unknown
  values?: Array<{ value: string; label: string }>
}

export interface DesignCatalog {
  blocks: Record<string, { label: string; options: StyleOption[] }>
  theme: StyleOption[]
  page: StyleOption[]
}

export interface DesignStyle {
  key: string
  label: string
  description: string
  thumbnail: boolean
}

export interface DocumentDesignSummary {
  type: string
  label: string
  enabledKey: string
  enabled: boolean
  customized: boolean
  style: string
}

export interface DocumentDesign extends DocumentDesignSummary {
  layout: RawLayout
  updatedAt: string | null
  styles: DesignStyle[]
  catalog: DesignCatalog
}
