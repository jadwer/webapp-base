import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { QuotesListPage } from '../../quotes/components/QuotesListPage'
import { useQuotes, useQuoteSummary, useExpiringSoonQuotes, useQuoteMutations } from '../../quotes/hooks'
import { createMockQuote } from '../../quotes/tests/utils/test-utils'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('../../quotes/hooks', () => ({
  useQuotes: vi.fn(),
  useQuoteSummary: vi.fn(),
  useExpiringSoonQuotes: vi.fn(),
  useQuoteMutations: vi.fn(),
}))
vi.mock('../../quotes/services', () => ({ quoteService: { downloadPdf: vi.fn().mockResolvedValue(undefined) } }))
vi.mock('../../quotes/components/QuoteSendModal', () => ({ QuoteSendModal: () => <div>modal-enviar</div> }))
vi.mock('../../quotes/components/GenerateOrderModal', () => ({ GenerateOrderModal: () => <div>modal-pedido</div> }))
vi.mock('../../quotes/components/GenerateSaleModal', () => ({ GenerateSaleModal: () => <div>modal-venta</div> }))
vi.mock('@lwm/auth', () => ({
  BranchFilter: () => null,
  useBranchName: () => ({ multi: false, name: () => '' }),
  useAuth: () => ({ user: { roles: [{ name: 'admin' }] } }),
  isAdmin: () => false,
}))
vi.mock('@lwm/products', () => ({ extractApiErrorMessage: (_e: unknown, base: string) => base }))
vi.mock('@lwm/ui', async (orig) => ({ ...(await orig<typeof import('@lwm/ui')>()), toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const accept = vi.fn().mockResolvedValue({})
const refetch = vi.fn()

function setup(quotes: ReturnType<typeof createMockQuote>[]) {
  ;(useQuotes as Mock).mockReturnValue({ data: { data: quotes, meta: { currentPage: 1, lastPage: 3, total: 25 } }, isLoading: false, mutate: refetch })
  ;(useQuoteSummary as Mock).mockReturnValue({ data: { total: 44, draft: 24, sent: 1, accepted: 3, converted: 5, totalValue: 122141.55, conversionRate: 11 }, isLoading: false })
  ;(useExpiringSoonQuotes as Mock).mockReturnValue({ data: { data: [quotes[0]] } })
  ;(useQuoteMutations as Mock).mockReturnValue({ accept: { mutateAsync: accept }, reject: { mutateAsync: vi.fn() }, cancel: { mutateAsync: vi.fn() }, duplicate: { mutateAsync: vi.fn() }, delete: { mutateAsync: vi.fn() } })
  return render(<QuotesListPage />)
}

describe('QuotesListPage (rediseño)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra los cuatro indicadores con su número y el formato de moneda de México', () => {
    setup([createMockQuote({ id: '1', status: 'draft' })])
    expect(screen.getByText('Total cotizaciones')).toBeInTheDocument()
    expect(screen.getByText('44')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument() // por atender: 24 + 1
    expect(screen.getByText('Aceptadas por convertir')).toBeInTheDocument()
    expect(screen.getByText('$122,141.55')).toBeInTheDocument()
    expect(screen.getByText(/vencen en los próximos 7 días/)).toBeInTheDocument()
  })

  it('la fila muestra vendedor, estatus y productos; el menú de un borrador ofrece aceptar y eliminar', () => {
    setup([createMockQuote({ id: '1', quoteNumber: 'COT-1', status: 'draft', itemsCount: 6, assignedUserName: 'Ana Ventas' })])
    const row = screen.getByText('COT-1').closest('tr') as HTMLElement
    expect(within(row).getByText('Ana Ventas')).toBeInTheDocument()
    expect(within(row).getByText('Borrador')).toBeInTheDocument()
    expect(within(row).getByText('6 Productos')).toBeInTheDocument()
    fireEvent.click(within(row).getByRole('button', { name: 'Más acciones' }))
    expect(screen.getByRole('menuitem', { name: /Marcar aceptada/ })).toBeEnabled()
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toBeEnabled()
    expect(screen.queryByRole('menuitem', { name: 'Generar pedido' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: /Marcar aceptada/ }))
    expect(accept).toHaveBeenCalledWith('1')
  })

  it('una aceptada ofrece generar pedido o venta (abren su modal) y no deja eliminar', () => {
    setup([createMockQuote({ id: '2', quoteNumber: 'COT-2', status: 'accepted', salesOrderId: null })])
    const row = screen.getByText('COT-2').closest('tr') as HTMLElement
    expect(within(row).getByRole('button', { name: 'No editable en este estatus' })).toBeDisabled()
    fireEvent.click(within(row).getByRole('button', { name: 'Más acciones' }))
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toBeDisabled()
    expect(screen.getByText('Solo un borrador se elimina; lo enviado se cancela.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Generar pedido' }))
    expect(screen.getByText('modal-pedido')).toBeInTheDocument()
  })

  it('una enviada deja rechazar con motivo', () => {
    setup([createMockQuote({ id: '3', quoteNumber: 'COT-3', status: 'sent' })])
    fireEvent.click(within(screen.getByText('COT-3').closest('tr') as HTMLElement).getByRole('button', { name: 'Más acciones' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rechazar' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Rechazar cotización COT-3')
  })

  it('la paginación usa la meta del backend', () => {
    setup([createMockQuote({ id: '1' })])
    expect(screen.getByText('resultados de 25')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '03' })).toBeInTheDocument()
  })
})
