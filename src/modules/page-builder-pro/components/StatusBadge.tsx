'use client'

import React from 'react'
import { Badge } from '@/ui/components/base'

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'archived' | 'deleted'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs = {
    draft: {
      label: 'Borrador',
      variant: 'warning' as const,
      icon: <i className="bi bi-pencil" />
    },
    published: {
      label: 'Publicado', 
      variant: 'success' as const,
      icon: <i className="bi bi-check-circle-fill" />
    },
    archived: {
      label: 'Archivado',
      variant: 'secondary' as const,
      icon: <i className="bi bi-archive" />
    },
    deleted: {
      label: 'Eliminado',
      variant: 'danger' as const,
      icon: <i className="bi bi-trash" />
    }
  }
  
  const config = configs[status]

  return (
    <Badge
      variant={config.variant}
      startIcon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  )
}

export default StatusBadge