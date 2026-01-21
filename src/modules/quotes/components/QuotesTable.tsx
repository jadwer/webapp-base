'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  MoreHorizontal,
  Eye,
  Send,
  Check,
  X,
  RefreshCw,
  Copy,
  Trash2,
  FileText
} from 'lucide-react'
import { QuoteStatusBadge } from './QuoteStatusBadge'
import type { Quote } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'
import { useQuoteMutations } from '../hooks'
import { toast } from '@/lib/toast'

interface QuotesTableProps {
  quotes: Quote[]
  isLoading?: boolean
  onQuoteUpdated?: () => void
}

export function QuotesTable({ quotes, isLoading, onQuoteUpdated }: QuotesTableProps) {
  const router = useRouter()
  const mutations = useQuoteMutations()
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAction = async (
    action: 'send' | 'accept' | 'reject' | 'convert' | 'cancel' | 'duplicate',
    quote: Quote
  ) => {
    setActionLoading(quote.id)

    try {
      switch (action) {
        case 'send':
          await mutations.send.mutateAsync(quote.id)
          toast.success('Cotizacion enviada')
          break
        case 'accept':
          await mutations.accept.mutateAsync(quote.id)
          toast.success('Cotizacion aceptada')
          break
        case 'reject':
          await mutations.reject.mutateAsync({ id: quote.id })
          toast.success('Cotizacion rechazada')
          break
        case 'convert':
          const result = await mutations.convert.mutateAsync({ id: quote.id })
          toast.success(`Orden de venta ${result.data.salesOrder.attributes.orderNumber} creada`)
          break
        case 'cancel':
          await mutations.cancel.mutateAsync(quote.id)
          toast.success('Cotizacion cancelada')
          break
        case 'duplicate':
          await mutations.duplicate.mutateAsync(quote.id)
          toast.success('Cotizacion duplicada')
          break
      }
      onQuoteUpdated?.()
    } catch (error) {
      toast.error('Error al ejecutar la accion')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteQuoteId) return

    try {
      await mutations.delete.mutateAsync(deleteQuoteId)
      toast.success('Cotizacion eliminada')
      onQuoteUpdated?.()
    } catch (error) {
      toast.error('Error al eliminar la cotizacion')
      console.error(error)
    } finally {
      setDeleteQuoteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay cotizaciones para mostrar
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Cotizacion</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            const statusConfig = QUOTE_STATUS_CONFIG[quote.status]
            const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()

            return (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                <TableCell>{quote.contact?.name || `Contact #${quote.contactId}`}</TableCell>
                <TableCell>{formatDate(quote.quoteDate)}</TableCell>
                <TableCell>
                  <span className={isExpired && quote.status === 'sent' ? 'text-red-600' : ''}>
                    {formatDate(quote.validUntil)}
                  </span>
                </TableCell>
                <TableCell>{quote.itemsCount ?? 0}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(quote.totalAmount, quote.currency)}
                </TableCell>
                <TableCell>
                  <QuoteStatusBadge status={quote.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === quote.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalle
                      </DropdownMenuItem>

                      {statusConfig.canSend && quote.itemsCount > 0 && (
                        <DropdownMenuItem onClick={() => handleAction('send', quote)}>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar al cliente
                        </DropdownMenuItem>
                      )}

                      {statusConfig.canAccept && (
                        <DropdownMenuItem onClick={() => handleAction('accept', quote)}>
                          <Check className="mr-2 h-4 w-4" />
                          Marcar aceptada
                        </DropdownMenuItem>
                      )}

                      {statusConfig.canReject && (
                        <DropdownMenuItem onClick={() => handleAction('reject', quote)}>
                          <X className="mr-2 h-4 w-4" />
                          Marcar rechazada
                        </DropdownMenuItem>
                      )}

                      {statusConfig.canConvert && (
                        <DropdownMenuItem onClick={() => handleAction('convert', quote)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Convertir a orden
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => handleAction('duplicate', quote)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>

                      {statusConfig.canCancel && (
                        <DropdownMenuItem onClick={() => handleAction('cancel', quote)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      )}

                      {quote.status === 'draft' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteQuoteId(quote.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteQuoteId} onOpenChange={() => setDeleteQuoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cotizacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente esta cotizacion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
