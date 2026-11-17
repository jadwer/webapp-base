'use client'

/**
 * GESTION DE UNIDADES con la piel del rediseno (2026-11-17): usa CatalogAdminPage (tabla
 * o tarjetas). Las unidades no tienen estatus; la segunda linea es el codigo.
 */

import React, { useRef, useState } from 'react'
import { ConfirmModal, toast, type ConfirmModalHandle } from '@lwm/ui'
import { CatalogAdminPage, type CatalogItem } from './CatalogAdminPage'
import { useUnits, useUnitMutations, useErrorHandler } from '../hooks'
import { useUnitsUIStore, useUnitsFilters, useUnitsPage, useUnitsViewMode } from '../store/unitsUIStore'

const UNIT_TYPE_LABEL: Record<string, string> = { peso: 'Peso', longitud: 'Longitud', volumen: 'Volumen', cantidad: 'Cantidad', tiempo: 'Tiempo', area: 'Área', otro: 'Otro' }

export const UnitsAdminPagePro = React.memo(() => {
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const { handleError } = useErrorHandler()
  const filters = useUnitsFilters()
  const page = useUnitsPage()
  const viewMode = useUnitsViewMode() === 'grid' ? 'grid' : 'table'
  const { setPage, setFilters, setViewMode } = useUnitsUIStore()
  const [perPage, setPerPage] = useState(10)
  const { units, meta, isLoading, error, refresh } = useUnits({
    page: { number: page, size: perPage },
    filter: filters.search ? { name: filters.search } : {},
    sort: { field: 'name', direction: 'asc' },
  })
  const { deleteUnit } = useUnitMutations()
  const pm = (meta as { page?: { total?: number; lastPage?: number } } | undefined)?.page

  const items: CatalogItem[] = units.map((u) => ({ id: u.id, name: u.name, sub: u.code ? `Código: ${u.code}` : undefined, detail: u.unitType ? UNIT_TYPE_LABEL[u.unitType] ?? u.unitType : undefined, createdAt: u.createdAt, productsCount: u.productsCount }))

  const onDelete = async (i: CatalogItem) => {
    const ok = await confirmRef.current?.confirm(`Estás a punto de eliminar la unidad ${i.name}. No se podrá recuperar. ¿Deseas continuar?`, { title: 'Eliminar unidad', confirmText: 'Eliminar', cancelText: 'Cancelar', confirmVariant: 'danger' })
    if (!ok) return
    try { await deleteUnit(i.id); toast.success('Unidad eliminada'); refresh() } catch (err) { handleError(err, 'No se pudo eliminar la unidad') }
  }

  return (
    <>
      <CatalogAdminPage
        title="Gestión de unidades" subtitle="Administra tus unidades" noun="unidad" nounPlural="unidades"
        nameHeader="Unidad" detailHeader="Tipo" icon="bi-rulers" basePath="/dashboard/products/units"
        productsFilter={(id) => ({ unitId: id })}
        items={items} total={pm?.total} page={page} lastPage={pm?.lastPage ?? 1} perPage={perPage}
        onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(1) }}
        isLoading={isLoading} error={error} search={filters.search ?? ''}
        onSearch={(s) => setFilters({ search: s || undefined })}
        viewMode={viewMode} onViewMode={setViewMode} onRefresh={() => refresh()}
        onDelete={onDelete}
      />
      <ConfirmModal ref={confirmRef} />
    </>
  )
})

UnitsAdminPagePro.displayName = 'UnitsAdminPagePro'

export default UnitsAdminPagePro
