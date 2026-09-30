'use client'

/**
 * Captura de varios correos como etiquetas (2026-09-30, peticion de Jasim).
 * Acepta escribir o pegar varios separados por coma, punto y coma, espacio o
 * Enter. Los validos se vuelven etiqueta; los invalidos se quedan en el
 * campo con el error en rojo, para corregirlos sin perder lo escrito.
 */

import React, { useState } from 'react'
import { normalizeEmails, singleEmailError, splitEmails } from '../../utils/emails'

export interface EmailChipsInputProps {
  id?: string
  label?: React.ReactNode
  value: string[]
  onChange: (emails: string[]) => void
  /** Correos que no se agregan (por ejemplo el principal del contacto). */
  exclude?: string[]
  placeholder?: string
  helpText?: string
  errorText?: string
  disabled?: boolean
  max?: number
}

export const EmailChipsInput: React.FC<EmailChipsInputProps> = ({
  id = 'email-chips',
  label,
  value,
  onChange,
  exclude = [],
  placeholder = 'correo@empresa.com, otro@empresa.com',
  helpText,
  errorText,
  disabled = false,
  max = 20,
}) => {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const commit = (text: string): string => {
    const parts = splitEmails(text)
    if (parts.length === 0) return ''
    const invalid = parts.filter((p) => singleEmailError(p, 'correo por separado') !== null)
    const valid = parts.filter((p) => !invalid.includes(p))
    const next = normalizeEmails([...value, ...valid], exclude).slice(0, max)
    if (next.length !== value.length) onChange(next)
    if (invalid.length > 0) {
      setError(`Correo no valido: ${invalid.join(', ')}`)
      return invalid.join(', ')
    }
    if (value.length + valid.length > max) {
      setError(`Se permiten hasta ${max} correos.`)
    } else {
      setError(null)
    }
    return ''
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault()
      setDraft(commit(draft))
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    // Al pegar o teclear un separador, se confirma lo anterior al separador.
    if (/[\s,;]$/.test(text) && text.trim() !== '') {
      setDraft(commit(text))
    } else {
      setDraft(text)
      if (error) setError(null)
    }
  }

  const remove = (email: string) => onChange(value.filter((v) => v !== email))
  const shownError = error ?? errorText ?? null

  return (
    <div>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div
        className={`form-control d-flex flex-wrap align-items-center gap-1 ${shownError ? 'is-invalid' : ''}`}
        style={{ minHeight: 38, height: 'auto' }}
        data-testid={`${id}-box`}
      >
        {value.map((email) => (
          <span key={email} className="badge rounded-pill text-bg-light border d-inline-flex align-items-center">
            {email}
            <button
              type="button"
              className="btn-close ms-1"
              style={{ fontSize: '0.55rem' }}
              aria-label={`Quitar ${email}`}
              onClick={() => remove(email)}
              disabled={disabled}
            />
          </span>
        ))}
        <input
          id={id}
          type="text"
          inputMode="email"
          className="border-0 flex-grow-1"
          style={{ outline: 'none', minWidth: 160 }}
          value={draft}
          onChange={onChangeText}
          onKeyDown={onKeyDown}
          onBlur={() => setDraft(commit(draft))}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          aria-invalid={shownError ? true : undefined}
        />
      </div>
      {shownError ? (
        <div className="invalid-feedback d-block">{shownError}</div>
      ) : (
        helpText && <div className="form-text">{helpText}</div>
      )}
    </div>
  )
}

export default EmailChipsInput
