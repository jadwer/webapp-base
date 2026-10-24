/**
 * Textos de la landing del portal (demo marca blanca). Solo funciones que el
 * sistema tiene hoy; nada de cifras, clientes ni testimonios inventados.
 */

export interface IconItem {
  icon: string
  title: string
  text: string
}

/** Fila 2: que es esta pagina y que vende. */
export const ABOUT_POINTS: IconItem[] = [
  {
    icon: 'bi-shop',
    title: 'Una tienda que vende de verdad',
    text: 'Catálogo, ofertas, carrito y cotizaciones funcionando con productos de demostración. Puedes comprar o cotizar aquí mismo.',
  },
  {
    icon: 'bi-diagram-3',
    title: 'Un sistema completo detrás',
    text: 'Cada pedido pasa a inventario, facturación, cobranza y contabilidad sin capturarlo dos veces.',
  },
  {
    icon: 'bi-palette',
    title: 'Con el nombre de tu empresa',
    text: 'Tu logo, tus datos de contacto y tu catálogo. Empiezas con la tienda y sumas módulos cuando los necesitas.',
  },
]

/** Fila de caracteristicas de la tienda (entre destacados y nuevos productos). */
export const STORE_FEATURES: IconItem[] = [
  { icon: 'bi-search', title: 'Buscador y filtros', text: 'Por categoría, marca y precio, con 5 vistas de catálogo.' },
  { icon: 'bi-receipt', title: 'Precios claros', text: 'Cada precio indica si es + IVA; sin sorpresas en el carrito.' },
  { icon: 'bi-tags', title: 'Ofertas con fecha', text: 'Precio anterior tachado y vigencia de inicio y fin.' },
  { icon: 'bi-credit-card', title: 'Pago con tarjeta o cotización', text: 'Cobro en línea con Stripe o pedido por cotización.' },
  { icon: 'bi-droplet-half', title: 'Productos a granel', text: 'Precio sujeto a cotización y fraccionamiento a presentaciones.' },
  { icon: 'bi-file-earmark-pdf', title: 'Cotizaciones en PDF', text: 'Se envían por correo y se convierten en pedido.' },
  { icon: 'bi-person-badge', title: 'Portal del cliente', text: 'Mis pedidos y Mis cotizaciones, siempre a la mano.' },
  { icon: 'bi-envelope-check', title: 'Correos automáticos', text: 'Confirmaciones y avisos con tu marca, personalizables.' },
]

export interface ModuleGroup {
  icon: string
  title: string
  items: string[]
}

export const MODULE_GROUPS: ModuleGroup[] = [
  { icon: 'bi-cart3', title: 'Ventas', items: ['Cotizaciones con PDF', 'Pedidos y remisiones', 'CRM', 'Comisiones de vendedores'] },
  { icon: 'bi-box-seam', title: 'Inventario', items: ['Existencias por almacén', 'Lotes con caducidad', 'Fraccionamiento de granel', 'Movimientos y ajustes'] },
  { icon: 'bi-truck', title: 'Compras', items: ['Órdenes a proveedores', 'Recepción a inventario', 'Cuentas por pagar'] },
  { icon: 'bi-file-earmark-text', title: 'Facturación', items: ['CFDI 4.0', 'Cancelación con aceptación', 'Complementos de pago', 'Factura libre'] },
  { icon: 'bi-calculator', title: 'Finanzas y contabilidad', items: ['Cuentas por cobrar', 'Pólizas automáticas', 'Reportes en Excel y PDF'] },
  { icon: 'bi-gear', title: 'Administración', items: ['Recursos humanos y nómina', 'Multisucursal', 'Permisos por rol y por usuario', 'Editor de páginas'] },
]

export const FLOW_STEPS: IconItem[] = [
  { icon: 'bi-bag-check', title: 'Compra o cotiza', text: 'El cliente compra en la tienda o pide cotización.' },
  { icon: 'bi-clipboard-check', title: 'Pedido', text: 'Se genera el pedido de venta.' },
  { icon: 'bi-box-seam', title: 'Surtido', text: 'Se surte y se descuenta del inventario.' },
  { icon: 'bi-file-earmark-text', title: 'Factura CFDI', text: 'Se timbra la factura electrónica.' },
  { icon: 'bi-cash-coin', title: 'Cobro', text: 'Se registra el pago en cuentas por cobrar.' },
  { icon: 'bi-journal-check', title: 'Contabilidad', text: 'Las pólizas se generan solas.' },
]

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    q: '¿Puedo usar el portal con el nombre de mi empresa?',
    a: 'Sí. El nombre, el logo y los datos de contacto se configuran desde el sistema; la tienda y los documentos salen con tu marca.',
  },
  {
    q: '¿Tengo que contratar todos los módulos?',
    a: 'No. Se vende por bloques: empiezas con la tienda y sumas inventario, facturación, contabilidad u otros módulos cuando los necesitas.',
  },
  {
    q: '¿Emite facturas electrónicas?',
    a: 'Sí, CFDI 4.0: timbrado, cancelación con aceptación del receptor y complementos de pago.',
  },
  {
    q: '¿Cómo pagan mis clientes?',
    a: 'Con tarjeta en línea (Stripe) o con un pedido por cotización. Los productos a granel siempre se cotizan.',
  },
  {
    q: '¿Qué pasa con lo que haga en la demo?',
    a: 'Puedes crear lo que quieras: los datos de la demo se reinician cada semana.',
  },
]
