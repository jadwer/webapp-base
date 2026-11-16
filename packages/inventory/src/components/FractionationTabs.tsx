'use client'

/**
 * Encabezado comun de Fraccionamiento con la piel del rediseno (2026-11-16): titulo,
 * indicadores y pestanas Historial | Conversiones. No hay pantalla en Figma; se arma con
 * las piezas Lw (decision de Gabino, 2026-11-15). Los indicadores son totales reales
 * (meta.page.total) y llevan a la pestana que los explica.
 */

import type { ReactNode } from 'react'
import { LwPageTitle, LwKpiCard, TabNav } from '@lwm/ui'
import { useFractionations } from '../hooks/useFractionations'
import { useProductConversions } from '../hooks/useProductConversions'
import { readPageTotal } from '../hooks/useInventoryCounts'

const HISTORY_HREF = '/dashboard/inventory/fraccionamiento'
const CONVERSIONS_HREF = '/dashboard/inventory/product-conversions'

const TABS = [
  { key: 'history', label: 'Historial', href: HISTORY_HREF, icon: 'bi-scissors' },
  { key: 'conversions', label: 'Conversiones', href: CONVERSIONS_HREF, icon: 'bi-arrow-repeat' },
]

const COUNT = { size: 1 }
const show = (v: number | null) => (v == null ? '--' : v.toLocaleString('es-MX'))

/** Pestanas Historial | Conversiones (modo enlace, activa por ruta) */
export const FractionationTabs = () => <TabNav tabs={TABS} />

export function FractionationHeader({ subtitle, actions }: { subtitle: string; actions?: ReactNode }) {
  const all = useFractionations({ pagination: COUNT })
  const completed = useFractionations({ filters: { status: 'completed' }, pagination: COUNT })
  const cancelled = useFractionations({ filters: { status: 'cancelled' }, pagination: COUNT })
  const conversions = useProductConversions({ filters: { isActive: '1' }, pagination: COUNT })
  const loading = all.isLoading || completed.isLoading || cancelled.isLoading

  return (
    <>
      <LwPageTitle title="Fraccionamiento" subtitle={subtitle} actions={actions} />
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <LwKpiCard label="Fraccionamientos" value={show(readPageTotal(all.meta))} icon="bi-scissors" highlight isLoading={loading} href={HISTORY_HREF} />
        </div>
        <div className="col-lg-3 col-md-6">
          <LwKpiCard label="Completados" value={show(readPageTotal(completed.meta))} icon="bi-check2-circle" isLoading={loading} href={HISTORY_HREF} />
        </div>
        <div className="col-lg-3 col-md-6">
          <LwKpiCard label="Cancelados" value={show(readPageTotal(cancelled.meta))} icon="bi-x-circle" hint="Su existencia se regresó" isLoading={loading} href={HISTORY_HREF} />
        </div>
        <div className="col-lg-3 col-md-6">
          <LwKpiCard label="Conversiones activas" value={show(readPageTotal(conversions.meta))} icon="bi-arrow-repeat" isLoading={conversions.isLoading} href={CONVERSIONS_HREF} />
        </div>
      </div>
      <FractionationTabs />
    </>
  )
}

export default FractionationTabs
