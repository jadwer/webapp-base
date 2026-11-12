import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LwActionMenu, LwPagination, LwResultModal, LwKpiCard, LwStatusPill, LwPageTitle } from '../../components/redesign'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}))

describe('Piel del rediseño', () => {
  it('el menú abre, ejecuta la acción y se cierra; las deshabilitadas explican por qué', () => {
    const onSend = vi.fn()
    render(
      <LwActionMenu
        items={[
          { key: 'send', label: 'Enviar al cliente', onSelect: onSend },
          { key: 'delete', label: 'Eliminar', danger: true, disabled: true, hint: 'Solo en borrador', divider: true },
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Más acciones' }))
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toBeDisabled()
    expect(screen.getByText('Solo en borrador')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Enviar al cliente' }))
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('sin elementos el menú no se pinta', () => {
    const { container } = render(<LwActionMenu items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('la paginación numera con dos dígitos, recorta con puntos y cambia el tamaño', () => {
    const onPage = vi.fn()
    const onPerPage = vi.fn()
    render(<LwPagination page={5} lastPage={10} perPage={10} total={95} onPage={onPage} onPerPage={onPerPage} />)
    expect(screen.getByRole('button', { name: '05' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByText('...')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    expect(onPage).toHaveBeenCalledWith(6)
    fireEvent.change(screen.getByLabelText('Resultados por página'), { target: { value: '50' } })
    expect(onPerPage).toHaveBeenCalledWith(50)
    expect(screen.getByText('resultados de 95')).toBeInTheDocument()
  })

  it('el modal de resultado confirma y, con cancelar, también cierra', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<LwResultModal open tone="danger" title="Eliminar cotización" message="No se podrá recuperar." confirmLabel="Eliminar" cancelLabel="Cancelar" onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByRole('dialog')).toHaveTextContent('Eliminar cotización')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('tarjeta, pastilla y título muestran su contenido', () => {
    render(
      <>
        <LwPageTitle title="Editar cotización:" highlight="COT-26000044" subtitle="Cambia cliente, vigencia o partidas" />
        <LwKpiCard label="Por atender" value={24} icon="bi-pencil-square" isLoading={false} />
        <LwKpiCard label="Cargando" value={3} isLoading />
        <LwStatusPill tone="success">Enviada</LwStatusPill>
      </>
    )
    expect(screen.getByRole('heading')).toHaveTextContent('Editar cotización: COT-26000044')
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('--')).toBeInTheDocument()
    expect(screen.getByText('Enviada')).toBeInTheDocument()
  })
})
