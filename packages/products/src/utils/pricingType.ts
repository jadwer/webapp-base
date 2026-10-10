/**
 * Tipo de precio del producto (P2 granel).
 *
 * ESPEJO EXACTO de la lista que valida el backend (no hay endpoint de
 * catalogo para este campo; son dos valores estables):
 * - api-base Modules/Product/app/Models/Product.php (PRICING_TYPES)
 * - api-base Modules/Product/app/JsonApi/V1/Products/ProductRequest.php (pricingType, Rule::in)
 * El test tests/utils/pricingType.test.ts fija la lista y el backend tiene su
 * propio candado (ProductPricingTypeTest::test_pricing_types_are_the_model_list).
 *
 * quote_only = "Precio sujeto a cotización": sin precio de lista; no se compra
 * directo, se cotiza y se vende solo via cotización convertida a pedido.
 */

export const PRICING_TYPES = ['fixed', 'quote_only'] as const

export type PricingType = (typeof PRICING_TYPES)[number]

export const PRICING_TYPE_FIXED: PricingType = 'fixed'
export const PRICING_TYPE_QUOTE_ONLY: PricingType = 'quote_only'

/** Etiqueta estandar del precio variable (decision D3). */
export const QUOTE_ONLY_LABEL = 'Precio sujeto a cotización'

/** Version corta para badges y celdas angostas. */
export const QUOTE_ONLY_SHORT_LABEL = 'Sujeto a cotización'

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  fixed: 'Precio fijo',
  quote_only: QUOTE_ONLY_LABEL,
}

/**
 * Normaliza lo que llegue del API: cualquier valor desconocido o ausente se
 * trata como precio fijo (el default de la columna en el backend).
 */
export function normalizePricingType(value: unknown): PricingType {
  return value === 'quote_only' ? 'quote_only' : 'fixed'
}

export function isQuoteOnly(product: { pricingType?: string | null } | null | undefined): boolean {
  return normalizePricingType(product?.pricingType) === 'quote_only'
}
