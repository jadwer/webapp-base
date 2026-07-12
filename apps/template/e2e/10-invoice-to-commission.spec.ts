import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test: Factura -> Cobro -> Complemento de pago (REP) -> Comision
 * (BLOQUE 3 del plan E2E full flow: el circulo fiscal completo)
 *
 * Flujo validado manualmente via Playwright MCP contra el demo vivo
 * (https://marcablanca.laborwasserdemexico.com) el 2026-07-12.
 *
 * Cubre: orden delivered -> Facturar (genera CFDI en PPD) -> la factura
 * aparece en Cuentas por Cobrar (AR) con saldo -> pago PARCIAL (status
 * partial, saldo baja) -> complemento de pago (REP) -> pago que LIQUIDA
 * (status paid) -> comision ganada -> reportes (Historico de Ventas con
 * costo/utilidad, aging AR sin saldo).
 *
 * baseURL se toma de playwright.config.ts (E2E_BASE_URL o localhost:3000).
 * Para correr contra el demo: E2E_BASE_URL=https://marcablanca.laborwasserdemexico.com
 *
 * CONTEXTO PAC APAGADO (SW_PAC_ENABLED=false en el demo):
 * El CFDI y el REP quedan en DRAFT sin timbrar. NO es bug: es lo esperado
 * sin PAC. El sistema no revienta, crea el draft y sigue. Verificado:
 * - POST /cfdi-invoices/{id}/stamp responde 500 con mensaje controlado
 *   "El servicio de timbrado PAC no esta habilitado" (no crashea la app).
 * - El CFDI se crea con metodoPago=PPD y status=draft correctamente.
 *
 * Hallazgos de la exploracion (2026-07-12):
 *
 * - EL CICLO FACTURA -> COBRO CIERRA EN VIVO. Orden delivered con ARInvoice
 *   -> Facturar genera CFDI draft (PPD) -> AR invoice con saldo -> pago
 *   parcial (status partial, 42% cobrado) -> pago que liquida (status paid,
 *   100%, saldo $0). El aging AR deja de listar la factura liquidada y el
 *   Historico de Ventas muestra la venta con costo y utilidad.
 *
 * - EL TRAMO COMISION NO CIERRA en el demo, por dos causas de datos/config
 *   (no de codigo), documentadas abajo con test.fixme.
 *
 * Bugs y bloqueos encontrados:
 *
 * - MEDIO (bug de codigo): la vista de la factura CFDI
 *   (/dashboard/billing/invoices/{id}) muestra valores incorrectos.
 *   Por API el CFDI 1 tiene metodoPago="PPD", formaPago="99" y una fecha
 *   valida, pero la UI pinta "Metodo de Pago: PUE", "Forma de Pago: 01" y
 *   "Fecha: Invalid Date". El detalle no lee los atributos reales del
 *   registro. Reactivar 4.2 cuando la vista muestre metodoPago/formaPago/
 *   fecha reales.
 *
 * - MEDIO (bug de UX): facturar una orden delivered que NO tiene ARInvoice
 *   falla en silencio. POST /sales-orders/{id}/facturar responde 422
 *   {"error":"La orden no tiene factura de cuentas por cobrar (ARInvoice).
 *   Verifique que la orden se proceso correctamente."} y la UI navega a
 *   /dashboard/billing/invoices/create sin mostrar ningun mensaje de error.
 *   En el demo solo OV-26000006 tiene ARInvoice (auto-generada al recorrer
 *   confirmed->processing->shipped->delivered). Las demas ordenes delivered
 *   del seeder fueron marcadas delivered sin ese flujo y no tienen ARInvoice.
 *
 * - BAJO (regla de negocio, no bug): "Facturar" aparece deshabilitado con
 *   la orden en confirmed (title "La orden debe estar entregada o completada
 *   para facturar"). Solo se habilita en delivered/completed.
 *
 * - BLOQUEO COMISIONES 1 (config): el feature flag commissions.enabled
 *   estaba en false ("Inactivas") durante la factura y el cobro, asi que
 *   no se genero ninguna comision (0 registros, todos los totales $0.00).
 *   El propio flag documenta "si esta apagado, el sistema de comisiones no
 *   genera ni actualiza filas" y no genera retroactivamente al activarlo.
 *
 * - BLOQUEO COMISIONES 2 (datos del seeder): ninguna orden del
 *   DemoWorkflowSeeder tiene vendedor asignado. El Historico de Ventas
 *   muestra "Sin asignar" en la columna Vendedor para las 6 ordenes, y el
 *   modelo de orden no expone campo de vendedor (relationships: contact,
 *   items). Sin vendedor no hay sobre quien calcular la comision aunque el
 *   flag este activo.
 *
 * - INFO: la config de comisiones (base "collected", %5 default, corte
 *   mensual) se persiste via PATCH /app-settings/commissions.enabled (200
 *   al togglear). commissions/pay-batch exige ids[] + payment_reference.
 */

const ADMIN = { email: 'admin@demo.mx', password: 'Demo2026!' }

// Orden delivered del DemoWorkflowSeeder que SI tiene ARInvoice asociada
// (recorrio el flujo completo de estados). Es la unica facturable en el demo.
const DELIVERED_ORDER_WITH_AR = { id: 6, number: 'OV-26000006', customer: 'Comercial del Centro', total: 943 }

// Orden confirmed (no delivered): "Facturar" debe estar deshabilitado.
const CONFIRMED_ORDER = { id: 1, number: 'OV-26000001' }

// Orden delivered SIN ARInvoice: facturar responde 422 y falla en silencio.
const DELIVERED_ORDER_NO_AR = { id: 2, number: 'OV-26000002' }

const PARTIAL_AMOUNT = '400'
const FORMA_PAGO = '03 - Transferencia electrónica de fondos'

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login')
  // El login del demo trae botones que autollenan credenciales por perfil
  await page.getByRole('button', { name: 'Entrar como Administrador' }).click()
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.waitForURL(/\/dashboard/)
}

/** Abre el menu Operaciones del detalle de la orden. */
async function openOperaciones(page: Page) {
  await page.getByRole('button', { name: 'Operaciones' }).click()
}

test.describe('BLOQUE 3: Factura a comision (circulo fiscal)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('2.0 Facturar esta deshabilitado en una orden confirmed', async ({ page }) => {
    await page.goto(`/dashboard/sales/${CONFIRMED_ORDER.id}`)
    await openOperaciones(page)
    const facturar = page.locator('button.dropdown-item', { hasText: 'Facturar' })
    await expect(facturar).toBeDisabled()
    await expect(facturar).toHaveAttribute(
      'title',
      /La orden debe estar entregada o completada para facturar/,
    )
  })

  test('2.1 Facturar una orden delivered genera el CFDI (draft por PAC off)', async ({ page }) => {
    await page.goto(`/dashboard/sales/${DELIVERED_ORDER_WITH_AR.id}`)
    await openOperaciones(page)

    // Modal de confirmacion (no ofrece elegir PPD/PUE: el backend lo asigna)
    await page.locator('button.dropdown-item', { hasText: 'Facturar' }).click()
    await expect(page.getByText(/Se generara el CFDI/)).toBeVisible()
    await page.locator('[class*="Modal_"]').getByRole('button', { name: 'Facturar' }).click()

    // Navega al detalle del CFDI recien creado, en Borrador (SW off)
    await page.waitForURL(/\/dashboard\/billing\/invoices\/\d+/)
    await expect(page.getByText('Borrador').first()).toBeVisible()
    await expect(page.getByText('$943.00').first()).toBeVisible()
  })

  test.fixme('2.2 La vista del CFDI muestra el metodoPago real (PPD)', async ({ page }) => {
    // BUG MEDIO (2026-07-12): la vista /dashboard/billing/invoices/{id}
    // pinta metodoPago="PUE", formaPago="01" y "Fecha: Invalid Date" cuando
    // el registro real (via API) tiene metodoPago="PPD", formaPago="99" y
    // fecha valida. El detalle no lee los atributos reales del CFDI.
    // Reactivar cuando la vista muestre los valores del registro.
    await page.goto('/dashboard/billing/invoices/1')
    await expect(page.getByText('PPD')).toBeVisible()
    await expect(page.getByText(/Invalid Date/)).toHaveCount(0)
  })

  test.fixme('2.3 Facturar una orden delivered sin ARInvoice falla en silencio', async ({ page }) => {
    // BUG MEDIO (2026-07-12): POST /sales-orders/{id}/facturar responde 422
    // {"error":"La orden no tiene factura de cuentas por cobrar (ARInvoice)..."}
    // y la UI navega a /billing/invoices/create sin mostrar el error.
    // Reactivar cuando la UI muestre un toast/alerta con el motivo del 422
    // (o el backend genere la ARInvoice on-the-fly al facturar).
    await page.goto(`/dashboard/sales/${DELIVERED_ORDER_NO_AR.id}`)
    await openOperaciones(page)
    await page.locator('button.dropdown-item', { hasText: 'Facturar' }).click()
    await page.locator('[class*="Modal_"]').getByRole('button', { name: 'Facturar' }).click()
    await expect(page.getByText(/no tiene factura de cuentas por cobrar|ARInvoice|Error/i)).toBeVisible()
  })

  test('3.1 La factura aparece en Cuentas por Cobrar con saldo pendiente', async ({ page }) => {
    await page.goto('/dashboard/finance/ar-invoices')
    const row = page.getByRole('row', { name: /AR-\d+/ }).first()
    await expect(row).toContainText(DELIVERED_ORDER_WITH_AR.customer)
    await expect(row).toContainText('$943.00')
    // Sin cobros -> saldo == total, estado posted
    await expect(row).toContainText(/Sin cobros/)
    await expect(row).toContainText(/posted/)
  })

  test('4.1 Registrar un pago PARCIAL: status partial y saldo baja', async ({ page }) => {
    await page.goto('/dashboard/finance/ar-invoices')
    await page.locator('main button[title="Registrar pago"]').first().click()

    // Modal Registrar Pago: catalogo SAT de formas de pago
    await expect(page.getByRole('heading', { name: 'Registrar Pago' })).toBeVisible()
    await page.getByRole('spinbutton', { name: 'Monto *' }).fill(PARTIAL_AMOUNT)
    await page.getByLabel('Forma de Pago *').selectOption(FORMA_PAGO)
    await page.getByRole('textbox', { name: 'Referencia' }).fill('E2E-PARCIAL-001')
    await page.locator('.Modal_modalFooter__mKajB').getByRole('button', { name: 'Registrar Pago' }).click()

    // Saldo baja a $543.00 y el estado pasa a Parcial
    await expect(page.getByText('Total Cobrado').locator('..')).toContainText('$400.00')
    const row = page.getByRole('row', { name: /AR-\d+/ }).first()
    await expect(row).toContainText('$543.00')
    await expect(row).toContainText(/Parcial/)
  })

  test.fixme('5.1 Emitir complemento de pago (REP) desde el CFDI PPD', async ({ page }) => {
    // BLOQUEADO por PAC off (esperado, no bug): la seccion "Complementos de
    // pago" y el boton "Emitir complemento de pago" solo aparecen para un
    // CFDI PPD TIMBRADO. Con SW_PAC_ENABLED=false el CFDI queda en draft y la
    // vista /dashboard/billing/invoices/{id} no expone la UI de REP.
    // Verificado por API: no hay endpoint de complemento accesible en draft y
    // POST /cfdi-invoices/{id}/stamp responde 500 "El servicio de timbrado PAC
    // no esta habilitado". Reactivar con PAC habilitado (SW_PAC_ENABLED=true).
    await page.goto('/dashboard/billing/invoices/1')
    await expect(page.getByRole('heading', { name: /Complementos de pago/i })).toBeVisible()
    await page.getByRole('button', { name: /Emitir complemento de pago/i }).click()
    await expect(page.getByText(/REP|Complemento/i)).toBeVisible()
  })

  test('6.1 Registrar el pago que LIQUIDA: status paid', async ({ page }) => {
    await page.goto('/dashboard/finance/ar-invoices')
    await page.locator('main button[title="Registrar pago"]').first().click()

    await expect(page.getByRole('heading', { name: 'Registrar Pago' })).toBeVisible()
    // El monto se prellena con el saldo restante ($543.00); se paga completo
    await page.getByLabel('Forma de Pago *').selectOption(FORMA_PAGO)
    await page.getByRole('textbox', { name: 'Referencia' }).fill('E2E-LIQUIDA-002')
    await page.locator('.Modal_modalFooter__mKajB').getByRole('button', { name: 'Registrar Pago' }).click()

    // 100% cobrado, saldo $0, estado Cobrada
    const row = page.getByRole('row', { name: /AR-\d+/ }).first()
    await expect(row).toContainText(/100% cobrado/)
    await expect(row).toContainText(/Cobrada/)
    await expect(page.getByText('Total por Cobrar').locator('..')).toContainText('$0.00')
  })

  test.fixme('7.1 La comision del vendedor pasa a Ganada al liquidar', async ({ page }) => {
    // BLOQUEADO por datos/config del demo (no bug de codigo):
    // 1) commissions.enabled estaba en false ("Inactivas") durante el cobro,
    //    asi que no se genero comision y no se genera retroactivamente.
    // 2) Ninguna orden del DemoWorkflowSeeder tiene vendedor asignado
    //    (Historico de Ventas muestra "Sin asignar"), asi que no hay sobre
    //    quien calcular la comision aunque el flag este activo.
    // Reactivar cuando el seeder asigne vendedor a las ordenes Y las
    // comisiones esten habilitadas antes de facturar/cobrar.
    await page.goto('/dashboard/commissions')
    await page.locator('main select').first().selectOption('thisYear')
    await expect(page.getByText(/No hay comisiones/)).toHaveCount(0)
    // La comision del vendedor de la orden liquidada debe aparecer como Ganada
    await expect(page.getByText(/Ganada/).locator('..')).not.toContainText('$0.00')
  })

  test.fixme('7.2 Pagar la comision ganada (pay-batch) -> Pagada', async ({ page }) => {
    // BLOQUEADO aguas arriba por 7.1: sin comisiones ganadas no hay nada que
    // pagar. Verificado por API: POST /commissions/pay-batch exige ids[] y
    // payment_reference (422 sin ellos). Reactivar cuando 7.1 genere comisiones.
    await page.goto('/dashboard/commissions')
    await page.getByRole('button', { name: /Pagar en lote|Pay batch|Marcar pagada/i }).first().click()
    await expect(page.getByText(/Pagada/).locator('..')).not.toContainText('$0.00')
  })

  test('8.1 Historico de Ventas muestra la venta con costo y utilidad', async ({ page }) => {
    await page.goto('/dashboard/reports/sales-history')
    await page.locator('main select').first().selectOption('thisYear')

    const row = page.getByRole('row', { name: new RegExp(DELIVERED_ORDER_WITH_AR.number) })
    await expect(row).toBeVisible()
    await expect(row).toContainText(DELIVERED_ORDER_WITH_AR.customer)
    // Columnas de costo y utilidad calculadas para la venta
    await expect(row).toContainText('$513.98') // costo
    await expect(row).toContainText('$325.02') // utilidad
    await expect(row).toContainText('$943.00') // total
  })

  test('8.2 El aging AR ya no lista la factura liquidada', async ({ page }) => {
    await page.goto('/dashboard/reports/aging-reports')
    // Con la unica AR invoice liquidada (saldo $0), el reporte AR queda vacio
    await expect(page.getByText(/No hay datos disponibles para el reporte AR/)).toBeVisible()
  })
})
