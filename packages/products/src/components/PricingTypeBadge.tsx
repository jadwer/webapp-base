'use client'

import React from 'react'
import clsx from 'clsx'
import { QUOTE_ONLY_LABEL, QUOTE_ONLY_SHORT_LABEL } from '../utils/pricingType'

interface PricingTypeBadgeProps {
  /** Texto corto ("Sujeto a cotización") para celdas angostas. */
  short?: boolean
  className?: string
}

/**
 * Etiqueta del precio variable (P2 granel): se muestra en lugar del precio
 * cuando el producto es quote_only. Mismo patron visual que StatusBadge.
 */
export const PricingTypeBadge: React.FC<PricingTypeBadgeProps> = ({ short = false, className }) => (
  <span
    className={clsx('badge bg-info text-dark', className)}
    title={QUOTE_ONLY_LABEL}
    data-testid="pricing-type-badge"
  >
    <i className="bi bi-chat-square-quote me-1" aria-hidden="true" />
    {short ? QUOTE_ONLY_SHORT_LABEL : QUOTE_ONLY_LABEL}
  </span>
)
