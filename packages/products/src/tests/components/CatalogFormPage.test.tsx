/**
 * Formulario de catalogo (rediseno 2026-11-17): validacion en espanol, vista previa y
 * error del backend con su detalle.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const createUnit = vi.fn()
const createCategory = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('next/link', () => ({ default: ({ href, children, ...r }: { href: string; children: React.ReactNode }) => <a href={href} {...r}>{children}</a> }))
vi.mock('@lwm/ui', () => ({
  LwSurface: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LwPageTitle: ({ title, highlight }: { title: React.ReactNode; highlight?: React.ReactNode }) => <h1>{title}{highlight}</h1>,
  LwResultModal: ({ open, title }: { open: boolean; title: React.ReactNode }) => (open ? <div role="dialog">{title}</div> : null),
  LwStatusPill: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))
vi.mock('../../hooks', () => ({
  useCategory: () => ({ category: undefined, isLoading: false, error: null }),
  useBrand: () => ({ brand: undefined, isLoading: false, error: null }),
  useUnit: () => ({ unit: undefined, isLoading: false, error: null }),
  useCategoryMutations: () => ({ createCategory, updateCategory: vi.fn() }),
  useBrandMutations: () => ({ createBrand: vi.fn(), updateBrand: vi.fn() }),
  useUnitMutations: () => ({ createUnit, updateUnit: vi.fn() }),
}))

import { CatalogFormPage } from '../../components/CatalogFormPage'

describe('CatalogFormPage', () => {
  beforeEach(() => { createUnit.mockReset(); createCategory.mockReset() })

  it('unidad: pide nombre, codigo y tipo en espanol sin llamar a la API', () => {
    render(<CatalogFormPage kind="unit" />)
    fireEvent.click(screen.getByRole('button', { name: 'Crear unidad' }))
    expect(screen.getByText('El nombre de la unidad es obligatorio.')).toBeTruthy()
    expect(screen.getByText('El código de la unidad es obligatorio.')).toBeTruthy()
    expect(screen.getByText('Elige el tipo de unidad.')).toBeTruthy()
    expect(createUnit).not.toHaveBeenCalled()
  })

  it('categoria: la vista previa sigue al nombre y el slug se genera sin acentos', () => {
    render(<CatalogFormPage kind="category" />)
    fireEvent.change(screen.getByLabelText('*Nombre'), { target: { value: 'Equipo de Protección' } })
    expect(screen.getAllByText('Equipo de Protección').length).toBeGreaterThan(0)
    expect((screen.getByLabelText('Slug') as HTMLInputElement).value).toBe('equipo-de-proteccion')
  })

  it('muestra el detalle del error del backend y el modal al guardar', async () => {
    createCategory.mockRejectedValueOnce({ response: { data: { errors: [{ detail: 'Ya existe una categoría con ese nombre.' }] } } })
    render(<CatalogFormPage kind="category" />)
    fireEvent.change(screen.getByLabelText('*Nombre'), { target: { value: 'Duplicada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }))
    await waitFor(() => expect(screen.getByText('Ya existe una categoría con ese nombre.')).toBeTruthy())
    createCategory.mockResolvedValueOnce({ data: { id: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }))
    await waitFor(() => expect(screen.getByRole('dialog').textContent).toBe('Categoría registrada'))
  })
})
