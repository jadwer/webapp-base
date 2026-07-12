import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test: Backoffice flow (BLOQUE 2 del plan E2E full flow, pasos 5-9)
 *
 * Flujo validado manualmente via Playwright MCP contra el demo vivo
 * (https://marcablanca.laborwasserdemexico.com) el 2026-07-11.
 *
 * Cubre: cotizacion (crear, items con semaforo de stock, editar precio,
 * descuento en % y $, IVA en totales) -> enviar/aceptar -> Generar venta
 * BLOQUEADA por stock (detalle por item) -> Generar pedido con OC del
 * cliente (orden nace pending) -> orden de compra al proveedor ->
 * recepcion (stock sube, APInvoice) -> remision (imprimir PDF, entregar)
 * -> marcar orden como surtida (delivered).
 *
 * baseURL se toma de playwright.config.ts (E2E_BASE_URL o localhost:3000).
 * Para correr contra el demo: E2E_BASE_URL=https://marcablanca.laborwasserdemexico.com
 *
 * Verificado ademas en la re-verificacion del paso 4 (bloque 1):
 * - FIX CRITICO del checkout CONFIRMADO en vivo: POST /shopping-carts/{id}/checkout
 *   (201, orden pending con folio OV-) ocurre ANTES de POST /stripe/payment-intents.
 *   Cliente nuevo sin Contact ya NO recibe 422: el Contact se crea on-the-fly.
 *
 * Bugs encontrados en la exploracion (2026-07-11):
 * - ALTO: crear orden de compra desde la UI esta roto. El picker de productos
 *   llama GET /products?filter[status]=active y el Schema solo permite
 *   filter[is_active] -> 400 "Filter parameter status is not allowed",
 *   "0 productos encontrados". Tambien rompe (en silencio) los botones
 *   "Marcar como Recibida" y "Aprobar Orden" del detalle de la PO.
 * - ALTO: editar orden de venta esta roto. El PATCH manda atributos
 *   snake_case (contact_id, order_number, order_date, approved_at,
 *   delivered_at, invoicing_notes) y el Schema espera camelCase -> 400
 *   sin feedback visible en la UI.
 * - ALTO: "Marcar como surtido" se habilita con la orden en confirmed pero
 *   el backend rechaza la transicion: POST /orders/{id}/status
 *   {"status":"delivered"} -> 400 "Cannot transition from 'confirmed' to
 *   'delivered'" (exige confirmed -> processing -> shipped -> delivered).
 *   Sin mensaje de error en la UI.
 * - ALTO (persiste del bloque 1): "Mis Pedidos" del portal customer llama
 *   el endpoint admin sales-orders?filter[contact_email] -> 403 para rol
 *   customer real ("Error al cargar tus pedidos").
 * - MEDIO: el PDF de la remision se genera (POST /remissions/{id}/print 200
 *   con url storage/remissions/...) pero la URL publica responde 404
 *   (probable storage:link faltante en el server).
 * - MEDIO: no existe proveedor seed en DemoWorkflowSeeder (todos los
 *   contacts son isSupplier=false); el combo de proveedor muestra el label
 *   "Contact ID 1 (Supplier)" en lugar del nombre.
 * - BAJO: detalle de cotizacion muestra "Contact #1" en vez del nombre del
 *   cliente; lista de quotes muestra "Cliente #N"; remisiones dentro de la
 *   orden muestran "REM-1" (id) en vez del folio REM-26-00001, fecha N/A e
 *   items "-"; estado de la orden surtida se muestra crudo ("delivered").
 * - BAJO: fechas mezclan dia UTC y dia CDMX (orden creada "11/07" con fecha
 *   de orden "10/07"; el banner de reset dice domingo 09:00 p.m. pero el
 *   cron corre a medianoche UTC).
 */

const ADMIN = { email: 'admin@demo.mx', password: 'Demo2026!' }

// Productos DEMO sin stock inicial (DemoWorkflowSeeder no crea stock)
const NO_STOCK_PRODUCT = { name: 'Guantes de nitrilo caja 100', sku: 'DEMO-010', price: 189 }
const SECOND_PRODUCT = { name: 'Valvula de seguridad 1/2"', sku: 'DEMO-014', price: 320 }

const QUOTE_CUSTOMER = 'Comercial del Centro (compras@comercialcentro.demo)'
const CUSTOMER_PO_NUMBER = `OC-E2E-${Date.now()}`

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login')
  // El login del demo trae botones que autollenan credenciales por perfil
  await page.getByRole('button', { name: 'Entrar como Administrador' }).click()
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.waitForURL(/\/dashboard/)
}

async function addQuoteItem(page: Page, productName: string, quantity = 1) {
  await page.getByRole('button', { name: /Agregar Producto/ }).click()
  const search = page.getByRole('textbox', { name: 'Buscar por nombre o SKU...' })
  await search.pressSequentially(productName.slice(0, 7))
  await page.getByRole('button', { name: new RegExp(productName.slice(0, 7)) }).first().click()
  if (quantity !== 1) {
    await page.getByRole('spinbutton').first().fill(String(quantity))
  }
  await page.getByRole('button', { name: /^\s*Agregar$/ }).click()
}

test.describe('BLOQUE 2: Backoffice (cotizacion a surtido)', () => {
  test.describe.configure({ mode: 'serial' })

  let quoteUrl = ''
  let salesOrderUrl = ''

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('5.1 Crear cotizacion en blanco para cliente demo', async ({ page }) => {
    await page.goto('/dashboard/quotes')
    await page.getByRole('button', { name: /Nueva Cotización/ }).click()
    await page.waitForURL(/\/dashboard\/quotes\/create/)

    await page.getByLabel('Cliente *').selectOption(QUOTE_CUSTOMER)
    await page.getByRole('button', { name: /Crear Cotización en Blanco/ }).click()

    await page.waitForURL(/\/dashboard\/quotes\/\d+$/)
    await expect(page.getByRole('heading', { name: /COT-\d+/ })).toBeVisible()
    await expect(page.getByText('Borrador').first()).toBeVisible()
    quoteUrl = page.url()
  })

  test('5.2 Items con semaforo de stock, precio editado y descuento % y $', async ({ page }) => {
    await page.goto(quoteUrl)

    // Item 1: producto sin stock (semaforo en 0)
    await addQuoteItem(page, NO_STOCK_PRODUCT.name)
    await expect(page.getByTitle('Sin stock disponible').first()).toBeVisible()

    // Item 2: segundo producto, cantidad 2
    await addQuoteItem(page, SECOND_PRODUCT.name, 2)

    // Editar item 2: precio cotizado distinto + descuento 10%
    await page.getByTitle('Editar').nth(1).click()
    await page.getByRole('spinbutton', { name: 'Precio cotizado' }).fill('350')
    await page.getByRole('spinbutton', { name: 'Descuento' }).fill('10')
    await page.getByTitle('Guardar').click()
    await expect(page.getByText('10.00%')).toBeVisible()
    await expect(page.getByText('-$70.00').first()).toBeVisible()

    // Cambiar descuento a modo $ (50 pesos)
    await page.getByTitle('Editar').nth(1).click()
    await page.getByLabel('Modo de descuento').selectOption('$')
    await page.getByRole('spinbutton', { name: 'Descuento' }).fill('50')
    await page.getByTitle('Guardar').click()
    await expect(page.getByText('-$50.00').first()).toBeVisible()

    // IVA visible en los totales de la tabla (16% del item con IVA)
    await expect(page.getByRole('cell', { name: 'IVA:' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '$104.00' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '$943.00' })).toBeVisible()
  })

  test('5.3 Enviar y aceptar la cotizacion', async ({ page }) => {
    await page.goto(quoteUrl)

    await page.getByRole('button', { name: 'Operaciones' }).click()
    await page.getByRole('button', { name: /Enviar/ }).click()
    // Modal de confirmacion (avisa si el contacto no tiene correo)
    await page.getByRole('button', { name: 'Enviar', exact: true }).click()
    await expect(page.getByText('Enviada').first()).toBeVisible()

    await page.getByRole('button', { name: /Aceptar/ }).click()
    await expect(page.getByText('Aceptada').first()).toBeVisible()
  })

  test('5.4 Generar venta BLOQUEADA por stock con detalle por item', async ({ page }) => {
    await page.goto(quoteUrl)

    await page.getByRole('button', { name: 'Operaciones' }).click()
    await page.getByRole('button', { name: 'Generar venta', exact: true }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByText(/Requiere stock disponible/)).toBeVisible()
    // Detalle por item: producto, cantidad requerida y stock disponible
    await expect(modal.getByText(NO_STOCK_PRODUCT.sku)).toBeVisible()
    await expect(modal.getByText(SECOND_PRODUCT.sku)).toBeVisible()
    await expect(modal.getByTitle('Sin stock disponible').first()).toBeVisible()
    // Alerta de bloqueo + boton confirmar deshabilitado (regla nueva)
    await expect(modal.getByText(/Hay items sin stock suficiente/)).toBeVisible()
    await expect(modal.getByRole('button', { name: /Generar venta/ })).toBeDisabled()

    await modal.getByRole('button', { name: 'Cancelar', exact: true }).click()
  })

  test('5.5 Generar pedido con OC del cliente: orden nace pending', async ({ page }) => {
    await page.goto(quoteUrl)

    await page.getByRole('button', { name: 'Operaciones' }).click()
    await page.getByRole('button', { name: 'Generar pedido', exact: true }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByText(/La orden nace pendiente/)).toBeVisible()
    // Lista de items que requeriran compra de material
    await expect(modal.getByText(/Items que requeriran compra de material/)).toBeVisible()
    await modal.getByRole('textbox', { name: /No\. OC del cliente/ }).fill(CUSTOMER_PO_NUMBER)
    await modal.getByRole('button', { name: /Generar pedido/ }).click()

    await page.waitForURL(/\/dashboard\/sales\/\d+$/)
    salesOrderUrl = page.url()
    await expect(page.getByRole('heading', { name: /Orden de Venta #OV-\d+/ })).toBeVisible()
    await expect(page.getByText('Pendiente').first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Pedido' })).toBeVisible()
    // Panel de disponibilidad con deficit por producto
    await expect(page.getByText('Stock insuficiente')).toBeVisible()
    await expect(page.getByRole('button', { name: /Crear Orden de Compra/ })).toBeVisible()
  })

  test.fixme('6.1 Crear orden de compra al proveedor desde la UI', async ({ page }) => {
    // BUG ALTO (2026-07-11): /dashboard/purchase/create no puede listar
    // productos. El picker llama GET /products?filter[status]=active y el
    // Schema del backend solo define filter[is_active] -> 400
    // {"detail":"Filter parameter status is not allowed."} y el buscador
    // queda en "0 productos encontrados". Ademas no existe proveedor seed
    // (todos los contacts son isSupplier=false) y el combo muestra
    // "Contact ID 1 (Supplier)" como label.
    // Reactivar cuando el picker use filter[is_active] (o el Schema permita
    // status) y el seeder incluya un proveedor.
    await page.goto(salesOrderUrl)
    await page.getByRole('button', { name: /Crear Orden de Compra/ }).click()
    await page.waitForURL(/\/dashboard\/purchase\/create/)
    await page.getByLabel('Proveedor *').selectOption({ index: 1 })
    await page.getByRole('button', { name: /Agregar Item/ }).click()
    await page
      .getByRole('textbox', { name: 'Buscar por nombre o SKU...' })
      .pressSequentially(NO_STOCK_PRODUCT.name.slice(0, 7))
    await expect(page.getByText(/\d+ productos encontrados/)).not.toHaveText('0 productos encontrados')
  })

  test.fixme('7.1 Recibir la PO desde la UI (stock sube)', async ({ page }) => {
    // BUG ALTO (2026-07-11): en /dashboard/purchase/{id} los botones
    // "Marcar como Recibida" y "Aprobar Orden" no disparan ninguna
    // peticion de accion; cada click solo re-lanza el fetch de productos
    // con filter[status]=active (400) y el flujo muere sin feedback.
    // Verificado por API: PATCH purchase-orders/{id} {status:"received"}
    // SI genera los movimientos (stock 0 -> qty recibida) y crea la
    // APInvoice automaticamente (financialStatus=invoiced, apInvoiceId).
    // Reactivar cuando los botones de accion llamen al endpoint correcto.
    await page.goto('/dashboard/purchase')
    await page.getByRole('button', { name: /Ver/ }).first().click()
    await page.getByRole('button', { name: /Marcar como Recibida/ }).click()
    await page.goto(salesOrderUrl)
    await expect(page.getByText('Todo disponible')).toBeVisible()
  })

  test('8.1 Remision: generar desde la orden, imprimir y marcar entregada', async ({ page }) => {
    // Precondicion: la orden tiene stock disponible (PO recibida).
    await page.goto(salesOrderUrl)

    // Generar remision con todos los items
    await page.getByRole('button', { name: /Generar Remision/ }).first().click()
    await page.getByRole('button', { name: 'Confirmar' }).click()
    await expect(page.getByRole('heading', { name: /Remisiones \(1\)/ })).toBeVisible()

    // Gestionar desde el modulo de remisiones
    await page.goto('/dashboard/remissions')
    await expect(page.getByText(/REM-\d+/).first()).toBeVisible()

    // Imprimir (marca Impresa y genera el PDF en el backend)
    await page.getByTitle('Imprimir (genera PDF)').first().click()
    await expect(page.getByRole('cell', { name: 'Impresa' })).toBeVisible()

    // Marcar entregada
    await page.getByTitle('Marcar como entregada').first().click()
    await page.getByRole('button', { name: 'Marcar entregada' }).click()
    await expect(page.getByRole('cell', { name: 'Entregada' })).toBeVisible()
  })

  test.fixme('8.2 PDF de remision descargable', async ({ page, request }) => {
    // BUG MEDIO (2026-07-11): POST /remissions/{id}/print responde 200 con
    // {"data":{"url":"https://apimb.../storage/remissions/{id}/remision_REM-....pdf"}}
    // pero esa URL publica responde 404 (probable php artisan storage:link
    // faltante en el servidor). Reactivar cuando el storage este expuesto.
    await page.goto('/dashboard/remissions')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTitle('Descargar PDF').first().click(),
    ])
    expect(await download.failure()).toBeNull()
  })

  test.fixme('9.1 Marcar como surtido desde Operaciones', async ({ page }) => {
    // BUG ALTO (2026-07-11): la transicion a delivered esta rota en UI.
    // 1) "Marcar como surtido" aparece deshabilitado con la orden pending.
    // 2) El form de edicion para confirmarla manda snake_case y el PATCH
    //    a sales-orders/{id} responde 400 (atributos no soportados).
    // 3) Con la orden en confirmed (via API), el boton se habilita pero
    //    POST /orders/{id}/status {"status":"delivered"} responde 400
    //    "Cannot transition from 'confirmed' to 'delivered'" y la UI no
    //    muestra ningun error. La maquina de estados exige
    //    confirmed -> processing -> shipped -> delivered (cada paso 200
    //    via API, verificado manualmente).
    // Reactivar cuando la UI recorra la cadena valida o el backend permita
    // el salto confirmed -> delivered para el flujo de mostrador.
    await page.goto(salesOrderUrl)
    await page.getByRole('button', { name: 'Operaciones' }).click()
    await page.getByRole('button', { name: 'Marcar como surtido' }).click()
    await page.getByRole('button', { name: 'Marcar surtido' }).click()
    await expect(page.getByText(/delivered|Entregado|Surtido/).first()).toBeVisible()
  })
})
