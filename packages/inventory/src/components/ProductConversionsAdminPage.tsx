/**
 * PRODUCT CONVERSIONS ADMIN PAGE
 * Pares de conversion para fraccionamiento; pestana de Fraccionamiento.
 */

'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  Alert,
  ConfirmModal,
  ListToolbar,
  PageHeader,
  toast,
  type ConfirmModalHandle,
} from '@lwm/ui'
import { useProductConversions, useProductConversionsMutations } from '../hooks/useProductConversions'
import { ProductConversionsTable } from './ProductConversionsTable'
import { FractionationTabs } from './FractionationTabs'
import { PaginationSimple } from './PaginationSimple'
import { deleteErrorMessage, readPageMeta } from '../utils/listing'
import type { ProductConversion } from '../types/productConversion'

const PAGE_SIZE = 20

export const ProductConversionsAdminPage = () => {
  const [activeFilter, setActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const { conversions, meta, isLoading, error } = useProductConversions({
    filters: activeFilter ? { isActive: activeFilter } : undefined,
    pagination: { page: currentPage, size: PAGE_SIZE },
    include: ['sourceProduct', 'destinationProduct'],
  })
  const { deleteConversion } = useProductConversionsMutations()

  const page = readPageMeta(meta, currentPage, PAGE_SIZE)

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
      <PageHeader
        title="Fraccionamiento"
        subtitle="Pares de conversión entre productos para fraccionar"
        actions={
          <Link href="/dashboard/inventory/product-conversions/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" />
            Nueva conversión
          </Link>
        }
      />

      <FractionationTabs />

      <ListToolbar>
        <select
          className="form-select w-auto"
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value)
            setCurrentPage(1)
          }}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="1">Activas</option>
          <option value="0">Inactivas</option>
        </select>
      </ListToolbar>

      {error && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || 'Error al cargar las conversiones'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <ProductConversionsTable
            conversions={conversions}
            isLoading={isLoading}
            onDelete={handleDelete}
          />
          {page.lastPage > 1 && (
            <PaginationSimple
              currentPage={page.currentPage}
              totalPages={page.lastPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={page.total}
              pageSize={page.perPage}
            />
          )}
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
