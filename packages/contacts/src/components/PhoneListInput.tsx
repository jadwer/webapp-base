'use client'

/**
 * Lista de telefonos del contacto (2026-09-30, peticion de Jasim).
 * Cada fila: etiqueta (Matriz, Suc. Zapopan...), lada (+52 por defecto),
 * numero y extension. Al teclear se quitan espacios y simbolos; con +52 el
 * numero se limita a 10 digitos y con otra lada a 12. Pegar un telefono
 * completo ("+52 55 1666 6344 ext 2213") lo reparte en lada, numero y ext.
 */

import React from 'react'
import type { ContactPhone } from '../types'
import {
  DEFAULT_COUNTRY_CODE,
  MAX_EXT_DIGITS,
  digitsOnly,
  emptyPhone,
  maxDigitsFor,
  parsePhoneText,
  phoneError,
} from '../utils/phones'

export interface PhoneListInputProps {
  value: ContactPhone[]
  onChange: (phones: ContactPhone[]) => void
  /** Muestra los errores de cada fila (tras intentar avanzar o guardar). */
  showErrors?: boolean
  disabled?: boolean
  max?: number
}

export const PhoneListInput: React.FC<PhoneListInputProps> = ({
  value,
  onChange,
  showErrors = false,
  disabled = false,
  max = 10,
}) => {
  const rows = value.length > 0 ? value : [emptyPhone()]

  const update = (index: number, patch: Partial<ContactPhone>) => {
    const next = rows.map((row, i) => {
      if (i !== index) return row
      const merged = { ...row, ...patch }
      // Si cambia la lada, recortar el numero al nuevo maximo.
      merged.number = digitsOnly(merged.number).slice(0, maxDigitsFor(merged.code))
      return merged
    })
    onChange(next)
  }

  const onPasteNumber = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    if (!/[^\d]/.test(text)) return // solo digitos: dejar el flujo normal
    e.preventDefault()
    const parsed = parsePhoneText(text)
    update(index, { code: parsed.code, number: parsed.number, ext: parsed.ext || rows[index].ext })
  }

  const remove = (index: number) => onChange(rows.filter((_, i) => i !== index))

  return (
    <div className="phone-list-input">
      <div className="row g-2 small text-muted d-none d-md-flex mb-1">
        <div className="col-md-4">Etiqueta</div>
        <div className="col-md-2">Lada</div>
        <div className="col-md-3">Teléfono</div>
        <div className="col-md-2">Ext.</div>
      </div>
      {rows.map((row, index) => {
        const error = showErrors && (row.number || rows.length > 1 || row.label) ? phoneError(row) : null
        const maxDigits = maxDigitsFor(row.code)
        return (
          <div key={index} className="mb-2">
            <div className="row g-2 align-items-start">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder={index === 0 ? 'Matriz' : 'Suc. Zapopan'}
                  aria-label={`Etiqueta del teléfono ${index + 1}`}
                  value={row.label ?? ''}
                  maxLength={60}
                  onChange={(e) => update(index, { label: e.target.value })}
                  disabled={disabled}
                />
              </div>
              <div className="col-4 col-md-2">
                <div className="input-group">
                  <span className="input-group-text">+</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    aria-label={`Lada del teléfono ${index + 1}`}
                    value={row.code ?? DEFAULT_COUNTRY_CODE}
                    onChange={(e) => update(index, { code: digitsOnly(e.target.value).slice(0, 4) })}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="col-8 col-md-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  placeholder={maxDigits === 10 ? '5516666344' : 'Número'}
                  aria-label={`Número del teléfono ${index + 1}`}
                  value={row.number}
                  onChange={(e) => update(index, { number: e.target.value })}
                  onPaste={(e) => onPasteNumber(index, e)}
                  disabled={disabled}
                />
                <div className="form-text">
                  {digitsOnly(row.number).length}/{maxDigits} dígitos
                </div>
              </div>
              <div className="col-8 col-md-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-control"
                  placeholder="2213"
                  aria-label={`Extensión del teléfono ${index + 1}`}
                  value={row.ext ?? ''}
                  onChange={(e) => update(index, { ext: digitsOnly(e.target.value).slice(0, MAX_EXT_DIGITS) })}
                  disabled={disabled}
                />
              </div>
              <div className="col-4 col-md-1 text-end">
                {(rows.length > 1 || row.number) && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    aria-label={`Quitar teléfono ${index + 1}`}
                    onClick={() => remove(index)}
                    disabled={disabled}
                  >
                    <i className="bi bi-trash" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {error && <div className="text-danger small mt-1">Teléfono {index + 1}: {error}</div>}
          </div>
        )
      })}
      {rows.length < max && (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onChange([...rows, emptyPhone()])}
          disabled={disabled}
        >
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Agregar teléfono
        </button>
      )}
    </div>
  )
}

export default PhoneListInput
