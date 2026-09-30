'use client'

/**
 * Select de sucursal para barras de filtros de listados (multi-sucursal,
 * 2026-09-24). Se oculta si la empresa tiene una sola sucursal activa: no
 * tiene caso filtrar. value '' = todas (las que el usuario puede ver; el
 * backend ya restringe a no-admins).
 */

import React from 'react'
import { useBranches } from './useBranches'

interface BranchFilterProps {
  value: string
  onChange: (branchId: string) => void
  className?: string
  /** Texto de la opcion "todas". */
  allLabel?: string
  id?: string
}

export const BranchFilter: React.FC<BranchFilterProps> = ({
  value,
  onChange,
  className = 'form-select form-select-sm',
  allLabel = 'Todas las sucursales',
  id = 'branch-filter',
}) => {
  const { branches } = useBranches()
  const active = branches.filter((b) => b.isActive || b.id === value)
  if (active.length <= 1) return null

  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filtrar por sucursal"
    >
      <option value="">{allLabel}</option>
      {active.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  )
}

/** Nombre de la sucursal por id (para columnas de listados). */
export const useBranchName = () => {
  const { branches } = useBranches()
  const multi = branches.length > 1
  return {
    /** true si hay mas de una sucursal (mostrar columna). */
    multi,
    name: (id?: string | number | null) => {
      if (id === undefined || id === null || id === '') return '—'
      return branches.find((b) => b.id === String(id))?.name ?? `#${id}`
    },
  }
}
