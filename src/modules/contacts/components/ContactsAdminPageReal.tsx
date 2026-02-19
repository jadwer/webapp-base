/**
 * CONTACTS ADMIN PAGE - REAL IMPLEMENTATION  
 * Página principal de gestión de contactos siguiendo patrón exitoso de Inventory
 * Simple, profesional, funcional - Patrón AdminPageReal
 */

'use client'

import React, { useState } from 'react'
import { useContacts, useContactMutations } from '../hooks'
import { ContactsTableSimple } from './ContactsTableSimple'
import { FilterBar } from './FilterBar'
import { PaginationSimple } from './PaginationSimple'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { toast } from '@/lib/toast'

interface ContactsAdminPageRealProps {
  defaultFilters?: {
    isCustomer?: boolean
    isSupplier?: boolean
    status?: 'active' | 'inactive' | 'suspended'
    contactType?: 'person' | 'company'
  }
}

export const ContactsAdminPageReal = ({ defaultFilters = {} }: ContactsAdminPageRealProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [contactTypeFilter, setContactTypeFilter] = useState('')
  const pageSize = 20
  const navigation = useNavigationProgress()
  const { deleteContact } = useContactMutations()

  // Hook principal con filtros
  const { contacts, meta, isLoading, error } = useContacts({
    filters: {
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      contactType: contactTypeFilter || undefined,
      // Apply default filters
      ...defaultFilters
    },
    pagination: { page: currentPage, size: pageSize }
  })

  // Get all contacts for metrics (without pagination)
  const { contacts: allContacts } = useContacts({})

  // Paginación desde meta structure
  const paginationInfo = meta?.page as { lastPage?: number; total?: number; currentPage?: number; perPage?: number } | undefined
  const totalPages = paginationInfo?.lastPage || 1
  const totalItems = paginationInfo?.total || 0
  const currentBackendPage = paginationInfo?.currentPage || currentPage

  // Métricas dinámicas basadas en todos los contactos
  const contactMetrics = React.useMemo(() => {
    return {
      totalCustomers: allContacts.filter(c => c.isCustomer).length,
      totalSuppliers: allContacts.filter(c => c.isSupplier).length,
      activeContacts: allContacts.filter(c => c.status === 'active').length,
      companies: allContacts.filter(c => c.contactType === 'company').length
    }
  }, [allContacts])

  // Reset to page 1 when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleContactTypeFilterChange = (type: string) => {
    setContactTypeFilter(type)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = async (contact: { id: string; displayName?: string; name?: string }) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el contacto "${contact.displayName || contact.name}"?\n\nEsta acción no se puede deshacer.`
    
    if (!confirm(confirmMessage)) {
      return
    }
    
    try {
      await deleteContact(contact.id)

      // SWR will automatically refetch the data

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const axiosError = error && typeof error === 'object' && 'response' in error ?
        error as { response?: { status?: number; data?: { message?: string } } } : null

      // Show user-friendly error message
      if (axiosError?.response?.status === 409 || axiosError?.response?.status === 400) {
        toast.error('No se puede eliminar el contacto porque tiene elementos relacionados. Contacta al administrador para eliminar primero las relaciones.')
      } else {
        toast.error(`Error al eliminar el contacto: ${axiosError?.response?.data?.message || errorMessage}`)
      }
    }
  }

  // Dynamic page title based on filters
  const getPageTitle = () => {
    if (defaultFilters.isCustomer) return 'Gestión de Clientes'
    if (defaultFilters.isSupplier) return 'Gestión de Proveedores'
    return 'Gestión de Contactos'
  }
  
  const getPageDescription = () => {
    if (defaultFilters.isCustomer) return 'Administración de clientes y personas de contacto'
    if (defaultFilters.isSupplier) return 'Administración de proveedores y empresas'
    return 'Administración de clientes, proveedores y personas de contacto'
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">{getPageTitle()}</h1>
          <p className="text-muted mb-0">
            {getPageDescription()}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            onClick={() => navigation.push('/dashboard/contacts/create?type=customer')}
          >
            <i className="bi bi-person-plus me-2" />
            Nuevo Cliente
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigation.push('/dashboard/contacts/create?type=supplier')}
          >
            <i className="bi bi-building-add me-2" />
            Nuevo Proveedor
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigation.push('/dashboard/contacts/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Clientes</h6>
                  <h3 className="mb-0">{contactMetrics.totalCustomers}</h3>
                </div>
                <i className="bi bi-person-check" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Proveedores</h6>
                  <h3 className="mb-0">{contactMetrics.totalSuppliers}</h3>
                </div>
                <i className="bi bi-building" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Activos</h6>
                  <h3 className="mb-0">{contactMetrics.activeContacts}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Empresas</h6>
                  <h3 className="mb-0">{contactMetrics.companies}</h3>
                </div>
                <i className="bi bi-buildings" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        contactTypeFilter={contactTypeFilter}
        onContactTypeFilterChange={handleContactTypeFilterChange}
        placeholder="Buscar contactos por nombre, email, teléfono..."
      />

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar los contactos'}
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <ContactsTableSimple
            contacts={contacts}
            isLoading={isLoading}
            onView={(contact) => navigation.push(`/dashboard/contacts/${contact.id}`)}
            onEdit={(contact) => navigation.push(`/dashboard/contacts/${contact.id}/edit`)}
            onDelete={handleDelete}
          />
          
          {/* Paginación - Show if we have more than 1 page */}
          {totalPages > 1 && (
            <PaginationSimple
              currentPage={currentBackendPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              totalItems={totalItems}
              pageSize={paginationInfo?.perPage || pageSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}