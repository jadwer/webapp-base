/**
 * FRACCIONAMIENTO, pestana Conversiones, con la piel del rediseno (2026-11-16).
 * Pares de productos que se pueden fraccionar; conserva filtro por estatus y eliminar
 * con confirmacion.
 */

'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ConfirmModal, LwSurface, LwPagination, toast, type ConfirmModalHandle } from '@lwm/ui'
import { useProductConversions, useProductConversionsMutations } from '../hooks/useProductConversions'
import { ProductConversionsTable } from './ProductConversionsTable'
import { FractionationHeader } from './FractionationTabs'
import { deleteErrorMessage, readPageMeta } from '../utils/listing'
import type { ProductConversion } from '../types/productConversion'

export const ProductConversionsAdminPage = () => {
  const [activeFilter, setActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const { conversions, meta, isLoading, error } = useProductConversions({
    filters: activeFilter ? { isActive: activeFilter } : undefined,
    pagination: { page: currentPage, size: perPage },
    include: ['sourceProduct', 'destinationProduct'],
  })
  const { deleteConversion } = useProductConversionsMutations()

  const page = readPageMeta(meta, currentPage, perPage)

  const handleDelete = async (conversion: ProductConversion) => {
    const pair =
      conversion.sourceProduct && conversion.destinationProduct
        ? `\n\n${conversion.sourceProduct.name} a ${conversion.destinationProduct.name} (factor ${conversion.conversionFactor})`
        : ''
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar esta conversión?${pair}\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar conversión', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteConversion(conversion.id)
      toast.success('Conversión eliminada')
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'la conversión'))
    }
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <FractionationHeader subtitle="Pares de conversión entre productos para fraccionar" />

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-auto">
            <select
              className="form-select"
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1) }}
              aria-label="Estatus"
            >
              <option value="">Todos los estatus</option>
              <option value="1">Activas</option>
              <option value="0">Inactivas</option>
            </select>
          </div>
          <div className="col d-flex justify-content-end">
            <Link href="/dashboard/inventory/product-conversions/create" className="btn btn-primary">
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nueva conversión
            </Link>
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">{error.message || 'No se pudieron cargar las conversiones.'}</div> : null}

        <ProductConversionsTable conversions={conversions} isLoading={isLoading} onDelete={handleDelete} hasFilters={Boolean(activeFilter)} />

        <LwPagination page={page.currentPage} lastPage={page.lastPage} perPage={perPage} total={page.total} onPage={setCurrentPage} onPerPage={(n) => { setPerPage(n); setCurrentPage(1) }} />
      </LwSurface>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
