'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, FileText, ShoppingCart, User, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import { useQuoteMutations } from '@/modules/quotes'
import { contactsService } from '@/modules/contacts/services'
import { shoppingCartService } from '@/modules/ecommerce'
import type { ShoppingCart } from '@/modules/ecommerce'
import { toast } from 'sonner'

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
    quantity: number
    unitPrice: number
  }>
  totalAmount: number
}

export default function CreateQuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cartIdFromUrl = searchParams.get('cart_id')
  const contactIdFromUrl = searchParams.get('contact_id')

  const mutations = useQuoteMutations()

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

  // Set default validity date (30 days from now)
  useEffect(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    setValidUntil(defaultDate.toISOString().split('T')[0])
  }, [])

  // Transform ShoppingCart to display format
  const transformCartToDisplay = (cart: ShoppingCart): CartWithItems => {
    return {
      id: String(cart.id),
      items: (cart.items || []).map((item) => ({
        id: String(item.id),
        productName: item.product?.name || item.productName || `Producto #${item.productId}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice || item.price || 0
      })),
      totalAmount: cart.totalAmount || 0
    }
  }

  // Helper to fetch all carts with their items
  const fetchAllCarts = async (): Promise<CartWithItems[]> => {
    try {
      // Get current cart
      const currentCart = await shoppingCartService.cart.getCurrent()

      if (currentCart) {
        return [transformCartToDisplay(currentCart)]
      }

      return []
    } catch (error) {
      console.error('Error fetching carts:', error)
      return []
    }
  }

  // Load contacts and carts from API
  const loadData = useCallback(async () => {
    setIsLoadingData(true)
    setLoadError(null)

    try {
      // Fetch contacts and carts in parallel
      const [contactsResponse, cartsResponse] = await Promise.all([
        contactsService.getAll({
          filters: { isCustomer: true },
          pagination: { page: 1, size: 100 }
        }),
        fetchAllCarts()
      ])

      // Transform contacts to simple format
      const transformedContacts: Contact[] = (contactsResponse.data || []).map((c) => {
        const attrs = c.attributes || c
        return {
          id: String(c.id),
          name: attrs.name || 'Sin nombre',
          email: attrs.email || undefined
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

    if (!selectedCartId || !selectedContactId) {
      toast.error('Selecciona un carrito y un cliente')
      return
    }

    try {
      const result = await mutations.createFromCart.mutateAsync({
        shopping_cart_id: parseInt(selectedCartId),
        contact_id: parseInt(selectedContactId),
        valid_until: validUntil || undefined,
        notes: notes || undefined,
        terms_and_conditions: termsAndConditions || undefined
      })

      toast.success('Cotizacion creada exitosamente')
      router.push(`/dashboard/quotes/${result.data.id}`)
    } catch (error) {
      toast.error('Error al crear la cotizacion')
      console.error(error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  if (isLoadingData) {
    return (
      <div className="container-fluid py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container-fluid py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/quotes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nueva Cotizacion</h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <p className="text-lg font-medium">{loadError}</p>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container-fluid py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/quotes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Nueva Cotizacion
          </h1>
          <p className="text-muted-foreground">
            Crea una cotizacion a partir de un carrito de compras
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Selection */}
          <div className="space-y-6">
            {/* Cart Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito de Compras
                </CardTitle>
                <CardDescription>
                  Selecciona el carrito con los productos a cotizar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {carts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>No hay carritos disponibles</p>
                    <p className="text-sm">Crea un carrito con productos primero</p>
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2"
                      onClick={() => router.push('/tienda')}
                    >
                      Ir a la Tienda
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cart">Carrito *</Label>
                      <Select value={selectedCartId} onValueChange={setSelectedCartId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un carrito" />
                        </SelectTrigger>
                        <SelectContent>
                          {carts.map((cart) => (
                            <SelectItem key={cart.id} value={cart.id}>
                              Carrito #{cart.id} - {cart.items.length} productos - {formatCurrency(cart.totalAmount)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCart && (
                      <div className="border rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium">Productos en el carrito:</p>
                        <ul className="text-sm space-y-1">
                          {selectedCart.items.map((item) => (
                            <li key={item.id} className="flex justify-between text-muted-foreground">
                              <span>{item.productName} x {item.quantity}</span>
                              <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(selectedCart.totalAmount)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
                <CardDescription>
                  Selecciona el cliente para esta cotizacion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>No hay clientes registrados</p>
                    <p className="text-sm">Crea un contacto de tipo cliente primero</p>
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2"
                      onClick={() => router.push('/dashboard/contacts/create')}
                    >
                      Crear Cliente
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Cliente *</Label>
                      <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} {contact.email && `(${contact.email})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedContact && (
                      <div className="border rounded-lg p-4">
                        <p className="font-medium">{selectedContact.name}</p>
                        {selectedContact.email && (
                          <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Quote Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles de la Cotizacion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Vigencia hasta</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    La cotizacion expira automaticamente despues de esta fecha
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas para el cliente</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas visibles para el cliente..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Terminos y Condiciones</Label>
                  <Textarea
                    id="terms"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    placeholder="Terminos y condiciones de la cotizacion..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/dashboard/quotes')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!selectedCartId || !selectedContactId || mutations.createFromCart.isPending}
                  >
                    {mutations.createFromCart.isPending ? 'Creando...' : 'Crear Cotizacion'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  La cotizacion se creara como borrador. Podras editar los precios antes de enviarla al cliente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
