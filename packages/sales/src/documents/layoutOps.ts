import type { LayoutColumn, LayoutRow, RawLayout } from './types'

/**
 * Operaciones puras sobre el diseno. Nunca mutan: devuelven un diseno nuevo.
 * Las reglas del formato que el editor respeta por construccion: una fila
 * lleva una o dos celdas, los span suman 12 y las partidas van solas.
 */

const clone = (layout: RawLayout): RawLayout => JSON.parse(JSON.stringify(layout))

export function moveRow(layout: RawLayout, index: number, delta: -1 | 1): RawLayout {
  const target = index + delta
  if (target < 0 || target >= layout.rows.length) return layout
  const next = clone(layout)
  const [row] = next.rows.splice(index, 1)
  next.rows.splice(target, 0, row)
  return next
}

export function removeRow(layout: RawLayout, index: number): RawLayout {
  const next = clone(layout)
  next.rows.splice(index, 1)
  return next
}

export function addRow(layout: RawLayout, block: string, defaults: Record<string, unknown> = {}): RawLayout {
  const next = clone(layout)
  const row: LayoutRow = { cells: [Object.keys(defaults).length ? { block, options: defaults } : { block }] }
  next.rows.push(row)
  return next
}

/** Parte una fila de una celda en dos (mitad y mitad) con un bloque nuevo a la derecha. */
export function splitRow(layout: RawLayout, index: number, block: string): RawLayout {
  const next = clone(layout)
  const row = next.rows[index]
  if (!row || row.cells.length !== 1) return layout
  row.cells = [{ ...row.cells[0], span: 6 }, { block, span: 6 }]
  return next
}

/** Quita una celda de una fila de dos; la que queda ocupa todo el ancho. */
export function removeCell(layout: RawLayout, index: number, cell: 0 | 1): RawLayout {
  const next = clone(layout)
  const row = next.rows[index]
  if (!row || row.cells.length !== 2) return layout
  const keep = { ...row.cells[cell === 0 ? 1 : 0] }
  delete keep.span
  row.cells = [keep]
  return next
}

/** Ancho de la celda izquierda (1 a 11); la derecha toma el resto. */
export function setLeftSpan(layout: RawLayout, index: number, span: number): RawLayout {
  const next = clone(layout)
  const row = next.rows[index]
  if (!row || row.cells.length !== 2) return layout
  const left = Math.min(11, Math.max(1, Math.round(span)))
  row.cells[0].span = left
  row.cells[1].span = 12 - left
  return next
}

export function spanOf(row: LayoutRow, cell: number): number {
  const explicit = row.cells[cell]?.span
  return typeof explicit === 'number' ? explicit : Math.floor(12 / row.cells.length)
}

/** Cambia el bloque de una celda; las opciones del bloque anterior no aplican y se quitan. */
export function setBlock(layout: RawLayout, index: number, cell: number, block: string): RawLayout {
  const next = clone(layout)
  const target = next.rows[index]?.cells[cell]
  if (!target) return layout
  target.block = block
  delete target.options
  return next
}

/** Pone o quita (undefined) una opcion de una celda. */
export function setOption(layout: RawLayout, index: number, cell: number, name: string, value: unknown): RawLayout {
  const next = clone(layout)
  const target = next.rows[index]?.cells[cell]
  if (!target) return layout
  const options = { ...(target.options ?? {}) }
  if (value === undefined) delete options[name]
  else options[name] = value
  if (Object.keys(options).length) target.options = options
  else delete target.options
  return next
}

export function columnKey(column: LayoutColumn): string {
  return typeof column === 'string' ? column : column.key
}

/** Columna en su forma mas corta: la clave sola si no lleva texto ni ancho. */
export function compactColumn(key: string, label?: string, width?: number): LayoutColumn {
  const clean: { key: string; label?: string; width?: number } = { key }
  if (label && label.trim() !== '') clean.label = label
  if (typeof width === 'number' && width > 0) clean.width = width
  return Object.keys(clean).length === 1 ? key : clean
}

export function moveColumn(columns: LayoutColumn[], index: number, delta: -1 | 1): LayoutColumn[] {
  const target = index + delta
  if (target < 0 || target >= columns.length) return columns
  const next = [...columns]
  const [col] = next.splice(index, 1)
  next.splice(target, 0, col)
  return next
}

/** Suma de los anchos fijados; el formato no deja pasar de 100. */
export function widthTotal(columns: LayoutColumn[]): number {
  return columns.reduce((sum, c) => sum + (typeof c === 'object' && typeof c.width === 'number' ? c.width : 0), 0)
}
