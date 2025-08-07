'use client'

import React from 'react'
import clsx from 'clsx'

interface StatusBadgeProps {
  publishedAt: string | null
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ publishedAt, className }) => {
  const isDraft = publishedAt === null
  
  const config = isDraft ? {
    label: 'Borrador',
    className: 'bg-warning text-dark',
    icon: 'bi-pencil'
  } : {
    label: 'Publicado',
    className: 'bg-success text-white',
    icon: 'bi-check-circle-fill'
  }

  return (
    <span className={clsx('badge d-inline-flex align-items-center gap-1', config.className, className)}>
      <i className={clsx('bi', config.icon)} aria-hidden="true" />
      {config.label}
    </span>
  )
}

export default StatusBadge