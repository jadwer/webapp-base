import { redirect } from 'next/navigation'

// Esta pantalla capturaba una orden y descartaba los datos (TIE-13, 2026-11-22).
// Las ordenes de la tienda nacen del checkout; un pedido a mano se captura en Pedidos.
export default function CreateOrderPage() {
  redirect('/dashboard/sales/create')
}
