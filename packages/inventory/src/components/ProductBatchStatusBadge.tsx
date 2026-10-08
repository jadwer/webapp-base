/**
 * PRODUCT BATCH STATUS BADGE
 * Envoltura de StatusBadge con BATCH_STATUS (valores del backend).
 */

'use client'

import React from 'react'
import { StatusBadge } from '@lwm/ui'
import { BATCH_STATUS } from '../utils/labels'
import type { ProductBatchStatus } from '../types'

interface ProductBatchStatusBadgeProps {
  status: ProductBatchStatus | string | null | undefined
  className?: string
}

export const ProductBatchStatusBadge: React.FC<ProductBatchStatusBadgeProps> = ({ status, className }) => (
  <StatusBadge status={status} map={BATCH_STATUS} className={className} />
)

export default ProductBatchStatusBadge
