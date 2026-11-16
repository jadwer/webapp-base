'use client'

import { useRouter } from 'next/navigation'
import { LwTableWrap, LwStatusPill, LwIconButton, type LwTone } from '@lwm/ui'
import { FRACTIONATION_STATUS } from '../utils/labels'
import { formatDate, formatQty, toNumber } from '../utils/format'
import type { Fractionation } from '../types/fractionation'

interface FractionationHistoryProps {
  fractionations: Fractionation[]
  isLoading: boolean
  hasFilters?: boolean
  /** Para numerar las filas de la pagina */
  offset?: number
}

export const FRACTIONATION_STATUS_TONE: Record<string, LwTone> = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'neutral',
}

const BASE_HREF = '/dashboard/inventory/fraccionamiento'

const ProductCell = ({ product }: { product?: { name: string; sku: string } }) =>
  product ? (
    <>
      {product.name}
      {product.sku ? <div className="small text-muted">SKU: {product.sku}</div> : null}
    </>
  ) : (
    <span className="text-muted">—</span>
  )

export const FractionationHistory = ({ fractionations, isLoading, hasFilters, offset = 0 }: FractionationHistoryProps) => {
  const router = useRouter()
  return (
    <LwTableWrap>
      <table className="table mb-0 align-middle">
        <thead>
          <tr>
            <th>No</th>
            <th>Folio</th>
            <th>Producto origen</th>
            <th>Producto destino</th>
            <th className="text-end">Cantidad</th>
            <th className="text-end">Producido</th>
            <th className="text-end">Merma</th>
            <th>Almacén</th>
            <th>Estatus</th>
            <th>Fecha</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={11} className="text-center text-muted py-4">Cargando historial…</td></tr>
          ) : fractionations.length === 0 ? (
            <tr><td colSpan={11} className="text-center text-muted py-4">{hasFilters ? 'Fraccionamiento no encontrado' : 'Todavía no hay fraccionamientos'}</td></tr>
          ) : (
            fractionations.map((frac, i) => (
              <tr key={frac.id}>
                <td>{String(offset + i + 1).padStart(2, '0')}</td>
                <td className="fw-semibold text-nowrap">{frac.folioNumber}</td>
                <td><ProductCell product={frac.sourceProduct} /></td>
                <td><ProductCell product={frac.destinationProduct} /></td>
                <td className="text-end">{formatQty(frac.sourceQuantity)}</td>
                <td className="text-end fw-semibold">{formatQty(frac.producedQuantity)}</td>
                <td className="text-end">
                  {toNumber(frac.wasteQuantity) > 0
                    ? `${formatQty(frac.wasteQuantity)} (${toNumber(frac.wastePercentage)}%)`
                    : <span className="text-muted">0</span>}
                </td>
                <td>{frac.warehouse?.name || <span className="text-muted">—</span>}</td>
                <td>
                  <LwStatusPill tone={FRACTIONATION_STATUS_TONE[frac.status] ?? 'neutral'}>{FRACTIONATION_STATUS[frac.status]?.label ?? frac.status}</LwStatusPill>
                </td>
                <td className="text-nowrap small">{formatDate(frac.executedAt, { withTime: true })}</td>
                <td className="text-end">
                  <LwIconButton icon="bi-eye" label={`Ver fraccionamiento ${frac.folioNumber}`} onClick={() => router.push(`${BASE_HREF}/${frac.id}`)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </LwTableWrap>
  )
}
