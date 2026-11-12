'use client'

import React from 'react'
import type { CatalogBlock, DesignCatalog, LayoutCell, LayoutColumn } from './types'
import { columnKey, compactColumn, moveColumn, widthTotal } from './layoutOps'

interface CellEditorProps {
  cell: LayoutCell
  catalog: DesignCatalog
  /** En una fila de dos celdas las partidas no se ofrecen (van solas). */
  shared: boolean
  idPrefix: string
  onBlock: (block: string) => void
  onOption: (name: string, value: unknown) => void
}

const triState = (value: unknown) => (value === true ? 'yes' : value === false ? 'no' : '')

export function CellEditor({ cell, catalog, shared, idPrefix, onBlock, onOption }: CellEditorProps) {
  const block: CatalogBlock | undefined = catalog.blocks.find((b) => b.key === cell.block)
  const options = cell.options ?? {}

  return (
    <div>
      <label className="form-label small fw-semibold mb-1" htmlFor={`${idPrefix}-block`}>Sección</label>
      <select
        id={`${idPrefix}-block`}
        className="form-select form-select-sm"
        value={cell.block}
        onChange={(e) => onBlock(e.target.value)}
      >
        {catalog.blocks.map((b) => (
          <option key={b.key} value={b.key} disabled={shared && b.alone}>
            {b.label}{shared && b.alone ? ' (va sola en su fila)' : ''}
          </option>
        ))}
      </select>
      {block && <div className="form-text">{block.description}</div>}

      {block?.options.map((opt) => {
        const id = `${idPrefix}-${opt.key}`
        if (opt.type === 'bool') {
          return (
            <div key={opt.key} className="mt-2">
              <label className="form-label small mb-1" htmlFor={id}>{opt.label}</label>
              <select
                id={id}
                className="form-select form-select-sm"
                value={triState(options[opt.key])}
                onChange={(e) => onOption(opt.key, e.target.value === '' ? undefined : e.target.value === 'yes')}
              >
                <option value="">Como viene de fábrica</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )
        }
        if (opt.type === 'text') {
          return (
            <div key={opt.key} className="mt-2">
              <label className="form-label small mb-1" htmlFor={id}>{opt.label}</label>
              <input
                id={id}
                className="form-control form-control-sm"
                value={typeof options[opt.key] === 'string' ? (options[opt.key] as string) : ''}
                placeholder="Como viene de fábrica"
                onChange={(e) => onOption(opt.key, e.target.value === '' ? undefined : e.target.value)}
              />
            </div>
          )
        }
        if (opt.type === 'cols') {
          return (
            <div key={opt.key} className="mt-2">
              <label className="form-label small mb-1" htmlFor={id}>{opt.label}</label>
              <select
                id={id}
                className="form-select form-select-sm"
                value={options[opt.key] === 1 || options[opt.key] === 2 ? String(options[opt.key]) : ''}
                onChange={(e) => onOption(opt.key, e.target.value === '' ? undefined : Number(e.target.value))}
              >
                <option value="">Como viene de fábrica</option>
                <option value="1">Una columna</option>
                <option value="2">Dos columnas</option>
              </select>
            </div>
          )
        }
        if (opt.type === 'keys') {
          return (
            <MetaKeys
              key={opt.key}
              id={id}
              label={opt.label}
              available={catalog.meta}
              value={Array.isArray(options[opt.key]) ? (options[opt.key] as string[]) : undefined}
              onChange={(keys) => onOption(opt.key, keys)}
            />
          )
        }
        return (
          <ColumnsEditor
            key={opt.key}
            id={id}
            available={catalog.columns}
            value={Array.isArray(options[opt.key]) ? (options[opt.key] as LayoutColumn[]) : []}
            onChange={(cols) => onOption(opt.key, cols)}
          />
        )
      })}
    </div>
  )
}

function MetaKeys({ id, label, available, value, onChange }: {
  id: string
  label: string
  available: DesignCatalog['meta']
  value: string[] | undefined
  onChange: (keys: string[] | undefined) => void
}) {
  if (available.length === 0) return null
  const chosen = value ?? []
  const toggle = (key: string, on: boolean) => {
    // Se guardan en el orden del catalogo; vacio vuelve a "los tres primeros".
    const next = available.map((a) => a.key).filter((k) => (k === key ? on : chosen.includes(k)))
    onChange(next.length ? next : undefined)
  }
  return (
    <fieldset className="mt-2">
      <legend className="form-label small mb-1">{label}</legend>
      {value === undefined && <div className="form-text mt-0 mb-1">Sin elegir: se muestran los tres primeros.</div>}
      <div className="d-flex flex-wrap gap-3">
        {available.map((m) => (
          <div key={m.key} className="form-check">
            <input
              id={`${id}-${m.key}`}
              type="checkbox"
              className="form-check-input"
              checked={chosen.includes(m.key)}
              onChange={(e) => toggle(m.key, e.target.checked)}
            />
            <label className="form-check-label small" htmlFor={`${id}-${m.key}`}>{m.label}</label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

function ColumnsEditor({ id, available, value, onChange }: {
  id: string
  available: DesignCatalog['columns']
  value: LayoutColumn[]
  onChange: (cols: LayoutColumn[]) => void
}) {
  const labelOf = (key: string) => available.find((a) => a.key === key)?.label ?? key
  const included = value.map(columnKey)
  const rest = available.filter((a) => !included.includes(a.key))
  const total = widthTotal(value)

  const update = (index: number, label?: string, width?: number) => {
    const next = [...value]
    next[index] = compactColumn(columnKey(value[index]), label, width)
    onChange(next)
  }

  return (
    <fieldset className="mt-2">
      <legend className="form-label small mb-1">Columnas de la tabla</legend>
      <table className="table table-sm align-middle mb-1">
        <thead>
          <tr className="small text-muted">
            <th>Columna</th>
            <th>Encabezado</th>
            <th style={{ width: 88 }}>Ancho %</th>
            <th className="text-end">Orden</th>
          </tr>
        </thead>
        <tbody>
          {value.map((col, i) => {
            const key = columnKey(col)
            const label = typeof col === 'object' ? col.label : undefined
            const width = typeof col === 'object' ? col.width : undefined
            return (
              <tr key={key}>
                <td className="small">{labelOf(key)}</td>
                <td>
                  <input
                    aria-label={`Encabezado de ${labelOf(key)}`}
                    className="form-control form-control-sm"
                    value={label ?? ''}
                    placeholder={labelOf(key)}
                    onChange={(e) => update(i, e.target.value, width)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Ancho de ${labelOf(key)}`}
                    type="number"
                    min={1}
                    max={100}
                    className="form-control form-control-sm"
                    value={width ?? ''}
                    placeholder="auto"
                    onChange={(e) => update(i, label, e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </td>
                <td className="text-end text-nowrap">
                  <button type="button" className="btn btn-sm btn-link px-1" aria-label={`Subir ${labelOf(key)}`} disabled={i === 0} onClick={() => onChange(moveColumn(value, i, -1))}>
                    <i className="bi bi-arrow-up" aria-hidden="true" />
                  </button>
                  <button type="button" className="btn btn-sm btn-link px-1" aria-label={`Bajar ${labelOf(key)}`} disabled={i === value.length - 1} onClick={() => onChange(moveColumn(value, i, 1))}>
                    <i className="bi bi-arrow-down" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger px-1"
                    aria-label={`Quitar ${labelOf(key)}`}
                    disabled={value.length === 1}
                    title={value.length === 1 ? 'La tabla necesita al menos una columna' : undefined}
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <i className="bi bi-x-lg" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {total > 100 && (
        <div className="text-danger small mb-1" role="alert">Los anchos suman {total}%; no pueden pasar de 100.</div>
      )}
      {rest.length > 0 && (
        <div className="d-flex flex-wrap gap-1 align-items-center">
          <span className="small text-muted me-1">Agregar:</span>
          {rest.map((a) => (
            <button key={a.key} type="button" className="btn btn-sm btn-outline-secondary" id={`${id}-add-${a.key}`} onClick={() => onChange([...value, a.key])}>
              + {a.label}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}
