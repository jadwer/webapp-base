'use client'

/**
 * Pagina de administracion de usuarios (v2, patron contacts).
 * Filtros server-side (busqueda con debounce, rol, estado, eliminados),
 * paginacion server-side y acciones con confirmacion.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useUsers, useUserMutations } from '../hooks/useUsers'
import { useRoleOptions } from '../hooks/useRoleOptions'
import { UsersTable } from './UsersTable'
import { UsersPagination } from './UsersPagination'
import { DEFAULT_PAGE_SIZE } from '../services/usersService'
import type { User, UserStatus } from '../types/user'
import {
  Alert,
  Button,
  ToggleSwitch,
  toast,
  useNavigationProgress,
  ConfirmModal,
  type ConfirmModalHandle,
} from '@lwm/ui'

export const UsersAdminPage = () => {
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { removeUser, restoreUser } = useUserMutations()
  const { roles } = useRoleOptions()

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showTrashed, setShowTrashed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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
      trashed: showTrashed ? 'with' : undefined,
    },
    currentPage,
    DEFAULT_PAGE_SIZE
  )

  const paginationInfo = meta?.page
  const totalPages = paginationInfo?.lastPage || 1
  const totalItems = paginationInfo?.total || 0
  const currentBackendPage = paginationInfo?.currentPage || currentPage

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleTrashedChange = (value: boolean) => {
    setShowTrashed(value)
    setCurrentPage(1)
  }

  const handleDelete = async (user: User) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Estás seguro de que quieres eliminar al usuario "${user.name}"?\n\nPodrás restaurarlo después desde "Mostrar eliminados".`,
      { title: 'Eliminar usuario', confirmVariant: 'danger' }
    )
    if (!confirmed) return

    try {
      await removeUser(user.id)
      toast.success(`Usuario "${user.name}" eliminado.`)
    } catch (err: unknown) {
      const axiosError = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } })
        : null
      toast.error(
        `Error al eliminar el usuario: ${axiosError?.response?.data?.message || 'intenta de nuevo'}`
      )
    }
  }

  const handleRestore = async (user: User) => {
    try {
      await restoreUser(user.id)
      toast.success(`Usuario "${user.name}" restaurado.`)
    } catch {
      toast.error('Error al restaurar el usuario. Intenta de nuevo.')
    }
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestión de Usuarios</h1>
          <p className="text-muted mb-0">
            Administración de cuentas, roles y accesos al sistema
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigation.push('/dashboard/users/create')}
        >
          <i className="bi bi-person-plus me-2" />
          Nuevo usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="Buscar usuarios"
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                aria-label="Filtrar por rol"
              >
                <option value="">Todos los roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="banned">Bloqueado</option>
              </select>
            </div>
            <div className="col-md-2">
              <ToggleSwitch
                checked={showTrashed}
                onChange={handleTrashedChange}
                label="Mostrar eliminados"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar los usuarios'}
        </Alert>
      )}

      {/* Tabla + paginacion */}
      <div className="card">
        <div className="card-body p-0">
          <UsersTable
            users={users}
            isLoading={isLoading}
            onView={(user) => navigation.push(`/dashboard/users/${user.id}`)}
            onEdit={(user) => navigation.push(`/dashboard/users/${user.id}/edit`)}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
          {totalPages > 1 && (
            <UsersPagination
              currentPage={currentBackendPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={totalItems}
              pageSize={paginationInfo?.perPage || DEFAULT_PAGE_SIZE}
            />
          )}
        </div>
      </div>
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
