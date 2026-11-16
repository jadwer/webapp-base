/**
 * Tabla de conteos ciclicos con la piel del rediseno (2026-11-16).
 */

'use client'

import React from 'react'
import { useNavigationProgress, formatDateOnly, isPastDateOnly, LwTableWrap, LwStatusPill, LwIconButton, LwActionMenu, type LwTone } from '@lwm/ui'
import { CYCLE_COUNT_STATUS_CONFIG } from '../types/cycleCount'
import { formatQty } from '../utils/format'
import type { ParsedCycleCount } from '../types'

export const CYCLE_COUNT_STATUS_TONE: Record<string, LwTone> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'neutral',
}

const BASE_HREF = '/dashboard/inventory/cycle-counts'

/** Conteo programado con fecha ya pasada */
export const isOverdueCount = (c: Pick<ParsedCycleCount, 'status' | 'scheduledDate'>) =>
  c.status === 'scheduled' && isPastDateOnly(c.scheduledDate)

export const formatCountDate = (d?: string | null) => formatDateOnly(d, 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })

/** Diferencia con signo y su porcentaje; '—' si no se ha contado */
export const VarianceText = ({ count }: { count: Pick<ParsedCycleCount, 'status' | 'varianceQuantity' | 'variancePercentage' | 'hasVariance'> }) => {
  if (count.status !== 'completed' || count.varianceQuantity == null) return <span className="text-muted">—</span>
  if (!count.hasVariance) return <LwStatusPill tone="success">Sin diferencia</LwStatusPill>
  const v = Number(count.varianceQuantity)
  return (
    <span className={v < 0 ? 'text-danger' : 'text-success'}>
      {v > 0 ? '+' : ''}{formatQty(v)}
      {count.variancePercentage != null ? <span className="small text-muted"> ({count.variancePercentage}%)</span> : null}
    </span>
  )
}

interface CycleCountsTableSimpleProps {
  cycleCounts: ParsedCycleCount[]
  isLoading?: boolean
  hasFilters?: boolean
  offset?: number
  onStartCount?: (id: string) => void
  onCancelCount?: (id: string) => void
}

export const CycleCountsTableSimple: React.FC<CycleCountsTableSimpleProps> = ({
  cycleCounts,
  isLoading = false,
  hasFilters = false,
  offset = 0,
  onStartCount,
  onCancelCount,
}) => {
  const navigation = useNavigationProgress()

  return (
    <LwTableWrap>
      <table className="table mb-0 align-middle">
        <thead>
          <tr>
            <th>No</th>
            <th>Conteo</th>
            <th>Producto</th>
            <th>Almacén</th>
            <th>Programado</th>
            <th>Clase</th>
            <th className="text-end">En sistema</th>
            <th className="text-end">Contado</th>
            <th>Diferencia</th>
            <th>Estatus</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={11} className="text-center text-muted py-4">Cargando conteos…</td></tr>
          ) : cycleCounts.length === 0 ? (
            <tr><td colSpan={11} className="text-center text-muted py-4">{hasFilters ? 'Conteo no encontrado' : 'Todavía no hay conteos programados'}</td></tr>
          ) : (
            cycleCounts.map((c, i) => {
              const overdue = isOverdueCount(c)
              const done = c.status === 'completed'
              return (
                <tr key={c.id}>
                  <td>{String(offset + i + 1).padStart(2, '0')}</td>
                  <td className="fw-semibold text-nowrap">{c.countNumber}</td>
                  <td>
                    {c.product?.name ?? <span className="text-muted">Producto sin datos</span>}
                    {c.product?.sku ? <div className="small text-muted">SKU: {c.product.sku}</div> : null}
                  </td>
                  <td>
                    {c.warehouse?.name ?? '—'}
                    {c.warehouseLocation?.name ? <div className="small text-muted">{c.warehouseLocation.name}</div> : null}
                  </td>
                  <td className="text-nowrap">
                    {formatCountDate(c.scheduledDate)}
                    {overdue ? <div className="small text-danger">Vencido</div> : null}
                  </td>
                  <td>{c.abcClass ?? <span className="text-muted">—</span>}</td>
                  <td className="text-end">{done && c.systemQuantity != null ? formatQty(c.systemQuantity) : <span className="text-muted">—</span>}</td>
                  <td className="text-end">{done && c.countedQuantity != null ? formatQty(c.countedQuantity) : <span className="text-muted">—</span>}</td>
                  <td className="text-nowrap"><VarianceText count={c} /></td>
                  <td><LwStatusPill tone={overdue ? 'danger' : CYCLE_COUNT_STATUS_TONE[c.status] ?? 'neutral'}>{CYCLE_COUNT_STATUS_CONFIG[c.status]?.label ?? c.status}</LwStatusPill></td>
                  <td className="text-end text-nowrap">
                    <LwIconButton icon="bi-eye" label={`Ver conteo ${c.countNumber}`} onClick={() => navigation.push(`${BASE_HREF}/${c.id}`)} />
                    <LwActionMenu
                      label={`Más acciones del conteo ${c.countNumber}`}
                      items={[
                        { key: 'start', label: 'Iniciar conteo', icon: 'bi-play-fill', onSelect: () => onStartCount?.(c.id), disabled: c.status !== 'scheduled', hint: c.status !== 'scheduled' ? 'Solo se inicia un conteo programado' : undefined },
                        { key: 'record', label: 'Registrar conteo', icon: 'bi-check2-square', onSelect: () => navigation.push(`${BASE_HREF}/${c.id}`), disabled: c.status !== 'in_progress', hint: c.status !== 'in_progress' ? 'Primero inicia el conteo' : undefined },
                        { key: 'edit', label: 'Editar', icon: 'bi-pencil', onSelect: () => navigation.push(`${BASE_HREF}/${c.id}/edit`), disabled: c.status !== 'scheduled', hint: c.status !== 'scheduled' ? 'Solo se edita un conteo programado' : undefined },
                        { key: 'cancel', label: 'Cancelar conteo', icon: 'bi-x-circle', danger: true, onSelect: () => onCancelCount?.(c.id), disabled: done || c.status === 'cancelled' },
                      ]}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </LwTableWrap>
  )
}
