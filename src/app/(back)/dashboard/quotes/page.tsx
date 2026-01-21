'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, Search, FileText, AlertTriangle } from 'lucide-react'
import {
  useQuotes,
  useQuoteSummary,
  useExpiringSoonQuotes,
  QuotesTable,
  QuoteSummaryCards,
  type QuoteStatus,
  type QuoteFilters
} from '@/modules/quotes'

export default function QuotesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<QuoteFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: quotesResponse, isLoading: quotesLoading, mutate: refetch } = useQuotes(filters)
  const { data: summary, isLoading: summaryLoading } = useQuoteSummary()
  const { data: expiringSoonResponse } = useExpiringSoonQuotes(7)

  const quotes = quotesResponse?.data ?? []
  const expiringSoon = expiringSoonResponse?.data ?? []

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ ...filters, status: undefined })
    } else {
      setFilters({ ...filters, status: status as QuoteStatus })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchTerm || undefined })
  }

  return (
    <div className="container-fluid py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Cotizaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona cotizaciones, modifica precios y convierte a ordenes de venta
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/quotes/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cotizacion
        </Button>
      </div>

      {/* Summary Cards */}
      <QuoteSummaryCards summary={summary} isLoading={summaryLoading} />

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              Cotizaciones por vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Tienes {expiringSoon.length} cotizacion(es) que vencen en los proximos 7 dias.
              {' '}
              <button
                onClick={() => setFilters({ ...filters, expiringWithinDays: 7 })}
                className="underline font-medium"
              >
                Ver todas
              </button>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por numero, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select
                value={filters.status as string ?? 'all'}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="accepted">Aceptada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                  <SelectItem value="converted">Convertida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {(filters.search || filters.status || filters.expiringWithinDays) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilters({})
                  setSearchTerm('')
                }}
              >
                Limpiar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Cotizaciones</span>
            {quotes.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {quotes.length} cotizacion(es)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuotesTable
            quotes={quotes}
            isLoading={quotesLoading}
            onQuoteUpdated={() => refetch()}
          />
        </CardContent>
      </Card>
    </div>
  )
}
