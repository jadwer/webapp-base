'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Percent
} from 'lucide-react'
import type { QuoteSummary } from '../types'

interface QuoteSummaryCardsProps {
  summary?: QuoteSummary
  isLoading?: boolean
}

export function QuoteSummaryCards({ summary, isLoading }: QuoteSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) return null

  const cards = [
    {
      title: 'Total Cotizaciones',
      value: summary.total,
      subtitle: `${summary.draft} borradores, ${summary.sent} enviadas`,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Pendientes',
      value: summary.draft + summary.sent,
      subtitle: `${summary.sent} esperando respuesta`,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Aceptadas',
      value: summary.accepted + summary.converted,
      subtitle: `${summary.converted} convertidas a orden`,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Tasa de Conversion',
      value: `${summary.conversionRate}%`,
      subtitle: `${summary.rejected} rechazadas`,
      icon: Percent,
      color: 'text-purple-600'
    }
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Activo</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Cotizaciones activas (borrador, enviadas, aceptadas)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageValue || 0)}</div>
            <p className="text-xs text-muted-foreground">Por cotizacion activa</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
