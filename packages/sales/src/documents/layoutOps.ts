import type { RawLayout } from './types'

/**
 * Operaciones puras de estilo sobre el diseno. Nunca mutan y nunca tocan el
 * contenido (secciones, columnas, datos): solo opciones de estilo.
 */

const clone = (layout: RawLayout): RawLayout => JSON.parse(JSON.stringify(layout))

/** Pone o quita (undefined) una opcion de estilo de una celda. */
export function setCellStyle(layout: RawLayout, row: number, cell: number, name: string, value: unknown): RawLayout {
  const next = clone(layout)
  const target = next.rows[row]?.cells[cell]
  if (!target) return layout
  const options = { ...(target.options ?? {}) }
  if (value === undefined) delete options[name]
  else options[name] = value
  if (Object.keys(options).length) target.options = options
  else delete target.options
  return next
}

/** Color del documento o acento; undefined quita la llave (acento: el de la marca). */
export function setThemeStyle(layout: RawLayout, name: 'mode' | 'accent', value: string | undefined): RawLayout {
  const next = clone(layout)
  const theme = { ...(next.theme ?? {}) }
  if (value === undefined || value === '') delete theme[name]
  else theme[name] = value
  next.theme = theme
  return next
}

/** Opcion de estilo de la pagina, en notacion del catalogo ("footer.rule"). */
export function setPageStyle(layout: RawLayout, key: string, value: unknown): RawLayout {
  const next = clone(layout)
  const [group, name] = key.split('.')
  const page: Record<string, unknown> = { ...(next.page ?? {}) }
  if (name) {
    const inner = { ...((page[group] as Record<string, unknown>) ?? {}) }
    if (value === undefined) delete inner[name]
    else inner[name] = value
    page[group] = inner
  } else if (value === undefined) delete page[group]
  else page[group] = value
  next.page = page as RawLayout['page']
  return next
}

/** Valor actual de una opcion de pagina ("footer.rule"). */
export function pageValue(layout: RawLayout, key: string): unknown {
  const [group, name] = key.split('.')
  const page = (layout.page ?? {}) as Record<string, unknown>
  return name ? (page[group] as Record<string, unknown> | undefined)?.[name] : page[group]
}
