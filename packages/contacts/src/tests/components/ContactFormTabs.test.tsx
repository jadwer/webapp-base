/**
 * Alta de contacto por pasos (peticion de Jasim, 2026-09-30).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../hooks', () => ({
  useContactAddresses: () => ({ addresses: [] }),
  useContactDocuments: () => ({ documents: [] }),
  useContactPeople: () => ({ people: [] }),
}))
vi.mock('../../hooks/useContactCatalogs', () => ({
  useContactCatalogs: () => ({ classifications: [], regimenesFiscales: [], usosCfdi: [] }),
}))
vi.mock('../../components/ContactCommercialFields', () => ({ ContactCommercialFields: () => null }))
vi.mock('../../components/ContactAddresses', () => ({ ContactAddresses: () => <div>direcciones</div> }))
vi.mock('../../components/ContactDocuments', () => ({ ContactDocuments: () => null }))
vi.mock('../../components/ContactPeople', () => ({ ContactPeople: () => null }))
vi.mock('@lwm/auth', () => ({ useAuth: () => ({ user: { id: '1' } }) }))

import { ContactFormTabs } from '../../components/ContactFormTabs'

const tab = (name: string) => screen.getByRole('tab', { name: new RegExp(name) }) as HTMLButtonElement

describe('ContactFormTabs por pasos', () => {
  const onSubmit = vi.fn()
  beforeEach(() => onSubmit.mockReset().mockResolvedValue({ id: '9' }))

  it('arranca con las pestanas bloqueadas hasta validar datos generales', () => {
    render(<ContactFormTabs onSubmit={onSubmit} onCancel={() => {}} />)
    expect(tab('Datos generales').disabled).toBe(false)
    expect(tab('Datos fiscales').disabled).toBe(true)
    expect(tab('Documentos').disabled).toBe(true)
    expect(screen.queryByText('Crear contacto')).toBeNull()
  })

  it('marca en rojo el correo principal con dos correos', () => {
    render(<ContactFormTabs onSubmit={onSubmit} onCancel={() => {}} />)
    fireEvent.change(screen.getByLabelText('Correo principal'), { target: { value: 'compras@lab.mx, lab@lab.mx' } })
    expect(screen.getByText(/un solo correo principal/)).toBeTruthy()
  })

  it('Siguiente no avanza con un telefono de 9 digitos', () => {
    render(<ContactFormTabs onSubmit={onSubmit} onCancel={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nombre comercial *'.replace(' *', ''), { exact: false }), { target: { value: 'Lab Canales' } })
    fireEvent.change(screen.getByLabelText('Número del teléfono 1'), { target: { value: '553344556' } })
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    expect(tab('Datos fiscales').disabled).toBe(true)
    expect(screen.getAllByText(/10 digitos/).length).toBeGreaterThan(0)
  })

  it('Siguiente desbloquea y guarda telefonos limpios y correos adicionales', async () => {
    render(<ContactFormTabs onSubmit={onSubmit} onCancel={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nombre comercial', { exact: false }), { target: { value: 'Lab Canales' } })
    fireEvent.change(screen.getByLabelText('Correo principal'), { target: { value: 'compras@lab.mx' } })
    fireEvent.change(screen.getByLabelText('Correos adicionales'), { target: { value: 'lab@lab.mx; inv@lab.mx,' } })
    fireEvent.change(screen.getByLabelText('Etiqueta del teléfono 1'), { target: { value: 'Matriz' } })
    fireEvent.change(screen.getByLabelText('Número del teléfono 1'), { target: { value: '55 1666-6344' } })
    fireEvent.change(screen.getByLabelText('Extensión del teléfono 1'), { target: { value: '2213' } })
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }))

    expect(tab('Datos fiscales').disabled).toBe(false)
    expect(tab('Datos fiscales').getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: /Crear contacto/ }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const sent = onSubmit.mock.calls[0][0]
    expect(sent.phones).toEqual([{ label: 'Matriz', code: '52', number: '5516666344', ext: '2213' }])
    expect(sent.additionalEmails).toEqual(['lab@lab.mx', 'inv@lab.mx'])
    expect(sent).not.toHaveProperty('phone')
    expect(sent).not.toHaveProperty('creditMonths')
  })
})
