/**
 * CONTACTS TABLE SIMPLE
 * Tabla básica de contactos sin virtualización (patrón simple)
 * Siguiendo el patrón exitoso de Inventory TableSimple
 */

'use client'

import React from 'react'
import type { ContactParsed } from '../types'

interface ContactsTableSimpleProps {
  contacts: ContactParsed[]
  isLoading?: boolean
  onView?: (contact: ContactParsed) => void
  onEdit?: (contact: ContactParsed) => void
  onDelete?: (contact: ContactParsed) => void
}

export const ContactsTableSimple: React.FC<ContactsTableSimpleProps> = ({
  contacts,
  isLoading = false,
  onView,
  onEdit,
  onDelete
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Clasificación</th>
              <th style={{ width: '120px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="placeholder-glow">
                      <div className="placeholder bg-secondary rounded" style={{ width: '40px', height: '40px' }}></div>
                    </div>
                    <div className="ms-3">
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                        <br />
                        <span className="placeholder col-6"></span>
                      </div>
                    </div>
                  </div>
                </td>
                <td><span className="placeholder col-8"></span></td>
                <td><span className="placeholder col-10"></span></td>
                <td><span className="placeholder col-9"></span></td>
                <td><span className="placeholder col-6"></span></td>
                <td><span className="placeholder col-7"></span></td>
                <td>
                  <div className="d-flex gap-1">
                    <div className="placeholder bg-secondary rounded" style={{ width: '32px', height: '32px' }}></div>
                    <div className="placeholder bg-secondary rounded" style={{ width: '32px', height: '32px' }}></div>
                    <div className="placeholder bg-secondary rounded" style={{ width: '32px', height: '32px' }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Empty state
  if (contacts.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-people display-1 text-muted"></i>
        <h3 className="mt-3 text-muted">No se encontraron contactos</h3>
        <p className="text-muted">
          No hay contactos que coincidan con los filtros actuales.
          <br />
          Prueba ajustar los filtros o crear un nuevo contacto.
        </p>
      </div>
    )
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'danger'
    }
    const variant = variants[status as keyof typeof variants] || 'secondary'
    
    return (
      <span className={`badge bg-${variant}`}>
        {status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Suspendido'}
      </span>
    )
  }

  // Render contact type badge  
  const renderContactTypeBadge = (contact: ContactParsed) => {
    if (contact.isCustomer && contact.isSupplier) {
      return <span className="badge bg-info">Cliente/Proveedor</span>
    }
    if (contact.isCustomer) {
      return <span className="badge bg-primary">Cliente</span>
    }
    if (contact.isSupplier) {
      return <span className="badge bg-success">Proveedor</span>
    }
    return <span className="badge bg-secondary">Contacto</span>
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Contacto</th>
            <th>Tipo</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Clasificación</th>
            <th style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', minWidth: '40px' }}
                  >
                    <i className={`bi ${contact.contactType === 'company' ? 'bi-building' : 'bi-person'}`}></i>
                  </div>
                  <div className="ms-3">
                    <div className="fw-semibold">{contact.displayName}</div>
                    <small className="text-muted">
                      {contact.contactTypeLabel}
                      {contact.taxId && (
                        <>
                          {' • '}
                          <span className="font-monospace">{contact.taxId}</span>
                        </>
                      )}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex flex-column gap-1">
                  {renderContactTypeBadge(contact)}
                  {contact.contactType === 'company' && (
                    <small className="text-muted">Empresa</small>
                  )}
                  {contact.contactType === 'person' && (
                    <small className="text-muted">Persona física</small>
                  )}
                </div>
              </td>
              <td>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-decoration-none">
                    <i className="bi bi-envelope me-1"></i>
                    {contact.email}
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="text-decoration-none">
                    <i className="bi bi-telephone me-1"></i>
                    {contact.phone}
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>
                {renderStatusBadge(contact.status)}
              </td>
              <td>
                {contact.classification ? (
                  <span className="badge bg-light text-dark border">
                    {contact.classification}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>
                <div className="d-flex gap-1">
                  {onView && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onView(contact)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onEdit(contact)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(contact)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}