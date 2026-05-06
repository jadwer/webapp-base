'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuoteMutations } from '@/modules/quotes'
import { contactsService } from '@/modules/contacts/services'
import { shoppingCartService } from '@/modules/ecommerce'
import type { ShoppingCart } from '@/modules/ecommerce'
import { stockService } from '@/modules/inventory'
import { toast } from '@/lib/toast'
import type { LocalCartItem } from '@/modules/public-catalog'

interface Contact {
  id: string
  name: string
  email?: string
}

interface CartWithItems {
  id: string
  items: Array<{
    id: string
    productName: string
    productId: string
    quantity: number
    unitPrice: number
  }>
  totalAmount: number
}

// Items from localStorage public cart
interface PublicCartPreview {
  items: LocalCartItem[]
  totalAmount: number
}

export default function CreateQuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cartIdFromUrl = searchParams.get('cart_id')
  const contactIdFromUrl = searchParams.get('contact_id')
  const sourceFromUrl = searchParams.get('source')

  const mutations = useQuoteMutations()

  // Creation mode: 'from-cart' or 'from-scratch'
  const [mode, setMode] = useState<'from-cart' | 'from-scratch'>(
    sourceFromUrl === 'public-cart' || cartIdFromUrl ? 'from-cart' : 'from-scratch'
  )

  // Form state
  const [selectedCartId, setSelectedCartId] = useState<string>(cartIdFromUrl || '')
  const [selectedContactId, setSelectedContactId] = useState<string>(contactIdFromUrl || '')
  const [validUntil, setValidUntil] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [termsAndConditions, setTermsAndConditions] = useState<string>('')

  // Data from API
  const [contacts, setContacts] = useState<Contact[]>([])
  const [carts, setCarts] = useState<CartWithItems[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Public cart from localStorage
  const [publicCartPreview, setPublicCartPreview] = useState<PublicCartPreview | null>(null)
  const [isCreatingBackendCart, setIsCreatingBackendCart] = useState(false)

  // Stock data for products
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  // Set default validity date (30 days from now)
  useEffect(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    setValidUntil(defaultDate.toISOString().split('T')[0])
  }, [])

  // Load public cart from sessionStorage if coming from public cart
  useEffect(() => {
    if (sourceFromUrl === 'public-cart') {
      try {
        const pendingCart = sessionStorage.getItem('pendingQuoteCart')
        if (pendingCart) {
          const items: LocalCartItem[] = JSON.parse(pendingCart)
          if (items.length > 0) {
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            setPublicCartPreview({ items, totalAmount })
          }
        }
      } catch (error) {
        console.error('Error loading public cart:', error)
      }
    }
  }, [sourceFromUrl])

  // Transform ShoppingCart to display format
  const transformCartToDisplay = (cart: ShoppingCart): CartWithItems => {
    return {
      id: String(cart.id),
      items: (cart.items || []).map((item) => {
        const product = item.product as { name?: string } | undefined
        return {
          id: String(item.id),
          productId: String(item.productId),
          productName: product?.name || `Producto #${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0
        }
      }),
      totalAmount: cart.totalAmount || 0
    }
  }

  // Create backend cart from public cart items
  const createBackendCartFromPublicCart = async (): Promise<string | null> => {
    if (!publicCartPreview || publicCartPreview.items.length === 0) {
      return null
    }

    setIsCreatingBackendCart(true)
    try {
      // Create or get current cart
      const cart = await shoppingCartService.cart.getOrCreate()

      // Clear existing items
      if (cart.items && cart.items.length > 0) {
        for (const item of cart.items) {
          await shoppingCartService.items.remove(String(item.id))
        }
      }

      // Add items from public cart
      for (const item of publicCartPreview.items) {
        await shoppingCartService.items.add(
          Number(cart.id),
          Number(item.productId),
          item.quantity
        )
      }

      // Clear public cart from sessionStorage
      sessionStorage.removeItem('pendingQuoteCart')

      // Refresh carts list
      await loadData()

      return String(cart.id)
    } catch (error) {
      console.error('Error creating backend cart:', error)
      toast.error('Error al sincronizar el carrito')
      return null
    } finally {
      setIsCreatingBackendCart(false)
    }
  }

  // Load contacts and carts from API
  const loadData = useCallback(async () => {
    setIsLoadingData(true)
    setLoadError(null)

    const fetchAllCarts = async (): Promise<CartWithItems[]> => {
      try {
        const currentCart = await shoppingCartService.cart.getCurrent()
        if (currentCart) {
          return [transformCartToDisplay(currentCart)]
        }
        return []
      } catch {
        return []
      }
    }

    try {
      // Fetch contacts and carts in parallel
      const [contactsResponse, cartsResponse] = await Promise.all([
        contactsService.getAll({
          filters: { isCustomer: true },
          pagination: { page: 1, size: 100 }
        }),
        fetchAllCarts()
      ])

      // Transform contacts - handle JSON:API response structure
      // The response.data contains objects with { type, id, attributes } structure
      const transformedContacts: Contact[] = (contactsResponse.data || []).map((c: unknown) => {
        const contact = c as {
          id: string | number
          type?: string
          attributes?: { name?: string; email?: string }
          name?: string
          email?: string
        }

        // Check if it's JSON:API format (has attributes) or already transformed
        if (contact.attributes) {
          return {
            id: String(contact.id),
            name: contact.attributes.name || 'Sin nombre',
            email: contact.attributes.email || undefined
          }
        }

        // Already transformed or flat format
        return {
          id: String(contact.id),
          name: contact.name || 'Sin nombre',
          email: contact.email || undefined
        }
      })

      setContacts(transformedContacts)
      setCarts(cartsResponse)

    } catch (error) {
      console.error('Error loading data:', error)
      setLoadError('Error al cargar datos. Por favor intenta de nuevo.')
      toast.error('Error al cargar contactos y carritos')
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedCart = carts.find(c => c.id === selectedCartId)
  const selectedContact = contacts.find(c => c.id === selectedContactId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContactId) {
      toast.error('Selecciona un cliente')
      return
    }

    // From-scratch mode: create blank quote directly
    if (mode === 'from-scratch') {
      try {
        const result = await mutations.create.mutateAsync({
          contactId: parseInt(selectedContactId),
          quoteDate: new Date().toISOString().split('T')[0],
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          termsAndConditions: termsAndConditions || undefined,
          currency: 'MXN'
        })

        toast.success('Cotización creada. Agrega los productos a continuación.')
        router.push(`/dashboard/quotes/${result.id}`)
      } catch {
        toast.error('Error al crear la cotización')
      }
      return
    }

    // From-cart mode
    let cartIdToUse = selectedCartId

    // If we have a public cart preview but no selected cart, create backend cart first
    if (!cartIdToUse && publicCartPreview && publicCartPreview.items.length > 0) {
      toast.info('Sincronizando carrito...')
      const newCartId = await createBackendCartFromPublicCart()
      if (!newCartId) {
        toast.error('Error al sincronizar el carrito')
        return
      }
      cartIdToUse = newCartId
    }

    if (!cartIdToUse) {
      toast.error('Selecciona un carrito')
      return
    }

    try {
      const result = await mutations.createFromCart.mutateAsync({
        shopping_cart_id: parseInt(cartIdToUse),
        contact_id: parseInt(selectedContactId),
        valid_until: validUntil || undefined,
        notes: notes || undefined,
        terms_and_conditions: termsAndConditions || undefined
      })

      toast.success('Cotización creada exitosamente')
      router.push(`/dashboard/quotes/${result.data.id}`)
    } catch {
      toast.error('Error al crear la cotización')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  // Fetch stock data for a list of product IDs
  const fetchStockForProducts = useCallback(async (productIds: string[]) => {
    const uniqueIds = [...new Set(productIds)]
    const newStockMap: Record<string, number> = {}

    await Promise.all(
      uniqueIds.map(async (productId) => {
        try {
          const response = await stockService.getByProduct(productId)
          const stockItems = response.data as unknown as Array<{
            type: string
            id: string
            attributes: { availableQuantity?: number }
          }>
          const total = Array.isArray(stockItems)
            ? stockItems.reduce((sum, s) => sum + (s.attributes?.availableQuantity || 0), 0)
            : 0
          newStockMap[productId] = total
        } catch {
          newStockMap[productId] = 0
        }
      })
    )

    setStockMap(prev => ({ ...prev, ...newStockMap }))
  }, [])

  // Fetch stock when carts or publicCartPreview change
  useEffect(() => {
    const productIds: string[] = []

    if (publicCartPreview) {
      publicCartPreview.items.forEach(item => productIds.push(item.productId))
    }

    carts.forEach(cart => {
      cart.items.forEach(item => productIds.push(item.productId))
    })

    if (productIds.length > 0) {
      fetchStockForProducts(productIds)
    }
  }, [carts, publicCartPreview, fetchStockForProducts])

  // Stock indicator component
  const StockIndicator = ({ productId, quantity }: { productId: string; quantity: number }) => {
    const available = stockMap[productId]
    if (available === undefined) return null

    if (available === 0) {
      return (
        <span className="text-danger ms-2" title="Sin stock disponible">
          <i className="bi bi-exclamation-triangle"></i>
        </span>
      )
    }
    if (available < quantity) {
      return (
        <span className="text-warning ms-2" title={`Stock insuficiente: ${available} disponibles, se requieren ${quantity}`}>
          <i className="bi bi-exclamation-circle"></i>
        </span>
      )
    }
    return (
      <span className="text-success ms-2" title={`${available} disponibles`}>
        <i className="bi bi-check-circle"></i>
      </span>
    )
  }

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-secondary me-3"
                onClick={() => router.push('/dashboard/quotes')}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <h1 className="h3 mb-0">Nueva Cotización</h1>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-secondary me-3"
                onClick={() => router.push('/dashboard/quotes')}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <h1 className="h3 mb-0">Nueva Cotización</h1>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle display-4 text-danger mb-3 d-block"></i>
                <p className="h5 mb-3">{loadError}</p>
                <button className="btn btn-primary" onClick={loadData}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => router.push('/dashboard/quotes')}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="h3 mb-1">
                <i className="bi bi-file-text me-2"></i>
                Nueva Cotización
              </h1>
              <p className="text-muted mb-0">
                {mode === 'from-scratch'
                  ? 'Crea una cotización en blanco y agrega productos manualmente'
                  : 'Crea una cotización a partir de un carrito de compras'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${mode === 'from-scratch' ? 'active' : ''}`}
            onClick={() => setMode('from-scratch')}
          >
            <i className="bi bi-file-earmark-plus me-1"></i>
            Desde Cero
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${mode === 'from-cart' ? 'active' : ''}`}
            onClick={() => setMode('from-cart')}
          >
            <i className="bi bi-cart me-1"></i>
            Desde Carrito
          </button>
        </li>
      </ul>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Column - Selection */}
          <div className="col-lg-6">
            {/* Cart Selection - only in from-cart mode */}
            {mode === 'from-cart' && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-cart me-2"></i>
                  Carrito de Compras
                </h5>
                <small className="text-muted">
                  {publicCartPreview
                    ? 'Productos seleccionados desde la tienda'
                    : 'Selecciona el carrito con los productos a cotizar'
                  }
                </small>
              </div>
              <div className="card-body">
                {/* Show public cart preview if coming from public cart */}
                {publicCartPreview && publicCartPreview.items.length > 0 ? (
                  <div>
                    <div className="alert alert-success">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-box-seam me-2"></i>
                        <div>
                          <strong>Productos desde la tienda</strong>
                          <br />
                          <small>Se creará un carrito automáticamente con estos productos</small>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <p className="fw-bold mb-2">Productos a cotizar:</p>
                      <ul className="list-unstyled mb-2">
                        {publicCartPreview.items.map((item) => (
                          <li key={item.productId} className="d-flex justify-content-between text-muted small mb-1">
                            <span>
                              {item.name} x {item.quantity}
                              <StockIndicator productId={item.productId} quantity={item.quantity} />
                            </span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span>{formatCurrency(publicCartPreview.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                ) : carts.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-cart-x display-4 mb-3 d-block"></i>
                    <p className="mb-1">No hay carritos disponibles</p>
                    <p className="small mb-3">Crea un carrito con productos primero</p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => router.push('/tienda')}
                    >
                      <i className="bi bi-shop me-1"></i>
                      Ir a la Tienda
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label htmlFor="cart" className="form-label">Carrito *</label>
                      <select
                        id="cart"
                        className="form-select"
                        value={selectedCartId}
                        onChange={(e) => setSelectedCartId(e.target.value)}
                      >
                        <option value="">Selecciona un carrito</option>
                        {carts.map((cart) => (
                          <option key={cart.id} value={cart.id}>
                            Carrito #{cart.id} - {cart.items.length} productos - {formatCurrency(cart.totalAmount)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCart && (
                      <div className="border rounded p-3">
                        <p className="fw-bold mb-2">Productos en el carrito:</p>
                        <ul className="list-unstyled mb-2">
                          {selectedCart.items.map((item) => (
                            <li key={item.id} className="d-flex justify-content-between text-muted small mb-1">
                              <span>
                                {item.productName} x {item.quantity}
                                <StockIndicator productId={item.productId} quantity={item.quantity} />
                              </span>
                              <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total</span>
                          <span>{formatCurrency(selectedCart.totalAmount)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            )}

            {/* From-scratch info */}
            {mode === 'from-scratch' && (
              <div className="card mb-4 border-info">
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle text-info me-3 fs-4"></i>
                    <div>
                      <strong>Cotización en blanco</strong>
                      <p className="text-muted small mb-0">
                        Se creará una cotización vacía. Podrás agregar productos
                        manualmente desde la página de detalle después de crearla.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Selection */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-person me-2"></i>
                  Cliente
                </h5>
                <small className="text-muted">Selecciona el cliente para esta cotización</small>
              </div>
              <div className="card-body">
                {contacts.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-person-x display-4 mb-3 d-block"></i>
                    <p className="mb-1">No hay clientes registrados</p>
                    <p className="small mb-3">Crea un contacto de tipo cliente primero</p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => router.push('/dashboard/contacts/create')}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Crear Cliente
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label htmlFor="contact" className="form-label">Cliente *</label>
                      <select
                        id="contact"
                        className="form-select"
                        value={selectedContactId}
                        onChange={(e) => setSelectedContactId(e.target.value)}
                      >
                        <option value="">Selecciona un cliente</option>
                        {contacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.name} {contact.email && `(${contact.email})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedContact && (
                      <div className="border rounded p-3">
                        <p className="fw-bold mb-1">{selectedContact.name}</p>
                        {selectedContact.email && (
                          <p className="text-muted small mb-0">{selectedContact.email}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="col-lg-6">
            {/* Quote Details */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-calendar me-2"></i>
                  Detalles de la Cotización
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="validUntil" className="form-label">Vigencia hasta</label>
                  <input
                    type="date"
                    id="validUntil"
                    className="form-control"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <div className="form-text">
                    La cotización expira automáticamente después de esta fecha
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notas para el cliente</label>
                  <textarea
                    id="notes"
                    className="form-control"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas visibles para el cliente..."
                    rows={3}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="terms" className="form-label">Términos y Condiciones</label>
                  <textarea
                    id="terms"
                    className="form-control"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    placeholder="Términos y condiciones de la cotización..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={
                      (mode === 'from-cart' && !selectedCartId && !publicCartPreview) ||
                      !selectedContactId ||
                      mutations.createFromCart.isPending ||
                      mutations.create.isPending ||
                      isCreatingBackendCart
                    }
                  >
                    {isCreatingBackendCart ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sincronizando carrito...
                      </>
                    ) : (mutations.createFromCart.isPending || mutations.create.isPending) ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creando cotización...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-file-text me-2"></i>
                        {mode === 'from-scratch' ? 'Crear Cotización en Blanco' : 'Crear Cotización'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => router.push('/dashboard/quotes')}
                  >
                    Cancelar
                  </button>
                </div>
                <p className="text-muted text-center small mt-3 mb-0">
                  {mode === 'from-scratch'
                    ? 'La cotización se creará como borrador sin productos. Agrégalos desde el detalle.'
                    : 'La cotización se creará como borrador. Podrás editar los precios antes de enviarla al cliente.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
