'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import type { OfferProduct } from '../hooks/useOffers'

interface OffersTableProps {
  offers: OfferProduct[]
  isLoading?: boolean
  onEdit?: (offer: OfferProduct) => void
  onDelete?: (offerId: string) => Promise<void>
  onView?: (offer: OfferProduct) => void
  className?: string
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export const OffersTable: React.FC<OffersTableProps> = ({
  offers,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setOfferLoading = (offerId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [offerId]: loading }))
  }

  const handleDelete = async (offer: OfferProduct) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Esta seguro de que quiere eliminar la oferta para "${offer.name}"? El producto seguira existiendo pero sin el precio de oferta.`
    )

    if (confirmed) {
      setOfferLoading(offer.id, true)
      try {
        await onDelete(offer.id)
      } finally {
        setOfferLoading(offer.id, false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando ofertas...</span>
        </div>
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-tag display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay ofertas activas</h5>
        <p className="text-muted">Las ofertas aparecen automaticamente cuando un producto tiene precio mayor que su costo</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Categoria</th>
              <th scope="col">Marca</th>
              <th scope="col" className="text-end">Precio</th>
              <th scope="col" className="text-end">Costo</th>
              <th scope="col" className="text-end">Descuento</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const isOfferLoading = loadingStates[offer.id] || false

              return (
                <tr key={offer.id} className={clsx({ 'opacity-50': isOfferLoading })}>
                  <td>
                    <div className="fw-medium">{offer.name}</div>
                    {offer.sku && (
                      <small className="text-muted">SKU: {offer.sku}</small>
                    )}
                    {offer.description && (
                      <small className="d-block text-muted text-truncate" style={{ maxWidth: '200px' }}>
                        {offer.description}
                      </small>
                    )}
                  </td>
                  <td>
                    {offer.category ? (
                      <span className="badge bg-secondary">{offer.category.name}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {offer.brand ? (
                      <span className="badge bg-primary">{offer.brand.name}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="fw-bold text-success">{formatCurrency(offer.price)}</div>
                    {offer.unit && (
                      <small className="text-muted">/ {offer.unit.abbreviation || offer.unit.name}</small>
                    )}
                  </td>
                  <td className="text-end">
                    <span className="text-muted">{formatCurrency(offer.cost)}</span>
                  </td>
                  <td className="text-end">
                    <div className="fw-bold text-danger">{formatCurrency(offer.discount)}</div>
                    <small className="badge bg-danger">
                      {offer.discountPercent.toFixed(0)}% OFF
                    </small>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver producto"
                          onClick={() => onView(offer)}
                          disabled={isOfferLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar oferta"
                          onClick={() => onEdit(offer)}
                          disabled={isOfferLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar oferta"
                          onClick={() => handleDelete(offer)}
                          disabled={isOfferLoading}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default OffersTable
