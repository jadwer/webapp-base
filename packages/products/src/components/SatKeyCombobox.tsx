'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { useSatCatalogSearch } from '../hooks/useSatCatalogSearch'

interface SatKeyOption {
  clave: string
  label: string
}

interface SatKeyComboboxProps {
  label: string
  /** Clave actualmente seleccionada/capturada (puede venir del backend o de captura manual) */
  value: string | null | undefined
  onChange: (clave: string | null) => void
  kind: 'claveProdServ' | 'claveUnidad'
  placeholder?: string
  helpText?: string
  errorText?: string
  disabled?: boolean
  required?: boolean
}

/**
 * Combobox reutilizable para capturar una clave de catalogo SAT (clave de
 * producto/servicio o clave de unidad).
 *
 * Requisito de negocio (cliente LWM): el operador debe poder CAPTURAR LA
 * CLAVE A MANO sin depender de que el catalogo la tenga indexada o de que
 * la busqueda encuentre resultados (catalogos SAT tienen miles de entradas
 * y no todas se indexan igual). Por eso el combobox es, en esencia, un
 * <input> de texto libre:
 *
 * - Mientras el usuario escribe (2+ caracteres) se dispara una busqueda
 *   con debounce (300ms, ver useSatCatalogSearch) y se muestra un dropdown
 *   con "clave - descripcion".
 * - Si el usuario selecciona una opcion del dropdown, se guarda esa clave
 *   y se muestra el resumen "clave - descripcion".
 * - Si el usuario NO selecciona nada y sale del campo (blur) o guarda el
 *   formulario, el texto libre escrito se conserva tal cual como la clave
 *   (captura manual). No se fuerza a que exista en el catalogo.
 * - El boton "x" limpia la seleccion/captura y regresa el campo a texto
 *   libre vacio.
 */
export const SatKeyCombobox: React.FC<SatKeyComboboxProps> = ({
  label,
  value,
  onChange,
  kind,
  placeholder,
  helpText,
  errorText,
  disabled = false,
  required = false
}) => {
  const inputId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const { term, setTerm, results, isSearching } = useSatCatalogSearch(kind)

  // Descripcion de la clave actualmente seleccionada (solo se conoce si
  // vino de un resultado de busqueda; si es captura manual no hay label).
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  // Texto libre mientras el usuario edita (antes de confirmar/blur)
  const [draft, setDraft] = useState<string>(value || '')

  // Sincroniza el draft cuando el value viene de afuera (p.ej. al cargar
  // un producto existente en el formulario).
  useEffect(() => {
    setDraft(value || '')
    if (!value) setSelectedLabel(null)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options: SatKeyOption[] = results.map((r) =>
    kind === 'claveProdServ'
      ? { clave: (r as { clave: string; descripcion: string }).clave, label: (r as { clave: string; descripcion: string }).descripcion }
      : { clave: (r as { clave: string; nombre: string }).clave, label: (r as { clave: string; nombre: string }).nombre }
  )

  const handleInputChange = (newValue: string) => {
    setDraft(newValue)
    setSelectedLabel(null)
    setTerm(newValue)
    setIsOpen(true)
    // Mientras se escribe, el valor "en vivo" es el texto libre: esto es
    // lo que permite la captura manual sin pasar por el dropdown.
    onChange(newValue || null)
  }

  const handleSelectOption = (option: SatKeyOption) => {
    setDraft(option.clave)
    setSelectedLabel(option.label)
    onChange(option.clave)
    setTerm('')
    setIsOpen(false)
  }

  const handleClear = () => {
    setDraft('')
    setSelectedLabel(null)
    setTerm('')
    onChange(null)
    setIsOpen(false)
  }

  const showSummary = Boolean(draft) && Boolean(selectedLabel) && !isOpen

  return (
    <div className="mb-3" ref={containerRef}>
      <label htmlFor={inputId} className={`form-label${required ? ' required' : ''}`}>
        {label}
      </label>

      {showSummary ? (
        <div className="d-flex align-items-center gap-2 border rounded px-2 py-2 bg-light">
          <div className="flex-grow-1 small">
            <strong>{draft}</strong> - {selectedLabel}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClear}
            disabled={disabled}
            aria-label={`Limpiar ${label}`}
            title="Limpiar"
          >
            <i className="bi bi-x" />
          </button>
        </div>
      ) : (
        <div className="position-relative">
          <div className="input-group">
            <input
              id={inputId}
              type="text"
              className={`form-control${errorText ? ' is-invalid' : ''}`}
              value={draft}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
            />
            {draft && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClear}
                disabled={disabled}
                aria-label={`Limpiar ${label}`}
                title="Limpiar"
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          {isSearching && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-5">
              <span className="spinner-border spinner-border-sm" />
            </div>
          )}

          {isOpen && options.length > 0 && (
            <div
              className="position-absolute w-100 bg-white border rounded-bottom shadow-sm"
              style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}
            >
              {options.map((option) => (
                <button
                  key={option.clave}
                  type="button"
                  className="btn btn-link text-start w-100 text-decoration-none px-3 py-2 border-bottom"
                  onClick={() => handleSelectOption(option)}
                >
                  <div className="fw-medium">{option.clave}</div>
                  <small className="text-muted">{option.label}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {helpText && !errorText && <div className="form-text">{helpText}</div>}
      {errorText && <div className="invalid-feedback d-block small">{errorText}</div>}
    </div>
  )
}

export default SatKeyCombobox
