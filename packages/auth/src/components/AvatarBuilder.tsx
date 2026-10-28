'use client'

/**
 * Generador de avatares por partes con vista previa en vivo (2026-10-28),
 * port del AvatarBuilder de AtomoPlatform (D.17) a markup Bootstrap.
 * Devuelve la receta serializada (`avatar:1:...`).
 */

import React, { useId, useMemo } from 'react'
import { AVATAR_PARTS, DEFAULT_AVATAR, avatarDataUri, parseRecipe, randomAvatar, serializeAvatar, type AvatarRecipe } from '../lib/avatarGenerator'

type Part = keyof AvatarRecipe

const SECTIONS: Array<{ part: Part; label: string; swatch: boolean }> = [
  { part: 'skin', label: 'Tono de piel', swatch: true },
  { part: 'hair', label: 'Peinado', swatch: false },
  { part: 'hairColor', label: 'Color de pelo', swatch: true },
  { part: 'clothes', label: 'Ropa', swatch: false },
  { part: 'clothesColor', label: 'Color de la ropa', swatch: true },
  { part: 'accessory', label: 'Accesorio', swatch: false },
  { part: 'background', label: 'Fondo', swatch: true },
]

export interface AvatarBuilderProps {
  /** Valor actual; si no es receta se arranca de la receta por omision. */
  value: string | null | undefined
  onChange: (recipe: string) => void
  disabled?: boolean
}

export function AvatarBuilder({ value, onChange, disabled = false }: AvatarBuilderProps) {
  const id = useId()
  const current = parseRecipe(value)
  const recipe = current ?? DEFAULT_AVATAR
  const set = (part: Part, index: number) => onChange(serializeAvatar({ ...recipe, [part]: index }))
  // Miniaturas: la misma persona con cada opcion de la parte.
  const thumbs = useMemo(
    () =>
      Object.fromEntries(
        SECTIONS.filter((s) => !s.swatch).map((s) => [s.part, AVATAR_PARTS[s.part].map((_, i) => avatarDataUri({ ...recipe, [s.part]: i }))]),
      ) as Record<Part, string[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serializeAvatar(recipe)],
  )

  return (
    <div>
      <div className="d-flex justify-content-center mb-3">
        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={disabled} onClick={() => onChange(serializeAvatar(randomAvatar()))}>
          <i className="bi bi-shuffle me-1" aria-hidden="true" />
          Sorpréndeme
        </button>
      </div>
      {SECTIONS.map(({ part, label, swatch }) => (
        <fieldset key={part} className="mb-3" disabled={disabled}>
          <legend className="fs-6 fw-semibold mb-2">{label}</legend>
          <div className="d-flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
            {AVATAR_PARTS[part].map((option, index) => {
              const checked = current !== null && recipe[part] === index
              const color = (option as { color?: string }).color
              return (
                <label
                  key={index}
                  title={option.label}
                  className="rounded-circle d-inline-block"
                  style={{ cursor: 'pointer', outline: checked ? '3px solid var(--bs-primary)' : 'none', outlineOffset: 2 }}
                >
                  <input type="radio" name={`${id}-${part}`} value={index} checked={checked} onChange={() => set(part, index)} className="visually-hidden" />
                  {swatch ? (
                    <span className="d-block rounded-circle border" style={{ width: 32, height: 32, background: color }} aria-hidden="true" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbs[part][index]} alt="" width={48} height={48} className="d-block rounded-circle" />
                  )}
                  <span className="visually-hidden">{option.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

export default AvatarBuilder
