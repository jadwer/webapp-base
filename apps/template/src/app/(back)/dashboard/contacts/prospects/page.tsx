/**
 * PROSPECTS PAGE
 * Vista filtrada de contactos que son prospectos (no clientes ni proveedores)
 * Reutiliza ContactsAdminPageReal con filtros predefinidos
 */

'use client'

import React from 'react'
import { ContactsAdminPageReal } from '@/modules/contacts'

export default function ProspectsPage() {
  return <ContactsAdminPageReal defaultFilters={{ isProspect: true }} />
}
