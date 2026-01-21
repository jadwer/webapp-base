'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Send,
  Check,
  X,
  FileText,
  RefreshCw,
  Copy,
  Printer,
  Mail,
  Calendar,
  User,
  Clock,
  DollarSign,
  Package,
  Edit
} from 'lucide-react'
import {
  useQuote,
  useQuoteItems,
  useQuoteMutations,
  QuoteStatusBadge,
  QuoteItemsTable,
  QUOTE_STATUS_CONFIG,
  canEditQuote
} from '@/modules/quotes'
import { toast } from '@/lib/toast'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function QuoteDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const mutations = useQuoteMutations()

  const { data: quote, isLoading: quoteLoading, error: quoteError, mutate: refetch } = useQuote(id)
  const { data: items = [], mutate: refetchItems } = useQuoteItems(id)

  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingEta, setEditingEta] = useState('')
  const [editingNotes, setEditingNotes] = useState('')

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleAction = async (action: 'send' | 'accept' | 'cancel' | 'duplicate') => {
    if (!quote) return

    try {
      switch (action) {
        case 'send':
          await mutations.send.mutateAsync(quote.id)
          toast.success('Cotizacion enviada al cliente')
          break
        case 'accept':
          await mutations.accept.mutateAsync(quote.id)
          toast.success('Cotizacion marcada como aceptada')
          break
        case 'cancel':
          await mutations.cancel.mutateAsync(quote.id)
          toast.success('Cotizacion cancelada')
          break
        case 'duplicate':
          const result = await mutations.duplicate.mutateAsync(quote.id)
          toast.success('Cotizacion duplicada')
          router.push(`/dashboard/quotes/${result.data.id}`)
          return
      }
      refetch()
    } catch (error) {
      toast.error('Error al ejecutar la accion')
      console.error(error)
    }
  }

  const handleConvert = async () => {
    if (!quote) return

    try {
      const result = await mutations.convert.mutateAsync({ id: quote.id })
      toast.success(`Orden de venta ${result.data.salesOrder.attributes.orderNumber} creada`)
      setShowConvertDialog(false)
      refetch()
    } catch (error) {
      toast.error('Error al convertir la cotizacion')
      console.error(error)
    }
  }

  const handleReject = async () => {
    if (!quote) return

    try {
      await mutations.reject.mutateAsync({
        id: quote.id,
        data: rejectReason ? { reason: rejectReason } : undefined
      })
      toast.success('Cotizacion marcada como rechazada')
      setShowRejectDialog(false)
      setRejectReason('')
      refetch()
    } catch (error) {
      toast.error('Error al rechazar la cotizacion')
      console.error(error)
    }
  }

  const handleStartEdit = () => {
    if (!quote) return
    setEditingEta(quote.estimatedEta ?? '')
    setEditingNotes(quote.notes ?? '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!quote) return

    try {
      await mutations.update.mutateAsync({
        id: quote.id,
        data: {
          estimatedEta: editingEta || undefined,
          notes: editingNotes || undefined
        }
      })
      toast.success('Cotizacion actualizada')
      setIsEditing(false)
      refetch()
    } catch (error) {
      toast.error('Error al actualizar la cotizacion')
      console.error(error)
    }
  }

  if (quoteLoading) {
    return (
      <div className="container-fluid py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (quoteError || !quote) {
    return (
      <div className="container-fluid py-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Cotizacion no encontrada</h3>
              <p className="text-muted-foreground">
                La cotizacion que buscas no existe o fue eliminada.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/dashboard/quotes')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a cotizaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = QUOTE_STATUS_CONFIG[quote.status]
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()

  return (
    <div className="container-fluid py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/quotes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{quote.quoteNumber}</h1>
              <QuoteStatusBadge status={quote.status} />
            </div>
            <p className="text-muted-foreground">
              Creada el {formatDate(quote.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusConfig.canSend && quote.itemsCount > 0 && (
            <Button onClick={() => handleAction('send')} disabled={mutations.send.isPending}>
              <Send className="mr-2 h-4 w-4" />
              Enviar al cliente
            </Button>
          )}
          {statusConfig.canAccept && (
            <Button
              variant="outline"
              className="text-green-600 border-green-600"
              onClick={() => handleAction('accept')}
              disabled={mutations.accept.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Aceptar
            </Button>
          )}
          {statusConfig.canReject && (
            <Button
              variant="outline"
              className="text-red-600 border-red-600"
              onClick={() => setShowRejectDialog(true)}
            >
              <X className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          )}
          {statusConfig.canConvert && (
            <Button onClick={() => setShowConvertDialog(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Convertir a Orden
            </Button>
          )}
          <Button variant="outline" onClick={() => handleAction('duplicate')}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </Button>
          {statusConfig.canCancel && (
            <Button
              variant="outline"
              className="text-orange-600 border-orange-600"
              onClick={() => handleAction('cancel')}
              disabled={mutations.cancel.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Quote Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informacion de la Cotizacion
              </CardTitle>
              {canEditQuote(quote) && !isEditing && (
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cliente</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.contact?.name || `Contact #${quote.contactId}`}
                    </p>
                    {quote.contact?.email && (
                      <p className="text-sm text-muted-foreground">{quote.contact.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fecha de Cotizacion</p>
                    <p className="text-sm text-muted-foreground">{formatDate(quote.quoteDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Vigencia</p>
                    <p className={`text-sm ${isExpired && quote.status === 'sent' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {formatDate(quote.validUntil)}
                      {isExpired && quote.status === 'sent' && ' (Vencida)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tiempo de Entrega (ETA)</p>
                    {isEditing ? (
                      <Input
                        value={editingEta}
                        onChange={(e) => setEditingEta(e.target.value)}
                        placeholder="Ej: 2-3 semanas"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {quote.estimatedEta || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(quote.notes || isEditing) && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Notas</Label>
                    {isEditing ? (
                      <Textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Notas para el cliente..."
                        className="mt-2"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{quote.notes}</p>
                    )}
                  </div>
                </>
              )}

              {isEditing && (
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={mutations.update.isPending}>
                    Guardar cambios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteItemsTable
                items={items}
                quoteId={id}
                currency={quote.currency}
                editable={canEditQuote(quote)}
                onItemsChanged={() => {
                  refetchItems()
                  refetch()
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotalAmount, quote.currency)}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-{formatCurrency(quote.discountAmount, quote.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>IVA</span>
                <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(quote.totalAmount, quote.currency)}</span>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {quote.itemsCount} producto(s), {quote.totalQuantity} unidades
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creada</span>
                  <span>{formatDate(quote.createdAt)}</span>
                </div>
                {quote.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enviada</span>
                    <span>{formatDate(quote.sentAt)}</span>
                  </div>
                )}
                {quote.acceptedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aceptada</span>
                    <span>{formatDate(quote.acceptedAt)}</span>
                  </div>
                )}
                {quote.rejectedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rechazada</span>
                    <span>{formatDate(quote.rejectedAt)}</span>
                  </div>
                )}
                {quote.convertedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Convertida</span>
                    <span>{formatDate(quote.convertedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Converted Order Reference */}
          {quote.salesOrderId && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                  Orden de Venta Generada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/sales/${quote.salesOrderId}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Orden #{quote.salesOrder?.orderNumber || quote.salesOrderId}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAction('send')}
                disabled={mutations.send.isPending || !['draft', 'sent'].includes(quote.status)}
              >
                <Mail className="mr-2 h-4 w-4" />
                {mutations.send.isPending ? 'Enviando...' : 'Enviar por correo'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert Dialog */}
      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir a Orden de Venta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion creara una nueva orden de venta con los productos y precios de esta cotizacion.
              La cotizacion quedara marcada como &quot;Convertida&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvert} disabled={mutations.convert.isPending}>
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Cotizacion</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar esta cotizacion como rechazada. Opcionalmente puedes agregar una razon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Razon del rechazo (opcional)</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Cliente encontro mejor precio..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={mutations.reject.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
