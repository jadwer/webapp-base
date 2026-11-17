'use client'

/**
 * GESTION DE MARCAS con la piel del rediseno (2026-11-17): usa CatalogAdminPage (tabla o
 * tarjetas). Conserva activar o desactivar la marca con sus productos y la actualizacion
 * masiva de precios (ahora con todas las marcas, antes solo las de la pagina visible).
 */

import React, { useRef, useState } from 'react'
import { ConfirmModal, toast, type ConfirmModalHandle } from '@lwm/ui'
import { CatalogAdminPage, type CatalogItem } from './CatalogAdminPage'
import { BulkPriceUpdateDialog } from './BulkPriceUpdateDialog'
import { useBrands, useBrandMutations, useErrorHandler } from '../hooks'
import { useBrandsUIStore, useBrandsFilters, useBrandsPage, useBrandsViewMode } from '../store/brandsUIStore'
import { brandService } from '../services/brandService'

export const BrandsAdminPagePro = React.memo(() => {
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const { handleError } = useErrorHandler()
  const filters = useBrandsFilters()
  const page = useBrandsPage()
  const viewMode = useBrandsViewMode() === 'grid' ? 'grid' : 'table'
  const { setPage, setFilters, setViewMode } = useBrandsUIStore()
  const [perPage, setPerPage] = useState(10)
  const [priceOpen, setPriceOpen] = useState(false)
  const { brands, meta, isLoading, error, refresh } = useBrands({
    page: { number: page, size: perPage },
    filter: filters.search ? { search: filters.search } : {},
    sort: { field: 'name', direction: 'asc' },
  })
  const all = useBrands({ page: { number: 1, size: 200 }, sort: { field: 'name', direction: 'asc' } })
  const { deleteBrand } = useBrandMutations()
  const pm = (meta as { page?: { total?: number; lastPage?: number } } | undefined)?.page

  const items: CatalogItem[] = brands.map((b) => ({ id: b.id, name: b.name, sub: b.slug, detail: b.description, createdAt: b.createdAt, productsCount: b.productsCount, isActive: b.isActive !== false }))

  const onDelete = async (i: CatalogItem) => {
    const ok = await confirmRef.current?.confirm(`Estás a punto de eliminar la marca ${i.name}. No se podrá recuperar. ¿Deseas continuar?`, { title: 'Eliminar marca', confirmText: 'Eliminar', cancelText: 'Cancelar', confirmVariant: 'danger' })
    if (!ok) return
    try { await deleteBrand(i.id); toast.success('Marca eliminada'); refresh() } catch (err) { handleError(err, 'No se pudo eliminar la marca') }
  }

  const onToggleActive = async (i: CatalogItem) => {
    const next = !i.isActive
    let includeProducts = false
    if ((i.productsCount ?? 0) > 0) {
      includeProducts = (await confirmRef.current?.confirm(
        `¿${next ? 'Activar' : 'Desactivar'} la marca ${i.name}? Tiene ${i.productsCount} producto(s). ¿También ${next ? 'activar' : 'desactivar'} sus productos?`,
        { title: next ? 'Activar marca' : 'Desactivar marca', confirmText: next ? 'Marca y productos' : 'Marca y productos', cancelText: 'Solo la marca', confirmVariant: next ? 'primary' : 'warning' },
      )) ?? false
    }
    try {
      const r = await brandService.toggleActive(i.id, next, includeProducts)
      toast.success(`Marca ${next ? 'activada' : 'desactivada'}${r.products_affected > 0 ? `; ${r.products_affected} producto(s) afectados` : ''}`)
      refresh()
    } catch (err) { handleError(err, `No se pudo ${next ? 'activar' : 'desactivar'} la marca`) }
  }

  return (
    <>
      <CatalogAdminPage
        title="Gestión de marcas" subtitle="Administra tus marcas" noun="marca" nounPlural="marcas"
        nameHeader="Marca" detailHeader="Descripción" icon="bi-award" basePath="/dashboard/products/brands"
        productsFilter={(id) => ({ brandId: id })}
        items={items} total={pm?.total} page={page} lastPage={pm?.lastPage ?? 1} perPage={perPage}
        onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }}
        isLoading={isLoading} error={error} search={filters.search ?? ''}
        onSearch={(s) => setFilters({ search: s || undefined })}
        viewMode={viewMode} onViewMode={setViewMode} onRefresh={() => refresh()}
        onDelete={onDelete} onToggleActive={onToggleActive}
        extraActions={<button type="button" className="btn btn-primary" onClick={() => setPriceOpen(true)}><i className="bi bi-currency-dollar me-1" aria-hidden="true" /> Actualizar precios</button>}
      />
      <BulkPriceUpdateDialog show={priceOpen} onHide={() => setPriceOpen(false)} brands={all.brands} onSuccess={() => { refresh(); toast.success('Precios actualizados') }} />
      <ConfirmModal ref={confirmRef} />
    </>
  )
})

BrandsAdminPagePro.displayName = 'BrandsAdminPagePro'

export default BrandsAdminPagePro
