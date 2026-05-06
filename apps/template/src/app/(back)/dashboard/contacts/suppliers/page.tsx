/**
 * SUPPLIERS PAGE
 * Vista filtrada de contactos que son proveedores
 * Reutiliza ContactsAdminPageReal con filtros predefinidos
 */

'use client'

import React from 'react'
import { ContactsAdminPageReal } from '@/modules/contacts'

export default function SuppliersPage() {
  return <ContactsAdminPageReal defaultFilters={{ isSupplier: true }} />
}