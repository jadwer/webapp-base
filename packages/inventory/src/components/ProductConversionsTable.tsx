'use client'

import { useRouter } from 'next/navigation'
import { LwTableWrap, LwStatusPill, LwIconButton } from '@lwm/ui'
import { toNumber } from '../utils/format'
import type { ProductConversion } from '../types/productConversion'

interface ProductConversionsTableProps {
  conversions: ProductConversion[]
  isLoading: boolean
  onDelete?: (conversion: ProductConversion) => void
  hasFilters?: boolean
}

const ProductCell = ({ product, id }: { product?: { name: string; sku: string }; id?: number | string }) =>
  product ? (
    <>
      {product.name}
      {product.sku ? <div className="small text-muted">SKU: {product.sku}</div> : null}
    </>
  ) : (
    <span className="text-muted">Producto {id ?? 'sin datos'}</span>
  )

export const ProductConversionsTable = ({ conversions, isLoading, onDelete, hasFilters }: ProductConversionsTableProps) => {
  const router = useRouter()
  return (
    <LwTableWrap>
      <table className="table mb-0 align-middle">
        <thead>
          <tr>
            <th>Producto origen</th>
            <th>Producto destino</th>
            <th className="text-end">Factor</th>
            <th className="text-end">Merma</th>
            <th>Estatus</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6} className="text-center text-muted py-4">Cargando conversiones…</td></tr>
          ) : conversions.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-muted py-4">{hasFilters ? 'Conversión no encontrada' : 'Configura un par de productos para poder fraccionar'}</td></tr>
          ) : (
            conversions.map((c) => {
              const pair = `${c.sourceProduct?.name ?? c.sourceProductId} a ${c.destinationProduct?.name ?? c.destinationProductId}`
              return (
                <tr key={c.id}>
                  <td><ProductCell product={c.sourceProduct} id={c.sourceProductId} /></td>
                  <td><ProductCell product={c.destinationProduct} id={c.destinationProductId} /></td>
                  <td className="text-end">{toNumber(c.conversionFactor)}</td>
                  <td className="text-end">{toNumber(c.wastePercentage) > 0 ? `${toNumber(c.wastePercentage)}%` : <span className="text-muted">0%</span>}</td>
                  <td><LwStatusPill tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Activa' : 'Inactiva'}</LwStatusPill></td>
                  <td className="text-end text-nowrap">
                    <LwIconButton icon="bi-pencil" label={`Editar conversión ${pair}`} onClick={() => router.push(`/dashboard/inventory/product-conversions/${c.id}/edit`)} />
                    {onDelete ? <LwIconButton icon="bi-trash" label={`Eliminar conversión ${pair}`} onClick={() => onDelete(c)} /> : null}
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
