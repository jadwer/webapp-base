'use client'

/**
 * P2 granel: aviso de lineas con precio por confirmar al convertir una
 * cotizacion. Lo usan GenerateSaleModal y GenerateOrderModal, tanto con los
 * items cargados (aviso previo) como con el 422 del backend (regla 7: detalle
 * por producto, nunca toast generico).
 */
interface PricePendingAlertProps {
  products: { key: string; name: string; sku?: string | null }[]
  target: 'pedido' | 'venta'
}

export function PricePendingAlert({ products, target }: PricePendingAlertProps) {
  if (products.length === 0) return null

  return (
    <div className="alert alert-warning" role="alert" data-testid="convert-price-pending">
      <strong>
        <i className="bi bi-hourglass-split me-2" aria-hidden="true"></i>
        Captura el precio antes de generar {target === 'pedido' ? 'el pedido' : 'la venta'}:
      </strong>
      <ul className="mb-1 mt-2">
        {products.map((p) => (
          <li key={p.key}>
            {p.name}
            {p.sku ? ` (${p.sku})` : ''}: precio sujeto a cotización, por confirmar
          </li>
        ))}
      </ul>
      <small>Edita la línea en la tabla de productos de la cotización y vuelve a intentarlo.</small>
    </div>
  )
}
