import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test: Guest to Purchase (BLOQUE 1 del plan E2E full flow)
 *
 * Flujo validado manualmente via Playwright MCP contra el demo vivo
 * (https://marcablanca.laborwasserdemexico.com) el 2026-07-10.
 *
 * Cubre: guest navega catalogo -> filtros -> detalle -> carrito ->
 * checkout exige login -> registro -> carrito persiste -> checkout ->
 * pago Stripe test -> confirmacion de orden.
 *
 * baseURL se toma de playwright.config.ts (E2E_BASE_URL o localhost:3000).
 * Para correr contra el demo: E2E_BASE_URL=https://marcablanca.laborwasserdemexico.com
 *
 * Bugs conocidos encontrados en la exploracion (2026-07-10):
 * - CRITICO: checkout cobra en Stripe (PaymentIntent succeeded) y despues
 *   POST /shopping-carts/{id}/checkout responde 422
 *   {"error":"No contact found for this user. Please provide contact_id."}
 *   para clientes recien registrados (sin Contact). Cobro sin orden.
 * - ALTO: precios marcados "IVA incluido" en catalogo/carrito pero el
 *   resumen agrega 16% de IVA encima del subtotal.
 * - MEDIO: facetas de categoria/marca ocultan las demas opciones al
 *   seleccionar una; la multi-seleccion (filter[brands]/[categories])
 *   no es alcanzable desde la UI.
 * - MEDIO: customer nuevo recibe 403 en sales-orders?filter[contact_email]
 *   y coupons?filter[is_active] (widgets del portal muestran error).
 */

const CATALOG = '/productos'
const CART = '/cart'

// Producto DEMO usado en la exploracion (seeder DemoWorkflowSeeder)
const DEMO_PRODUCT = {
  name: 'Compresor silencioso 50L',
  sku: 'DEMO-003',
  category: 'Equipos',
  brand: 'EcoMax',
}
const SECOND_PRODUCT = { name: 'Bascula de precision 30kg', sku: 'DEMO-004' }

const STRIPE_TEST_CARD = { number: '4242 4242 4242 4242', expiry: '12 / 30', cvc: '123' }

function uniqueCustomer() {
  const stamp = Date.now()
  return {
    name: `Cliente E2E ${stamp}`,
    email: `e2e-${stamp}@test.demo`,
    password: 'E2eDemo2026!',
  }
}

async function addProductToCartFromDetail(page: Page, productName: string) {
  await page.goto(CATALOG)
  await page.getByPlaceholder('Buscar productos...').fill(productName)
  await page.getByRole('heading', { name: productName }).click()
  await page.waitForURL(/\/productos\/\d+/)
  await page.getByRole('button', { name: /Agregar al Carrito/ }).click()
  // El detalle confirma con el contador "Ya tienes N en tu carrito"
  await expect(page.getByText(/Ya tienes \d+ en tu carrito/)).toBeVisible()
}

async function registerCustomer(page: Page, customer: ReturnType<typeof uniqueCustomer>) {
  await page.goto('/auth/register')
  await page.getByRole('textbox', { name: 'Nombre completo' }).fill(customer.name)
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(customer.email)
  await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill(customer.password)
  await page.getByRole('textbox', { name: 'Confirmar contraseña' }).fill(customer.password)
  await page.getByRole('button', { name: 'Registrarme' }).click()
  // Redirige a login con bandera registered=true y alerta de exito
  await page.waitForURL(/\/auth\/login\?registered=true/)
  await expect(page.getByText('Tu cuenta fue creada correctamente')).toBeVisible()
}

async function loginAs(page: Page, email: string, password: string) {
  if (!page.url().includes('/auth/login')) {
    await page.goto('/auth/login')
  }
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(email)
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.waitForURL(/\/dashboard/)
}

test.describe('BLOQUE 1: Guest a compra online', () => {
  test.describe.configure({ mode: 'serial' })

  test('1.1 Home muestra banner de demo con fecha de proximo reset', async ({ page }) => {
    await page.goto('/')
    const banner = page.getByRole('region', { name: 'Aviso de entorno de demostracion' })
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Entorno de demostracion')
    await expect(banner).toContainText('Proximo reinicio:')
  })

  test('1.2 Catalogo: busqueda por nombre filtra resultados', async ({ page }) => {
    await page.goto(CATALOG)
    await expect(page.getByRole('heading', { name: 'Todos los productos' })).toBeVisible()

    await page.getByPlaceholder('Buscar productos...').fill('Bascula')
    await expect(page.getByRole('heading', { name: SECOND_PRODUCT.name })).toBeVisible()
    await expect(page.getByRole('heading', { name: DEMO_PRODUCT.name })).toHaveCount(0)
  })

  test('1.3 Catalogo: filtro por categoria y marca combinados', async ({ page }) => {
    await page.goto(CATALOG)
    // Facetas: botones "Nombre(count)" en los grupos Categorias / Marcas
    await page.getByRole('button', { name: /^Equipos\(\d+\)$/ }).click()
    await page.getByRole('button', { name: /^EcoMax\(\d+\)$/ }).click()

    await expect(page.getByRole('heading', { name: DEMO_PRODUCT.name })).toBeVisible()
    // Un producto de otra categoria/marca no debe aparecer
    await expect(page.getByRole('heading', { name: SECOND_PRODUCT.name })).toHaveCount(0)
  })

  test.fixme('1.3b Catalogo: multi-seleccion de marcas (filter[brands] plural)', async ({ page }) => {
    // BUG (2026-07-10): al seleccionar una faceta, las demas opciones del
    // grupo desaparecen del sidebar, por lo que no se puede seleccionar una
    // segunda marca/categoria desde la UI aunque el backend soporta
    // filter[brands]=a,b. Reactivar cuando la UI conserve las opciones.
    await page.goto(CATALOG)
    await page.getByRole('button', { name: /^EcoMax\(\d+\)$/ }).click()
    await page.getByRole('button', { name: /^ProLine\(\d+\)$/ }).click()
  })

  test('1.4 Detalle de producto muestra hint de IVA junto al precio', async ({ page }) => {
    await page.goto(CATALOG)
    await page.getByRole('heading', { name: DEMO_PRODUCT.name }).click()
    await page.waitForURL(/\/productos\/\d+/)

    await expect(page.getByRole('heading', { level: 1, name: DEMO_PRODUCT.name })).toBeVisible()
    await expect(page.getByText(`SKU:`)).toBeVisible()
    await expect(page.getByText(DEMO_PRODUCT.sku)).toBeVisible()
    // Hint de IVA junto al precio: "IVA incluido" o "+ 16% IVA"
    await expect(page.getByText(/IVA incluido|\+ 16% IVA/).first()).toBeVisible()
  })

  test('2.1 Guest agrega 2 productos y el carrito los muestra', async ({ page }) => {
    await addProductToCartFromDetail(page, DEMO_PRODUCT.name)
    await addProductToCartFromDetail(page, SECOND_PRODUCT.name)

    await page.goto(CART)
    await expect(page.getByRole('heading', { name: /Carrito de Compras/ })).toBeVisible()
    await expect(page.getByText('2 productos').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: DEMO_PRODUCT.name })).toBeVisible()
    await expect(page.getByRole('heading', { name: SECOND_PRODUCT.name })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Resumen del Pedido' })).toBeVisible()
  })

  test('2.2 Checkout como guest redirige a login (decision de negocio)', async ({ page }) => {
    // El carrito guest vive en localStorage (key app_cart); en un contexto
    // nuevo hay que re-agregar antes de probar el CTA de pago.
    await addProductToCartFromDetail(page, DEMO_PRODUCT.name)
    await page.goto(CART)
    await page.getByRole('button', { name: /Proceder al Pago/ }).click()
    await page.waitForURL(/\/auth\/login\?redirect=/)
    expect(page.url()).toContain('redirect=%2Fcart%3Faction%3Dcheckout')
  })

  test('3.1 Registro de cliente nuevo y login con rol customer', async ({ page }) => {
    const customer = uniqueCustomer()
    await registerCustomer(page, customer)
    await loginAs(page, customer.email, customer.password)

    // El dashboard de customer es el portal de cliente
    await expect(page.getByRole('heading', { name: 'Mi Portal' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Mis Pedidos' })).toBeVisible()
    await expect(page.getByRole('heading', { name: `Bienvenido, ${customer.name}` })).toBeVisible()
  })

  test('4.1 Carrito persiste tras registro/login y llega al paso de pago', async ({ page }) => {
    // Flujo completo en un solo contexto para conservar localStorage
    await addProductToCartFromDetail(page, DEMO_PRODUCT.name)
    await addProductToCartFromDetail(page, SECOND_PRODUCT.name)

    const customer = uniqueCustomer()
    await registerCustomer(page, customer)
    await loginAs(page, customer.email, customer.password)

    // Persistencia del carrito tras login
    await page.goto(CART)
    await expect(page.getByRole('heading', { name: DEMO_PRODUCT.name })).toBeVisible()
    await expect(page.getByRole('heading', { name: SECOND_PRODUCT.name })).toBeVisible()

    // Paso 1: informacion de contacto y direccion de envio
    await page.getByRole('button', { name: /Proceder al Pago/ }).click()
    await page.waitForURL(/\/checkout/)
    await page.getByRole('textbox', { name: 'Nombre Completo *' }).fill(customer.name)
    await page.getByRole('textbox', { name: 'Email *' }).fill(customer.email)
    await page.getByRole('textbox', { name: 'Telefono' }).fill('55 1234 5678')
    await page.getByRole('textbox', { name: 'Direccion Linea 1 *' }).fill('Av. Insurgentes Sur 1234')
    await page.getByRole('textbox', { name: 'Ciudad *' }).fill('Ciudad de Mexico')
    await page.getByRole('textbox', { name: 'Estado *' }).fill('CDMX')
    await page.getByRole('textbox', { name: 'Codigo Postal *' }).fill('03100')
    await page.getByRole('button', { name: /Continuar al Pago/ }).click()

    // Paso 2: Stripe Payment Element (iframe)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await stripeFrame.getByRole('textbox', { name: 'Número de tarjeta' }).fill(STRIPE_TEST_CARD.number)
    await stripeFrame.getByRole('textbox', { name: /Fecha de caducidad/ }).fill(STRIPE_TEST_CARD.expiry)
    await stripeFrame.getByRole('textbox', { name: 'Código de seguridad' }).fill(STRIPE_TEST_CARD.cvc)

    await expect(page.getByRole('button', { name: /Pagar \$/ })).toBeEnabled()
  })

  test.fixme('4.2 Pago Stripe crea orden y muestra confirmacion con folio', async ({ page }) => {
    // BUG CRITICO (2026-07-10, demo marcablanca): al hacer clic en
    // "Pagar $...", Stripe confirma el PaymentIntent (status succeeded,
    // cobro realizado) pero POST /api/v1/shopping-carts/{id}/checkout
    // responde 422 {"error":"No contact found for this user. Please
    // provide contact_id."} porque el cliente recien registrado no tiene
    // Contact asociado. Resultado: cobro sin orden, sin pagina de
    // confirmacion, sin mensaje de error visible para el usuario, y el
    // Payment Element queda roto (400 en elements/sessions al reusar el
    // client_secret consumido).
    //
    // Ademas el orden de operaciones es inverso al seguro: se debe validar
    // /checkout (y crear la orden) ANTES de confirmar el cobro en Stripe.
    //
    // Reactivar cuando el backend cree el Contact on-the-fly (o el
    // frontend lo cree antes de cobrar). Aserciones esperadas:
    await page.getByRole('button', { name: /Pagar \$/ }).click()
    await page.waitForURL(/confirmacion|confirmation|success/)
    await expect(page.getByText(/OV-\d+/)).toBeVisible()
  })
})
