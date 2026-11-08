import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { axiosClient } from '@lwm/auth'
import { toast } from '@lwm/ui'
import { GuidePanel } from '../components/GuidePanel'
import type { GuideAction, GuideData, GuideTrailEntry } from '../types'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}))
vi.mock('@lwm/auth', () => ({
  axiosClient: { get: vi.fn(), request: vi.fn() },
}))
vi.mock('@lwm/ui', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  formatDateTime: (iso: string) => `fecha(${iso})`,
}))

function action(overrides: Partial<GuideAction> = {}): GuideAction {
  return {
    key: 'sales::guide.order.confirm',
    phrase: 'Confirma el pedido OV-1',
    department: 'ventas',
    kind: 'primary',
    allowed: true,
    requiresReason: false,
    asks: [],
    blockers: [],
    action: { method: 'POST', path: '/api/v1/orders/7/status', body: { status: 'confirmed' } },
    ...overrides,
  }
}

function entry(overrides: Partial<GuideTrailEntry> = {}): GuideTrailEntry {
  return { type: 'sales-orders', id: '7', label: 'OV-1', status: 'pending', department: 'ventas', next: [], current: true, history: [], ...overrides }
}

function guide(next: GuideAction[], trail: GuideTrailEntry[] = []): GuideData {
  return { type: 'sales-orders', id: '7', label: 'OV-1', status: 'pending', department: 'ventas', next, trail }
}

function renderPanel(data: GuideData, props: Partial<React.ComponentProps<typeof GuidePanel>> = {}) {
  ;(axiosClient.get as Mock).mockResolvedValue({ data: { version: 1, data } })
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <GuidePanel type="sales-orders" id={7} {...props} />
    </SWRConfig>
  )
}

describe('GuidePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra la frase del backend, el departamento y el boton cuando se puede', async () => {
    renderPanel(guide([action()]))

    expect(await screen.findByText('Confirma el pedido OV-1')).toBeInTheDocument()
    expect(screen.getByText('Ventas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hacer este paso/ })).toBeInTheDocument()
    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/guide/sales-orders/7')
  })

  it('con bloqueos lista lo que falta y sin permiso dice quien lo hace', async () => {
    renderPanel(
      guide([
        action({ blockers: [{ field: 'status', message: 'El pedido debe estar confirmado.' }] }),
        action({ key: 'sales::guide.order.remit', phrase: 'Genera la remisión del pedido OV-1', department: 'almacen', allowed: false }),
      ])
    )

    expect(await screen.findByText('El pedido debe estar confirmado.')).toBeInTheDocument()
    expect(screen.getByText('Lo hace Almacén.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Hacer este paso/ })).not.toBeInTheDocument()
  })

  it('una accion con asks se entrega a la pagina y nunca se ejecuta desde la barra', async () => {
    const onAction = vi.fn()
    renderPanel(guide([action({ key: 'sales::guide.quote.convert', asks: ['order_type'] })]), { onAction })

    fireEvent.click(await screen.findByRole('button', { name: /Hacer este paso/ }))

    expect(onAction).toHaveBeenCalledTimes(1)
    expect(toast.info).toHaveBeenCalledWith('Este paso pide datos: hazlo desde las acciones del documento.')
    expect(axiosClient.request).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('si la pagina toma la accion (true) la barra no abre nada', async () => {
    renderPanel(guide([action()]), { onAction: () => true })

    fireEvent.click(await screen.findByRole('button', { name: /Hacer este paso/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(axiosClient.request).not.toHaveBeenCalled()
  })

  it('una accion sin asks se confirma y se ejecuta tal como la describe la API', async () => {
    const onDone = vi.fn()
    ;(axiosClient.request as Mock).mockResolvedValue({ data: {} })
    renderPanel(guide([action()]), { onDone })

    fireEvent.click(await screen.findByRole('button', { name: /Hacer este paso/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hacerlo' }))

    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(axiosClient.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/orders/7/status',
      data: { status: 'confirmed' },
      headers: undefined,
    })
    expect(toast.success).toHaveBeenCalledWith('Listo')
    expect(axiosClient.get).toHaveBeenCalledTimes(2)
  })

  it('cancelar pide motivo obligatorio y lo manda en el cuerpo y en la cabecera', async () => {
    ;(axiosClient.request as Mock).mockResolvedValue({ data: {} })
    const cancel = action({
      key: 'sales::guide.order.cancel',
      phrase: 'Cancela el pedido OV-1',
      kind: 'secondary',
      requiresReason: true,
      action: { method: 'POST', path: '/api/v1/sales-orders/7/cancel', body: null },
    })
    renderPanel(guide([action(), cancel]))

    fireEvent.click(await screen.findByRole('button', { name: 'Más acciones' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cancela el pedido OV-1' }))

    const confirmButton = screen.getByRole('button', { name: 'Hacerlo' })
    expect(confirmButton).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Cliente desistió' } })
    expect(confirmButton).toBeEnabled()
    fireEvent.click(confirmButton)

    await waitFor(() => expect(axiosClient.request).toHaveBeenCalled())
    expect(axiosClient.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/sales-orders/7/cancel',
      data: { reason: 'Cliente desistió' },
      headers: { 'X-Change-Reason': encodeURIComponent('Cliente desistió') },
    })
  })

  it('un rechazo de la API se muestra con su detalle (regla 7)', async () => {
    ;(axiosClient.request as Mock).mockRejectedValue({ response: { data: { error: 'La orden ya está cancelada' } } })
    renderPanel(guide([action()]))

    fireEvent.click(await screen.findByRole('button', { name: /Hacer este paso/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Hacerlo' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('La orden ya está cancelada'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('el expediente liga los demas documentos y marca el actual sin liga', async () => {
    const trail = [
      entry({ type: 'quotes', id: '3', label: 'COT-3', status: 'converted', department: 'system', current: false, history: [{ from: 'accepted', to: 'converted', at: '2026-11-08T10:00:00Z', by: 'Ana', reason: null }] }),
      entry({ current: true }),
      entry({ type: 'remissions', id: '9', label: 'REM-9', status: 'printed', department: 'almacen', current: false, next: [action({ key: 'sales::guide.remission.deliver', phrase: 'Marca la remisión REM-9 como entregada' })] }),
    ]
    renderPanel(guide([action()], trail))

    expect(await screen.findByText('Expediente (3)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cotización COT-3' })).toHaveAttribute('href', '/dashboard/quotes/3')
    expect(screen.getByRole('link', { name: 'Remisión REM-9' })).toHaveAttribute('href', '/dashboard/remissions')
    expect(screen.queryByRole('link', { name: 'Pedido OV-1' })).not.toBeInTheDocument()
    expect(screen.getByText('Convertida')).toBeInTheDocument()
    expect(screen.getByText('Impresa')).toBeInTheDocument()
    expect(screen.getByText('Marca la remisión REM-9 como entregada')).toBeInTheDocument()
    expect(screen.getByText('fecha(2026-11-08T10:00:00Z), Ana')).toBeInTheDocument()
  })

  it('sin guia (404 o error) no pinta nada', async () => {
    ;(axiosClient.get as Mock).mockRejectedValue({ response: { status: 404 } })
    const { container } = render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <GuidePanel type="quotes" id={1} />
      </SWRConfig>
    )
    await waitFor(() => expect(axiosClient.get).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
