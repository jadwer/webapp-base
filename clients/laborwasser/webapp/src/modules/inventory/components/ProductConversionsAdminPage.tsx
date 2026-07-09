'use client'

import { useState } from 'react'
import { useProductConversions, useProductConversionsMutations } from '../hooks/useProductConversions'
import { ProductConversionsTable } from './ProductConversionsTable'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { Modal } from '@/ui/components/base/Modal'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { toast } from '@/lib/toast'
import type { ProductConversion } from '../types/productConversion'

export const ProductConversionsAdminPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingConversion, setDeletingConversion] = useState<ProductConversion | null>(null)
  const pageSize = 20
  const navigation = useNavigationProgress()

  const { conversions, meta, isLoading, error, mutate } = useProductConversions({
    pagination: { page: currentPage, size: pageSize },
    include: ['sourceProduct', 'destinationProduct'],
  })

  const { deleteConversion } = useProductConversionsMutations()

  const paginationInfo = meta?.page
  const totalItems = (paginationInfo && typeof paginationInfo === 'object' && 'total' in paginationInfo) ? (paginationInfo as Record<string, unknown>).total as number : 0
  const totalPages = (paginationInfo && typeof paginationInfo === 'object' && 'lastPage' in paginationInfo) ? (paginationInfo as Record<string, unknown>).lastPage as number : 1
  const currentBackendPage = (paginationInfo && typeof paginationInfo === 'object' && 'currentPage' in paginationInfo) ? (paginationInfo as Record<string, unknown>).currentPage as number : currentPage

  const handleDelete = async () => {
    if (!deletingConversion) return
    try {
      await deleteConversion(deletingConversion.id)
      setDeletingConversion(null)
      mutate()
      toast.success('Conversion eliminada correctamente')
    } catch {
      toast.error('Error al eliminar la conversion')
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Conversiones de Productos</h1>
          <p className="text-muted">Configuracion de pares de conversion para fraccionamiento</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigation.push('/dashboard/inventory/product-conversions/create')}
        >
          <i className="bi bi-plus-circle me-2" />
          Nueva Conversion
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error.message || 'Error al cargar las conversiones'}
        </Alert>
      )}

      <div className="card">
        <div className="card-body p-0">
          <ProductConversionsTable
            conversions={conversions}
            isLoading={isLoading}
            onDelete={setDeletingConversion}
          />

          {totalPages > 1 && (
            <PaginationSimple
              currentPage={currentBackendPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          )}
        </div>
      </div>

      <Modal
        show={!!deletingConversion}
        onHide={() => setDeletingConversion(null)}
        title="Eliminar Conversion"
      >
        <div className="modal-body">
          <p className="mb-0">
            ¿Estas seguro que deseas eliminar esta conversion?
          </p>
          {deletingConversion?.sourceProduct && deletingConversion?.destinationProduct && (
            <p className="text-muted small mt-2">
              {deletingConversion.sourceProduct.name} → {deletingConversion.destinationProduct.name}
              (Factor: {deletingConversion.conversionFactor})
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setDeletingConversion(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
