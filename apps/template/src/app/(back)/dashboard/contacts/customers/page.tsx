/**
 * CUSTOMERS PAGE
 * Vista filtrada de contactos que son clientes
 * Reutiliza ContactsAdminPageReal con filtros predefinidos
 */

'use client'

import React from 'react'
import { ContactsAdminPageReal } from '@/modules/contacts'

export default function CustomersPage() {
  return <ContactsAdminPageReal defaultFilters={{ isCustomer: true }} />
}