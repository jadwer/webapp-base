'use client'

/**
 * GESTION DE USUARIOS con la piel del rediseno (Figma "Diseno final - Usuarios", 2026-11-18).
 * Busqueda, rol y estatus como en el diseno; conserva lo que el diseno no dibuja: sucursal
 * (multi sucursal) y "Mostrar eliminados" con Restaurar. Filtros y paginado en el servidor.
 */

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUsers, useUserMutations } from '../hooks/useUsers'
import { useRoleOptions } from '../hooks/useRoleOptions'
import { UsersTable } from './UsersTable'
import { BranchFilter } from '@lwm/auth'
import { roleLabel } from '../../utils/roleLabels'
import type { User, UserStatus } from '../types/user'
import {
  LwSurface,
  LwPageTitle,
  LwPagination,
  ToggleSwitch,
  toast,
  ConfirmModal,
  getApiErrorMessage,
  type ConfirmModalHandle,
} from '@lwm/ui'

// Opciones del selector "por pagina" (peticion Gabino 2026-09-10).
export const PAGE_SIZE_OPTIONS = [5, 10, 50, 100]

export const UsersAdminPage = () => {
  const router = useRouter()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { removeUser, restoreUser } = useUserMutations()
  const { roles } = useRoleOptions()

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [showTrashed, setShowTrashed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Debounce 300 ms: la busqueda viaja al backend via filter[search].
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { users, meta, isLoading, error } = useUsers(
    {
      search: searchTerm || undefined,
      role: roleFilter || undefined,
      status: (statusFilter as UserStatus) || undefined,
      branchId: branchFilter || undefined,
      trashed: showTrashed ? 'with' : undefined,
    },
    currentPage,
    pageSize
  )

  const pageInfo = meta?.page
  const hasFilters = Boolean(searchTerm || roleFilter || statusFilter || branchFilter || showTrashed)
  const clear = () => {
    setSearchInput(''); setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); setBranchFilter(''); setShowTrashed(false); setCurrentPage(1)
  }

  const handleDelete = async (user: User) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar al usuario "${user.name}"? Podrás restaurarlo después desde "Mostrar eliminados".`,
      { title: 'Eliminar usuario', confirmText: 'Eliminar', confirmVariant: 'danger' }
    )
    if (!confirmed) return
    try {
      await removeUser(user.id)
      toast.success(`Usuario "${user.name}" eliminado.`)
    } catch (err: unknown) {
      toast.error(`No se pudo eliminar el usuario: ${getApiErrorMessage(err, 'intenta de nuevo')}`)
    }
  }

  const handleRestore = async (user: User) => {
    try {
      await restoreUser(user.id)
      toast.success(`Usuario "${user.name}" restaurado.`)
    } catch (err: unknown) {
      toast.error(`No se pudo restaurar el usuario: ${getApiErrorMessage(err, 'intenta de nuevo')}`)
    }
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Gestión de usuarios"
          subtitle="Administración de cuentas, roles y accesos al sistema"
          actions={
            <Link href="/dashboard/users/create" className="btn btn-primary">
              <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nuevo usuario
            </Link>
          }
        />

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Buscar usuario..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Buscar usuarios"
              />
            </div>
          </div>
          <div className="col-md-auto">
            <select className="form-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }} aria-label="Filtrar por rol">
              <option value="">Todos los roles</option>
              {roles.map((role) => <option key={role.id} value={role.name}>{roleLabel(role.name)}</option>)}
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} aria-label="Filtrar por estatus">
              <option value="">Todos los estatus</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="banned">Bloqueado</option>
            </select>
          </div>
          <div className="col-md-auto">
            <BranchFilter className="form-select" value={branchFilter} onChange={(id) => { setBranchFilter(id); setCurrentPage(1) }} />
          </div>
          <div className="col-md-auto">
            <ToggleSwitch checked={showTrashed} onChange={(v) => { setShowTrashed(v); setCurrentPage(1) }} label="Mostrar eliminados" size="small" />
          </div>
          <div className="col d-flex justify-content-end">
            {hasFilters ? <button type="button" className="btn btn-link btn-sm" onClick={clear}>Limpiar filtros</button> : null}
          </div>
        </div>

        {error ? <div className="alert alert-danger" role="alert">No se pudieron cargar los usuarios. Intenta de nuevo.</div> : null}

        <UsersTable
          users={users}
          isLoading={isLoading}
          offset={(currentPage - 1) * pageSize}
          emptyText={hasFilters ? 'No se encontraron usuarios con esos filtros' : 'Todavía no hay usuarios'}
          onView={(user) => router.push(`/dashboard/users/${user.id}`)}
          onEdit={(user) => router.push(`/dashboard/users/${user.id}/edit`)}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />

        <LwPagination
          page={pageInfo?.currentPage || currentPage}
          lastPage={pageInfo?.lastPage || 1}
          perPage={pageInfo?.perPage || pageSize}
          total={pageInfo?.total}
          perPageOptions={PAGE_SIZE_OPTIONS}
          onPage={setCurrentPage}
          onPerPage={(n) => { setPageSize(n); setCurrentPage(1) }}
        />
      </LwSurface>
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
