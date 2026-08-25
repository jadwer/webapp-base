'use client'

/**
 * CART PAGE (rediseno 2026-08, piel del tenant)
 *
 * Figma "Carrito de compras": titulo con "compras" en azul, pestanas
 * "Continuar con el pago" | "Mis cotizaciones", seleccion de productos
 * (checkbox por fila + seleccionar todos), filas con imagen/datos/cantidad/
 * precio verde/eliminar, tarjeta "Resumen del pedido" (subtotal, IVA,
 * envio por calcular, total verde, aviso y botones Generar cotizacion +
 * Continuar con el pago) y "Productos relacionados".
 *
 * Motor: useLocalCartPageController de @lwm/ecommerce (la MISMA logica del
 * carrito clasico: sync a API, cotizacion post-login, checkout). La
 * seleccion por fila es visual/de resumen: cotizar y pagar operan sobre los
 * productos seleccionados quitando del carrito los no seleccionados NO,
 * eso alteraria el flujo; el resumen refleja la seleccion y las acciones
 * proceden con TODO el carrito cuando todo esta seleccionado, o avisan si
 * hay seleccion parcial (guardar carritos parciales quedo como deuda).
 *
 * Pestana "Mis cotizaciones": lista las cotizaciones reales del usuario
 * autenticado (mismas del portal /dashboard/my-quotes). "Guardar carritos"
 * sin cotizar NO existe todavia: deuda registrada.
 */

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocalCartPageController, useSaleProducts, type EnhancedPublicProduct, type LocalCartItem } from '@lwm/ecommerce'
import { Modal, toast } from '@lwm/ui'
import { useAuth } from '@lwm/auth'
import { quoteService, type Quote } from '@lwm/sales'
import { QuoteStatusBadge, formatDateOnly } from '@lwm/sales'
import { LandingProductCard } from '../landing/components/LandingProductCard'
import styles from './CartPage.module.scss'

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

const CartItemRow: React.FC<{
  item: LocalCartItem
  checked: boolean
  onToggle: () => void
  onQuantity: (q: number) => void
  onRemove: () => void
}> = ({ item, checked, onToggle, onQuantity, onRemove }) => (
  <div className={`lw-card ${styles.itemRow}`}>
    <input
      type="checkbox"
      className={`form-check-input ${styles.itemCheck}`}
      checked={checked}
      onChange={onToggle}
      aria-label={`Seleccionar ${item.name}`}
    />
    <div className={styles.itemMedia}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name} />
      ) : (
        <i className="bi bi-box-seam" aria-hidden="true" />
      )}
    </div>
    <div className={styles.itemInfo}>
      <h3 className={styles.itemName}>
        <Link href={`/productos/${item.productId}`}>{item.name}</Link>
      </h3>
      <p className={styles.itemMeta}>
        {item.categoryName && <span>{item.categoryName}</span>}
        {item.sku && <span>SKU: {item.sku}</span>}
        {item.brandName && <span>Marca: {item.brandName}</span>}
      </p>
      <label className={styles.itemQty}>
        <span className="visually-hidden">Cantidad</span>
        <select value={item.quantity} onChange={(e) => onQuantity(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Cantidad: {n}</option>
          ))}
        </select>
      </label>
    </div>
    <div className={styles.itemPriceCol}>
      <span className={styles.itemPrice}>{formatMoney(item.price * item.quantity)}</span>
      <span className={styles.itemPriceMeta}>MXN/Pieza {item.iva ? '+ IVA' : 'IVA 0%'}</span>
      <button type="button" className={styles.itemRemove} onClick={onRemove} aria-label={`Quitar ${item.name}`}>
        <i className="bi bi-trash" aria-hidden="true" />
      </button>
    </div>
  </div>
)

const MyQuotesTab: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return
    let alive = true
    setLoading(true)
    quoteService
      .getAll({ contactEmail: user.email })
      .then((r) => { if (alive) setQuotes(r.data || []) })
      .catch(() => { if (alive) toast.error('No se pudieron cargar tus cotizaciones') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [isAuthenticated, user?.email])

  if (!isAuthenticated) {
    return (
      <div className={styles.emptyTab}>
        <i className="bi bi-file-earmark-text" aria-hidden="true" />
        <p>Inicia sesion para ver tus cotizaciones.</p>
        <Link href={`/auth/login?redirect=${encodeURIComponent('/cart')}`} className="btn lw-btn lw-btn-accent">
          Iniciar sesion
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.emptyTab}>
        <span className="spinner-border text-primary" role="status" aria-label="Cargando" />
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className={styles.emptyTab}>
        <i className="bi bi-file-earmark-text" aria-hidden="true" />
        <p>Aun no tienes cotizaciones. Genera una desde tu carrito.</p>
      </div>
    )
  }

  return (
    <div className={styles.quotesList}>
      {quotes.map((q) => (
        <div key={q.id} className={`lw-card ${styles.quoteRow}`}>
          <div>
            <strong className={styles.quoteNumber}>{q.quoteNumber || `COT-${q.id}`}</strong>
            <span className={styles.quoteDate}>{q.createdAt ? formatDateOnly(q.createdAt) : ''}</span>
          </div>
          <div className={styles.quoteRight}>
            <QuoteStatusBadge status={q.status} />
            <Link href={`/dashboard/my-quotes/${q.id}`} className="btn lw-btn lw-btn-sm lw-btn-accent-outline">
              Ver detalle
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

const CartContent: React.FC = () => {
  const controller = useLocalCartPageController({ checkoutUrl: '/checkout' })
  const {
    items,
    isInitialized,
    isEmpty,
    removeFromCart,
    updateQuantity,
    isRequestingQuote,
    isSyncingToCheckout,
    showQuoteModal,
    setShowQuoteModal,
    quoteNote,
    setQuoteNote,
    handleOpenQuoteModal,
    handleRequestQuote,
    handleProceedToCheckout,
  } = controller

  const [tab, setTab] = useState<'cart' | 'quotes'>('cart')
  const [deselected, setDeselected] = useState<Set<string>>(new Set())
  const { products: related } = useSaleProducts(8, 'unit,category,brand,currency')

  const selectedItems = useMemo(
    () => items.filter((i) => !deselected.has(i.productId)),
    [items, deselected]
  )
  const allSelected = deselected.size === 0

  const toggleItem = (productId: string) => {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const toggleAll = () => setDeselected(allSelected ? new Set(items.map((i) => i.productId)) : new Set())

  // Resumen sobre la seleccion actual
  const summary = useMemo(() => {
    const subtotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const tax = selectedItems.reduce((s, i) => s + (i.iva ? i.price * i.quantity * 0.16 : 0), 0)
    return { subtotal, tax, total: subtotal + tax, count: selectedItems.reduce((s, i) => s + i.quantity, 0) }
  }, [selectedItems])

  // Las acciones operan sobre TODO el carrito (flujo del dinero intacto);
  // con seleccion parcial se avisa antes de continuar.
  const guardPartial = (action: () => void) => () => {
    if (!allSelected && selectedItems.length !== items.length) {
      toast.info('Las acciones aplican a todo el carrito. Elimina los productos que no quieras incluir.')
    }
    action()
  }

  if (!isInitialized) {
    return (
      <div className="container py-5 text-center">
        <span className="spinner-border text-primary" role="status" aria-label="Cargando carrito" />
      </div>
    )
  }

  const handleAddRelated = (p: EnhancedPublicProduct) => {
    // reutiliza la logica del carrito local ya montada en el controller
    controller.addToCart(p, 1)
    toast.success(`${p.displayName} agregado al carrito`)
  }

  return (
    <>
      <div className={styles.band}>
        <div className="container">
          <h1 className={styles.title}>Carrito de <span className={styles.titleAccent}>compras</span></h1>

          <div className={`lw-card ${styles.tabs}`} role="tablist" aria-label="Secciones del carrito">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'cart'}
              className={`${styles.tab} ${tab === 'cart' ? styles.tabActive : ''}`}
              onClick={() => setTab('cart')}
            >
              Continuar con el pago
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'quotes'}
              className={`${styles.tab} ${tab === 'quotes' ? styles.tabActive : ''}`}
              onClick={() => setTab('quotes')}
            >
              Mis cotizaciones
            </button>
          </div>
        </div>
      </div>

      <div className={`container ${styles.wrap}`}>
        {tab === 'quotes' ? (
          <MyQuotesTab />
        ) : isEmpty ? (
          <div className={styles.emptyTab}>
            <i className="bi bi-cart3" aria-hidden="true" />
            <p>Tu carrito esta vacio.</p>
            <Link href="/productos" className="btn lw-btn lw-btn-accent">Ver productos</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.itemsCol}>
              <label className={`lw-card ${styles.selectAll}`}>
                <input type="checkbox" className="form-check-input" checked={allSelected} onChange={toggleAll} />
                <span>Seleccionar todos los productos</span>
              </label>

              {items.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  checked={!deselected.has(item.productId)}
                  onToggle={() => toggleItem(item.productId)}
                  onQuantity={(q) => updateQuantity(item.productId, q)}
                  onRemove={() => removeFromCart(item.productId)}
                />
              ))}
            </div>

            <aside className={`lw-card ${styles.summary}`} aria-label="Resumen del pedido">
              <h2 className={styles.summaryTitle}>Resumen del pedido</h2>
              <dl className={styles.summaryList}>
                <div><dt>Subtotal ({summary.count} productos)</dt><dd>{formatMoney(summary.subtotal)}</dd></div>
                <div><dt>IVA (16%)</dt><dd>{formatMoney(summary.tax)}</dd></div>
                <div><dt>Envio</dt><dd>Por calcular</dd></div>
                <div className={styles.summaryTotal}><dt>Total</dt><dd>{formatMoney(summary.total)}</dd></div>
              </dl>
              <p className={styles.summaryNote}>
                <i className="bi bi-info-circle" aria-hidden="true" />
                Al generar tu cotizacion te contactaremos con precios especiales y tiempos de entrega.
              </p>
              <button
                type="button"
                className="btn lw-btn lw-btn-accent w-100 mb-2"
                onClick={guardPartial(handleOpenQuoteModal)}
                disabled={isRequestingQuote}
              >
                Generar cotizacion
              </button>
              <button
                type="button"
                className="btn lw-btn lw-btn-accent w-100"
                onClick={guardPartial(handleProceedToCheckout)}
                disabled={isSyncingToCheckout}
              >
                {isSyncingToCheckout ? 'Preparando...' : 'Continuar con el pago'}
              </button>
            </aside>
          </div>
        )}

        {related.length > 0 && tab === 'cart' && (
          <section className={styles.related} aria-labelledby="cart-related-title">
            <h2 id="cart-related-title" className={`lw-heading ${styles.relatedTitle}`}>
              Productos <span className="lw-highlight">relacionados</span>
            </h2>
            <div className={styles.relatedRow}>
              {related.map((p) => (
                <div key={p.id} className={styles.relatedItem}>
                  <LandingProductCard product={p} variant="offer" onAddToCart={handleAddRelated} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal de cotizacion (misma logica del motor) */}
      <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} title="Generar cotizacion">
        <p className="mb-2">Agrega una nota para tu cotizacion (opcional):</p>
        <textarea
          className="form-control mb-3"
          rows={3}
          value={quoteNote}
          onChange={(e) => setQuoteNote(e.target.value)}
          placeholder="Notas para el equipo de ventas..."
        />
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn lw-btn lw-btn-accent-outline" onClick={() => setShowQuoteModal(false)}>
            Cancelar
          </button>
          <button type="button" className="btn lw-btn lw-btn-accent" onClick={handleRequestQuote} disabled={isRequestingQuote}>
            {isRequestingQuote ? 'Generando...' : 'Generar cotizacion'}
          </button>
        </div>
      </Modal>
    </>
  )
}

export const CartPage: React.FC = () => (
  <Suspense
    fallback={
      <div className="container py-5 text-center">
        <span className="spinner-border text-primary" role="status" aria-label="Cargando" />
      </div>
    }
  >
    <CartContent />
  </Suspense>
)

export default CartPage
