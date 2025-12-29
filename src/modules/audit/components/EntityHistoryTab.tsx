'use client'

import React from 'react'
import { useEntityHistory } from '../hooks/useAudits'
import AuditTimeline from './AuditTimeline'

interface EntityHistoryTabProps {
  auditableType: string
  auditableId: string | number
  title?: string
}

/**
 * Component to show audit history for a specific entity
 * Can be used in entity detail pages as a "History" tab
 *
 * @example
 * <EntityHistoryTab
 *   auditableType="Modules\\Product\\Models\\Product"
 *   auditableId={productId}
 * />
 */
export default function EntityHistoryTab({
  auditableType,
  auditableId,
  title = 'Historial de Cambios',
}: EntityHistoryTabProps) {
  const { history, isLoading, isError } = useEntityHistory(auditableType, auditableId)

  return (
    <div className="entity-history">
      <h6 className="mb-3">
        <i className="bi bi-clock-history me-2" />
        {title}
      </h6>

      {isError ? (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el historial
        </div>
      ) : (
        <AuditTimeline
          audits={history}
          isLoading={isLoading}
          showEntity={false}
        />
      )}
    </div>
  )
}
