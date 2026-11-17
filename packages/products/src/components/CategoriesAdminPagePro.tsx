'use client'

/**
 * GESTION DE CATEGORIAS con la piel del rediseno (2026-11-17): usa CatalogAdminPage (tabla o
 * tarjetas). Conserva activar o desactivar la categoria con sus productos.
 */

import React, { useRef, useState } from 'react'
import { ConfirmModal, toast, type ConfirmModalHandle } from '@lwm/ui'
import { CatalogAdminPage, type CatalogItem } from './CatalogAdminPage'
import { useCategories, useCategoryMutations, useErrorHandler } from '../hooks'
import { useCategoriesUIStore, useCategoriesFilters, useCategoriesPage, useCategoriesViewMode } from '../store/categoriesUIStore'
import { categoryService } from '../services/categoryService'

export const CategoriesAdminPagePro = React.memo(() => {
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const { handleError } = useErrorHandler()
  const filters = useCategoriesFilters()
  const page = useCategoriesPage()
  const viewMode = useCategoriesViewMode() === 'grid' ? 'grid' : 'table'
  const { setPage, setFilters, setViewMode } = useCategoriesUIStore()
  const [perPage, setPerPage] = useState(10)
  const { categories, meta, isLoading, error, refresh } = useCategories({
    page: { number: page, size: perPage },
    filter: filters.search ? { name: filters.search } : {},
    sort: { field: 'name', direction: 'asc' },
  })
  const { deleteCategory } = useCategoryMutations()
  const pm = (meta as { page?: { total?: number; lastPage?: number } } | undefined)?.page

  const items: CatalogItem[] = categories.map((b) => ({ id: b.id, name: b.name, sub: b.slug, detail: b.description, createdAt: b.createdAt, productsCount: b.productsCount, isActive: b.isActive !== false }))

  const onDelete = async (i: CatalogItem) => {
    const ok = await confirmRef.current?.confirm(`Estás a punto de eliminar la categoría ${i.name}. No se podrá recuperar. ¿Deseas continuar?`, { title: 'Eliminar categoría', confirmText: 'Eliminar', cancelText: 'Cancelar', confirmVariant: 'danger' })
    if (!ok) return
    try { await deleteCategory(i.id); toast.success('Categoría eliminada'); refresh() } catch (err) { handleError(err, 'No se pudo eliminar la categoría') }
  }

  const onToggleActive = async (i: CatalogItem) => {
    const next = !i.isActive
    let includeProducts = false
    if ((i.productsCount ?? 0) > 0) {
      includeProducts = (await confirmRef.current?.confirm(
        `¿${next ? 'Activar' : 'Desactivar'} la categoría ${i.name}? Tiene ${i.productsCount} producto(s). ¿También ${next ? 'activar' : 'desactivar'} sus productos?`,
        { title: next ? 'Activar categoría' : 'Desactivar categoría', confirmText: next ? 'Categoría y productos' : 'Categoría y productos', cancelText: 'Solo la categoría', confirmVariant: next ? 'primary' : 'warning' },
      )) ?? false
    }
    try {
      const r = await categoryService.toggleActive(i.id, next, includeProducts)
      toast.success(`Categoría ${next ? 'activada' : 'desactivada'}${r.products_affected > 0 ? `; ${r.products_affected} producto(s) afectados` : ''}`)
      refresh()
    } catch (err) { handleError(err, `No se pudo ${next ? 'activar' : 'desactivar'} la categoría`) }
  }

  return (
    <>
      <CatalogAdminPage
        title="Gestión de categorías" subtitle="Administra las categorías" noun="categoría" nounPlural="categorías"
        nameHeader="Categoría" detailHeader="Descripción" icon="bi-tag" basePath="/dashboard/products/categories"
        productsFilter={(id) => ({ categoryId: id })}
        items={items} total={pm?.total} page={page} lastPage={pm?.lastPage ?? 1} perPage={perPage}
        onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }}
        isLoading={isLoading} error={error} search={filters.search ?? ''}
        onSearch={(s) => setFilters({ search: s || undefined })}
        viewMode={viewMode} onViewMode={setViewMode} onRefresh={() => refresh()}
        onDelete={onDelete} onToggleActive={onToggleActive}
      />
      <ConfirmModal ref={confirmRef} />
    </>
  )
})

CategoriesAdminPagePro.displayName = 'CategoriesAdminPagePro'

export default CategoriesAdminPagePro
