/**
 * Tax hint label for the public catalog.
 *
 * Catalog prices can be stored net (tax added on top at quote/checkout time,
 * the historical default) or tax-included (final price already includes VAT),
 * depending on the tenant's `pricing.prices_include_tax` app setting.
 *
 * - pricesIncludeTax = false (default/B2B): "+ 16% IVA" for taxed products,
 *   "IVA 0%" for exempt ones - tax is added on top.
 * - pricesIncludeTax = true (B2C): "IVA incluido" for taxed products,
 *   "IVA 0%" for exempt ones - the displayed price is final.
 */
export function taxHintLabel(iva: boolean, pricesIncludeTax: boolean): string {
  if (!iva) return 'IVA 0%'
  return pricesIncludeTax ? 'IVA incluido' : '+ 16% IVA'
}
