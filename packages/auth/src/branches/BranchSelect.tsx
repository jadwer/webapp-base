'use client'

/**
 * Selector de sucursal para formularios de alta (cotizacion, venta, compra,
 * almacen). Multi-sucursal 2026-09-24.
 *
 * - Solo ofrece sucursales activas a las que el usuario tiene acceso
 *   (branch_ids del perfil; null = todas). El backend valida lo mismo (422),
 *   asi que lo que el sistema ofrece es valido por construccion (regla 7).
 * - Con una sola opcion no se muestra: el backend asigna la sucursal del
 *   usuario o la Matriz.
 */

import React, { useEffect, useMemo } from 'react'
import { useAuth } from '../lib/auth'
import { useBranches } from './useBranches'
import type { Branch } from './types'

/** Sucursales activas que el usuario autenticado puede usar. */
export const useSelectableBranches = (): { branches: Branch[]; defaultId: string; isLoading: boolean } => {
  const { user } = useAuth()
  const { branches, isLoading } = useBranches()

  return useMemo(() => {
    const allowed: string[] | null | undefined = user?.branch_ids
    const list = branches.filter((b) => b.isActive && (!allowed || allowed.includes(b.id)))
    const own = user?.branch_id ? String(user.branch_id) : ''
    const defaultId = list.find((b) => b.id === own)?.id ?? list.find((b) => b.isMain)?.id ?? list[0]?.id ?? ''
    return { branches: list, defaultId, isLoading }
  }, [branches, isLoading, user?.branch_id, user?.branch_ids])
}

interface BranchSelectProps {
  value: string
  onChange: (branchId: string) => void
  id?: string
  label?: string
  className?: string
  /** Si true, al cargar sin valor se preselecciona la sucursal del usuario. */
  autoDefault?: boolean
}

export const BranchSelect: React.FC<BranchSelectProps> = ({
  value,
  onChange,
  id = 'branch-select',
  label = 'Sucursal',
  className = 'form-select',
  autoDefault = true,
}) => {
  const { branches, defaultId } = useSelectableBranches()

  useEffect(() => {
    if (autoDefault && !value && defaultId) onChange(defaultId)
  }, [autoDefault, value, defaultId, onChange])

  if (branches.length <= 1) return null

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className={className} value={value} onChange={(e) => onChange(e.target.value)}>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  )
}
