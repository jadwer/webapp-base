'use client'

import type { HealthCheck, QueueCheck, StorageCheck, CacheCheck } from '../types'
import { StatusBadge } from './StatusBadge'

interface HealthCheckCardProps {
  title: string
  icon: string
  check: HealthCheck | QueueCheck | StorageCheck | CacheCheck
}

function isQueueCheck(check: HealthCheck): check is QueueCheck {
  return 'pendingJobs' in check && 'failedJobs' in check
}

function isStorageCheck(check: HealthCheck): check is StorageCheck {
  return 'usedPercent' in check && 'totalGb' in check
}

function isCacheCheck(check: HealthCheck): check is CacheCheck {
  return 'driver' in check && !('pendingJobs' in check) && !('usedPercent' in check)
}

export function HealthCheckCard({ title, icon, check }: HealthCheckCardProps) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${icon} fs-5`} aria-hidden="true" />
            <h6 className="card-title mb-0">{title}</h6>
          </div>
          <StatusBadge status={check.status} size="sm" />
        </div>

        <p className="text-muted small mb-2">{check.message}</p>

        {check.responseTimeMs !== undefined && (
          <p className="text-muted small mb-1">
            <i className="bi bi-speedometer2 me-1" aria-hidden="true" />
            Respuesta: {check.responseTimeMs.toFixed(2)}ms
          </p>
        )}

        {isCacheCheck(check) && (
          <p className="text-muted small mb-1">
            <i className="bi bi-hdd me-1" aria-hidden="true" />
            Driver: {check.driver}
          </p>
        )}

        {isQueueCheck(check) && (
          <div className="d-flex gap-3 mt-2">
            <div>
              <span className="fw-bold">{check.pendingJobs}</span>
              <span className="text-muted small ms-1">Pendientes</span>
            </div>
            <div>
              <span className={`fw-bold ${check.failedJobs > 0 ? 'text-danger' : ''}`}>
                {check.failedJobs}
              </span>
              <span className="text-muted small ms-1">Fallidos</span>
            </div>
          </div>
        )}

        {isStorageCheck(check) && (
          <>
            <div className="progress mt-2" style={{ height: '8px' }}>
              <div
                className={`progress-bar ${
                  check.usedPercent >= 95
                    ? 'bg-danger'
                    : check.usedPercent >= 85
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
                role="progressbar"
                style={{ width: `${check.usedPercent}%` }}
                aria-valuenow={check.usedPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="text-muted small mt-1 mb-0">
              {check.usedGb.toFixed(1)} GB / {check.totalGb.toFixed(1)} GB
              ({check.usedPercent.toFixed(1)}%)
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default HealthCheckCard
