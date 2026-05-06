'use client'

import React from 'react'
import Link from 'next/link'
import { useRecentAudits } from '../hooks/useAudits'
import AuditTimeline from './AuditTimeline'

interface RecentActivityWidgetProps {
  limit?: number
  title?: string
  showViewAll?: boolean
}

export default function RecentActivityWidget({
  limit = 5,
  title = 'Actividad Reciente',
  showViewAll = true,
}: RecentActivityWidgetProps) {
  const { audits, isLoading, isError } = useRecentAudits(limit)

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-activity me-2" />
          {title}
        </h6>
        {showViewAll && (
          <Link href="/dashboard/audit" className="btn btn-sm btn-outline-primary">
            Ver todo
          </Link>
        )}
      </div>
      <div className="card-body">
        {isError ? (
          <div className="text-center py-3 text-danger">
            <i className="bi bi-exclamation-triangle fs-4 d-block mb-2" />
            <small>Error al cargar actividad</small>
          </div>
        ) : (
          <AuditTimeline
            audits={audits}
            isLoading={isLoading}
            maxItems={limit}
          />
        )}
      </div>
    </div>
  )
}
