'use client'

import { ARInvoicesAdminPageReal } from '@/modules/finance'

// Cuentas por Cobrar: lista de facturas AR con saldo, estado (incluye
// "Vencida" quando dueDate ya paso), filtros de cliente/estado/periodo y
// accion "Registrar pago" por fila (ver RegisterPaymentModal en el modulo
// finance). Consolidado sobre ARInvoicesAdminPageReal para no duplicar UI.
export default function ARInvoicesPage() {
  return <ARInvoicesAdminPageReal />
}