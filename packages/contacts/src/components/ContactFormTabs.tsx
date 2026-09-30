/**
 * CONTACT FORM WITH TABS
 *
 * Alta y edicion de contactos por pasos (peticion de Jasim, 2026-09-30):
 * 1. Datos generales: identificacion, correos, telefonos, clasificacion y
 *    condiciones comerciales. "Siguiente" valida y desbloquea el resto.
 * 2. Datos fiscales: razon social, RFC, regimen, uso CFDI, cuentas y la
 *    direccion fiscal.
 * 3. Direcciones (de entrega), 4. Documentos, 5. Personas.
 *
 * En edicion el contacto ya existe, asi que todas las pestanas arrancan
 * desbloqueadas. Las direcciones, documentos y personas nuevas se guardan
 * despues del contacto (necesitan su id).
 */

'use client'

import React, { useState } from 'react'
import { ContactAddresses } from './ContactAddresses'
import { ContactDocuments } from './ContactDocuments'
import { ContactPeople } from './ContactPeople'
import { ContactCommercialFields } from './ContactCommercialFields'
import { PhoneListInput } from './PhoneListInput'
import { Button, EmailChipsInput, singleEmailError } from '@lwm/ui'
import { Input } from '@lwm/ui'
import { useContactAddresses, useContactDocuments, useContactPeople } from '../hooks'
import { useContactCatalogs } from '../hooks/useContactCatalogs'
import { contactAddressesService, contactPeopleService, contactDocumentsService } from '../services'
import { getValidationErrorMessages } from '../utils/jsonApiErrors'
import { cleanPhones, phoneError, parsePhoneText } from '../utils/phones'
import { useAuth } from '@lwm/auth'
import { toast } from '@lwm/ui'
import type {
  ContactFormData,
  ContactParsed,
  ContactAddress,
  ContactDocument,
  ContactPerson,
  ContactPhone
} from '../types'

interface ContactFormTabsProps {
  contact?: ContactParsed
  onSubmit: (data: ContactFormData) => Promise<ContactParsed | void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
  /**
   * Alta dirigida (party model = plomeria): el rol lo aporta el punto de
   * entrada (Ventas -> customer/prospect, Compras -> supplier) y el form
   * no muestra checkboxes de roles. Sin roleContext (Directorio) se
   * muestran los checkboxes clasicos.
   */
  roleContext?: 'customer' | 'supplier' | 'prospect'
}

type TabType = 'general' | 'fiscal' | 'addresses' | 'documents' | 'people'

const TAB_ORDER: TabType[] = ['general', 'fiscal', 'addresses', 'documents', 'people']

/** Campos de cada paso, para llevar al usuario a la pestana del error. */
const FISCAL_FIELDS = new Set(['taxId', 'legalName', 'regimenFiscal', 'usoCfdi'])

// Local document type that includes the actual File object
interface LocalContactDocument extends ContactDocument {
  file?: File // Only for local documents pending upload
}

/** Telefonos iniciales: la lista estructurada o, en contactos viejos, el telefono legado. */
function initialPhones(contact?: ContactParsed): ContactPhone[] {
  if (contact?.phones && contact.phones.length > 0) {
    return contact.phones.map((p) => ({ label: p.label ?? '', code: p.code, number: p.number, ext: p.ext ?? '' }))
  }
  if (contact?.phone) {
    const parsed = parsePhoneText(contact.phone)
    return [{ label: 'Principal', code: parsed.code, number: parsed.number, ext: contact.phoneExtension || parsed.ext || '' }]
  }
  return []
}

function initialFormData(contact: ContactParsed | undefined, roleContext: ContactFormTabsProps['roleContext']): ContactFormData {
  return {
    contactType: contact?.contactType || 'company',
    name: contact?.name || '',
    legalName: contact?.legalName || '',
    taxId: contact?.taxId || '',
    email: contact?.email || '',
    additionalEmails: contact?.additionalEmails ?? [],
    phones: initialPhones(contact),
    website: contact?.website || '',
    status: contact?.status || 'active',
    isCustomer: contact?.isCustomer ?? (roleContext === 'customer'),
    isSupplier: contact?.isSupplier ?? (roleContext === 'supplier'),
    creditLimit: contact?.creditLimit || undefined,
    classification: contact?.classification || '',
    paymentTerms: contact?.paymentTerms ?? undefined,
    notes: contact?.notes || '',
    metadata: contact?.metadata || {},
    // Datos comerciales y fiscales (nota cliente #10)
    defaultSalespersonId: contact?.defaultSalespersonId ?? null,
    collectionsAgentId: contact?.collectionsAgentId ?? null,
    commissionPctOverride: contact?.commissionPctOverride ?? null,
    regimenFiscal: contact?.regimenFiscal || '',
    usoCfdi: contact?.usoCfdi || '',
    bankAccountNumber: contact?.bankAccountNumber || '',
    referralSource: contact?.referralSource || '',
    cuentaContable: contact?.cuentaContable || '',
    discountPct: contact?.discountPct ?? null
  }
}

export const ContactFormTabs: React.FC<ContactFormTabsProps> = ({
  contact,
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
  roleContext
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const { user } = useAuth()

  // Estado controlado del contacto (persistente entre pestanas)
  const [formData, setFormData] = useState<ContactFormData>(() => initialFormData(contact, roleContext))
  // Paso 1 validado: en edicion el contacto ya existe y todo esta abierto.
  const [generalValidated, setGeneralValidated] = useState<boolean>(Boolean(contact))
  const [showPhoneErrors, setShowPhoneErrors] = useState(false)

  // Update form data when contact prop changes (for edit mode)
  React.useEffect(() => {
    if (contact) {
      setFormData(initialFormData(contact, roleContext))
      setGeneralValidated(true)
    }
  }, [contact, roleContext])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Clasificacion desde el catalogo del backend (fuente unica, regla 7).
  const { classifications } = useContactCatalogs()

  // Cargar entidades relacionadas desde la API (solo en modo edit)
  const { addresses: apiAddresses } = useContactAddresses(contact?.id)
  const { documents: apiDocuments } = useContactDocuments(contact?.id)
  const { people: apiPeople } = useContactPeople(contact?.id)

  // Estados locales para las entidades relacionadas (para crear/editar)
  const [localAddresses, setLocalAddresses] = useState<ContactAddress[]>([])
  const [localDocuments, setLocalDocuments] = useState<LocalContactDocument[]>([])
  const [localPeople, setLocalPeople] = useState<ContactPerson[]>([])
  const [, setIsSubmitting] = useState(false)

  // Combinar datos de API con datos locales
  const addresses = [...(apiAddresses || []), ...localAddresses]
  const documents = [...(apiDocuments || []), ...localDocuments]
  const people = [...(apiPeople || []), ...localPeople]
  const fiscalCount = addresses.filter((a) => a.addressType === 'fiscal').length
  const deliveryCount = addresses.length - fiscalCount

  const tabs: Array<{ id: TabType; label: string; icon: string; count: number | null }> = [
    { id: 'general', label: 'Datos generales', icon: 'bi-person-circle', count: null },
    { id: 'fiscal', label: 'Datos fiscales', icon: 'bi-bank', count: null },
    { id: 'addresses', label: 'Direcciones', icon: 'bi-geo-alt-fill', count: deliveryCount },
    { id: 'documents', label: 'Documentos', icon: 'bi-file-earmark-text-fill', count: documents.length },
    { id: 'people', label: 'Personas', icon: 'bi-people-fill', count: people.length }
  ]

  // Form field update handler
  const updateField = <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Paso 1: datos generales. Mismas reglas que el backend (ContactChannels).
  const validateGeneral = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio'
    }

    const emailError = singleEmailError(formData.email)
    if (emailError) {
      errors.email = `${emailError} Los demás van en "Correos adicionales".`
    }

    const badExtra = (formData.additionalEmails ?? []).find((e) => singleEmailError(e, 'correo adicional'))
    if (badExtra) {
      errors.additionalEmails = `Correo adicional no válido: ${badExtra}`
    }

    const phoneIssue = (formData.phones ?? [])
      .map((p, i) => ({ i, error: p.number || p.label ? phoneError(p) : null }))
      .find((x) => x.error)
    if (phoneIssue) {
      errors.phones = `Teléfono ${phoneIssue.i + 1}: ${phoneIssue.error}`
    }

    // Bounds numericos (P0.3): mismos limites que el backend.
    if (formData.creditLimit !== undefined && formData.creditLimit !== null && (formData.creditLimit > 999999.99 || formData.creditLimit < 0)) {
      errors.creditLimit = 'El límite de crédito debe estar entre 0 y 999,999.99'
    }
    if (formData.paymentTerms !== undefined && formData.paymentTerms !== null && (formData.paymentTerms > 365 || formData.paymentTerms < 0)) {
      errors.paymentTerms = 'Los términos de pago deben estar entre 0 y 365 días'
    }

    return errors
  }

  // Paso 2: datos fiscales.
  const validateFiscal = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (formData.taxId && formData.taxId.trim()) {
      const taxId = formData.taxId.trim().toUpperCase()
      if (taxId.length > 13) {
        errors.taxId = 'El RFC no puede tener más de 13 caracteres'
      } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(taxId)) {
        errors.taxId = 'Formato de RFC inválido (ej. ABC123456XYZ o ABCD123456XYZ)'
      }
    }
    return errors
  }

  const goTo = (tab: TabType) => {
    if (tab !== 'general' && !generalValidated) return
    setActiveTab(tab)
  }

  // "Siguiente": valida el paso actual y avanza. El paso 1 desbloquea el resto.
  const handleNext = () => {
    if (activeTab === 'general') {
      const errors = validateGeneral()
      setShowPhoneErrors(true)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        if (!contact) setGeneralValidated(false)
        toast.warning('Revisa los datos marcados en rojo para continuar.')
        return
      }
      setFormErrors({})
      setGeneralValidated(true)
    }
    if (activeTab === 'fiscal') {
      const errors = validateFiscal()
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
      setFormErrors({})
    }
    const next = TAB_ORDER[TAB_ORDER.indexOf(activeTab) + 1]
    if (next) setActiveTab(next)
  }

  const handleBack = () => {
    const prev = TAB_ORDER[TAB_ORDER.indexOf(activeTab) - 1]
    if (prev) setActiveTab(prev)
  }

  const handleFinalSubmit = () => {
    // Revalidar todo: el usuario pudo cambiar datos despues de "Siguiente".
    const generalErrors = validateGeneral()
    const fiscalErrors = validateFiscal()
    const all = { ...generalErrors, ...fiscalErrors }
    if (Object.keys(all).length > 0) {
      setFormErrors(all)
      setShowPhoneErrors(true)
      const firstField = Object.keys(all)[0]
      setActiveTab(FISCAL_FIELDS.has(firstField) ? 'fiscal' : 'general')
      toast.warning('Hay datos inválidos en el formulario. Revisa los campos marcados.')
      return
    }

    // Clean up form data - convert empty strings to undefined for optional fields.
    // El telefono legado (phone/phoneExtension) lo refleja el backend desde
    // la lista, por eso no se envia.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phone: _phone, phoneExtension: _ext, creditMonths: _months, ...rest } = formData
    const cleanedData: ContactFormData = {
      ...rest,
      legalName: formData.legalName?.trim() || undefined,
      taxId: formData.taxId?.trim() ? formData.taxId.trim().toUpperCase() : undefined,
      email: formData.email?.trim() || undefined,
      additionalEmails: formData.additionalEmails ?? [],
      phones: cleanPhones(formData.phones ?? []),
      // El backend valida website con regla 'url' (exige esquema). Los
      // usuarios escriben "www.empresa.com": anteponer https:// en vez de
      // dejar que truene con un 422 (causa probable del bug 2026-07-29).
      website: (() => {
        const raw = formData.website?.trim()
        if (!raw) return undefined
        return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
      })(),
      classification: formData.classification?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      creditLimit: formData.creditLimit || undefined,
      // 0 dias = contado: es un valor valido, no se descarta.
      paymentTerms: formData.paymentTerms ?? undefined,
      // Comerciales/fiscales: strings vacios -> undefined; nullables tal cual
      regimenFiscal: formData.regimenFiscal?.trim() || undefined,
      usoCfdi: formData.usoCfdi?.trim() || undefined,
      bankAccountNumber: formData.bankAccountNumber?.trim() || undefined,
      referralSource: formData.referralSource?.trim() || undefined,
      cuentaContable: formData.cuentaContable?.trim() || undefined
    }

    // Submit complete contact with related entities
    handleCompleteSubmit(cleanedData)
  }

  const handleCompleteSubmit = async (contactData: ContactFormData) => {
    try {
      setIsSubmitting(true)

      // First create/update the contact
      const result = await onSubmit(contactData)

      // En EDICION el onSubmit de la pagina puede no devolver el contacto
      // (updateContact sin return): usar el id que ya tenemos. Si no hay id
      // y quedan pendientes, se AVISA en vez de perderlos en silencio
      // (bug historico: las direcciones agregadas al editar se descartaban).
      const relatedContactId = result?.id ?? contact?.id

      if (!relatedContactId && (localAddresses.length > 0 || localPeople.length > 0 || localDocuments.length > 0)) {
        toast.error('El contacto se guardo pero no se pudieron guardar direcciones/personas/documentos (sin id del contacto)', { duration: 0 })
      }

      if (relatedContactId) {

        // Create addresses (incluye los campos SAT del domicilio)
        if (localAddresses.length > 0) {
          for (const address of localAddresses) {
            try {
              const addressData = {
                contactId: parseInt(relatedContactId),
                addressType: address.addressType,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                street: address.street,
                exteriorNumber: address.exteriorNumber,
                interiorNumber: address.interiorNumber,
                neighborhood: address.neighborhood,
                municipality: address.municipality,
                reference: address.reference,
                city: address.city,
                state: address.state,
                country: address.country,
                postalCode: address.postalCode,
                isDefault: address.isDefault
              }
              await contactAddressesService.create(addressData)
            } catch (error) {
              // Un 422 SIEMPRE se muestra con detalle (regla del proyecto)
              const details = getValidationErrorMessages(error)
              toast.error(
                details.length > 0
                  ? `Direccion no guardada: ${details.join(' ')}`
                  : 'Una direccion no se pudo guardar',
                { duration: 0 }
              )
            }
          }
        }

        // Create people
        if (localPeople.length > 0) {
          for (const person of localPeople) {
            try {
              const personData = {
                contactId: parseInt(relatedContactId),
                name: person.name,
                position: person.position,
                department: person.department,
                email: person.email,
                phone: person.phone,
                mobile: person.mobile,
                isPrimary: person.isPrimary
              }
              await contactPeopleService.create(personData)
            } catch (error) {
              const details = getValidationErrorMessages(error)
              toast.error(
                details.length > 0
                  ? `Persona no guardada: ${details.join(' ')}`
                  : 'Una persona de contacto no se pudo guardar',
                { duration: 0 }
              )
            }
          }
        }

        // Upload documents
        if (localDocuments.length > 0) {
          for (const document of localDocuments) {
            try {
              if (document.file) {
                await contactDocumentsService.upload(
                  document.file,
                  relatedContactId,
                  document.documentType,
                  document.notes
                )
              }
            } catch (error: unknown) {
              // Continue with other documents even if one fails
              const errorMessage = typeof error === 'object' && error !== null && 'response' in error
                ? String((error as Record<string, unknown>).response)
                : error instanceof Error ? error.message : String(error)
              toast.error(`Error subiendo ${document.originalFilename}: ${errorMessage}`)
            }
          }
        }

        // Invalidate SWR cache for the created contact to ensure fresh data on view
        const { mutate } = await import('swr')

        // Invalidate the specific contact with includes
        mutate(['contact', relatedContactId, ['contactAddresses', 'contactDocuments', 'contactPeople']])

        // Also invalidate general contact cache
        mutate(key => Array.isArray(key) && key[0] === 'contact' && key[1] === relatedContactId)
      }

    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Address handlers
  const handleAddAddress = (address: Omit<ContactAddress, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => {
    const newAddress: ContactAddress = {
      id: `temp-${Date.now()}`,
      contactId: parseInt(contact?.id || '0'),
      ...address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setLocalAddresses(prev => [...prev, newAddress])
  }

  const handleUpdateAddress = async (id: string, updatedAddress: Partial<ContactAddress>) => {
    // Check if it's a local address (temp ID) or API address
    if (id.startsWith('temp-')) {
      setLocalAddresses(prev => prev.map(addr =>
        addr.id === id ? { ...addr, ...updatedAddress } : addr
      ))
    } else {
      // Call API to update existing address
      try {
        await contactAddressesService.update(id, updatedAddress)
      } catch {
        toast.error('Error al actualizar la direccion')
      }
    }
  }

  const handleDeleteAddress = async (id: string) => {
    // Check if it's a local address (temp ID) or API address
    if (id.startsWith('temp-')) {
      setLocalAddresses(prev => prev.filter(addr => addr.id !== id))
    } else {
      // Call API to delete existing address
      try {
        await contactAddressesService.delete(id)
      } catch {
        toast.error('Error al eliminar la direccion')
      }
    }
  }

  // Document handlers
  const handleUploadDocument = async (file: File, documentType: string, notes?: string) => {
    // Store document locally with the File object for later upload
    const newDocument: LocalContactDocument = {
      id: `temp-${Date.now()}`,
      contactId: parseInt(contact?.id || '0'),
      documentType: documentType as ContactDocument['documentType'],
      filePath: `/uploads/${file.name}`,
      originalFilename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      uploadedBy: user?.id ? parseInt(user.id) : 1, // Get from current user
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      file: file // Store the actual File object for upload
    }

    setLocalDocuments(prev => [...prev, newDocument])
  }

  const handleDownloadDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id)
    if (document) {
      // Aquí iría la lógica real de descarga
      toast.info(`Descargando: ${document.originalFilename}`)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    // Check if it's a local document (temp ID) or API document
    if (id.startsWith('temp-')) {
      setLocalDocuments(prev => prev.filter(doc => doc.id !== id))
    } else {
      // Call API to delete existing document
      try {
        await contactDocumentsService.delete(id)
      } catch {
        toast.error('Error al eliminar el documento')
      }
    }
  }

  const handleVerifyDocument = async (id: string) => {
    // Check if it's a local document (temp ID) or API document
    if (id.startsWith('temp-')) {
      setLocalDocuments(prev => prev.map(doc =>
        doc.id === id
          ? { ...doc, verifiedAt: new Date().toISOString(), verifiedBy: 1 }
          : doc
      ))
    } else {
      // Call API to verify existing document
      try {
        await contactDocumentsService.verify(id)
      } catch {
        toast.error('Error al verificar el documento')
      }
    }
  }

  // People handlers
  const handleAddPerson = (person: Omit<ContactPerson, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => {
    const newPerson: ContactPerson = {
      id: `temp-${Date.now()}`,
      contactId: parseInt(contact?.id || '0'),
      ...person,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setLocalPeople(prev => [...prev, newPerson])
  }

  const handleUpdatePerson = async (id: string, updatedPerson: Partial<ContactPerson>) => {
    // Check if it's a local person (temp ID) or API person
    if (id.startsWith('temp-')) {
      setLocalPeople(prev => prev.map(person =>
        person.id === id ? { ...person, ...updatedPerson } : person
      ))
    } else {
      // Call API to update existing person
      try {
        await contactPeopleService.update(id, updatedPerson)
      } catch {
        toast.error('Error al actualizar la persona')
      }
    }
  }

  const handleDeletePerson = async (id: string) => {
    // Check if it's a local person (temp ID) or API person
    if (id.startsWith('temp-')) {
      setLocalPeople(prev => prev.filter(person => person.id !== id))
    } else {
      // Call API to delete existing person
      try {
        await contactPeopleService.delete(id)
      } catch {
        toast.error('Error al eliminar la persona')
      }
    }
  }

  const isLast = activeTab === TAB_ORDER[TAB_ORDER.length - 1]
  const saveLabel = contact ? 'Guardar cambios' : 'Crear contacto'

  /** Pie comun: Cancelar | Anterior | Siguiente | Guardar. */
  const renderFooter = () => (
    <div className="d-flex flex-wrap justify-content-between gap-2 mt-4 pt-3 border-top">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </Button>
      <div className="d-flex flex-wrap gap-2">
        {activeTab !== 'general' && (
          <Button type="button" variant="secondary" onClick={handleBack} disabled={isLoading}>
            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Anterior
          </Button>
        )}
        {!isLast && (
          <Button type="button" variant="primary" onClick={handleNext} disabled={isLoading}>
            Siguiente
            <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i>
          </Button>
        )}
        {generalValidated && (
          <Button type="button" variant="success" onClick={handleFinalSubmit} disabled={isLoading}>
            {isLoading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            <i className="bi bi-check-lg me-1" aria-hidden="true"></i>
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className={`contact-form-tabs ${className}`}>
      {/* Navigation Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab) => {
            const locked = tab.id !== 'general' && !generalValidated
            return (
              <li key={tab.id} className="nav-item" role="presentation">
                <button
                  className={`nav-link d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => goTo(tab.id)}
                  disabled={isLoading || locked}
                  title={locked ? 'Completa los datos generales y presiona "Siguiente"' : undefined}
                >
                  <i className={locked ? 'bi bi-lock' : tab.icon} aria-hidden="true"></i>
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className="badge bg-primary rounded-pill ms-1">{tab.count}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        {!generalValidated && (
          <div className="form-text mt-2">
            <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
            Captura los datos generales y presiona &quot;Siguiente&quot; para continuar con los datos fiscales.
          </div>
        )}
      </div>

      <div className="tab-content">
        {/* ===== 1. Datos generales ===== */}
        {activeTab === 'general' && (
          <div className="tab-pane fade show active">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
            >
              <div className="row g-3">
                <div className="col-12">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
                    Identificación
                  </h5>
                </div>

                <div className="col-md-6">
                  <label htmlFor="contactType" className="form-label">
                    Tipo de contacto <span className="text-danger">*</span>
                  </label>
                  <select
                    id="contactType"
                    className="form-select"
                    value={formData.contactType}
                    onChange={(e) => updateField('contactType', e.target.value as 'person' | 'company')}
                    disabled={isLoading}
                  >
                    <option value="company">Empresa</option>
                    <option value="person">Persona física</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="status" className="form-label">
                    Estado <span className="text-danger">*</span>
                  </label>
                  <select
                    id="status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value as 'active' | 'inactive' | 'suspended')}
                    disabled={isLoading}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    {formData.contactType === 'company' ? 'Nombre comercial' : 'Nombre completo'} <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    errorText={formErrors.name}
                    disabled={isLoading}
                    placeholder={formData.contactType === 'company' ? 'Ej. Acme Corp' : 'Ej. Juan Pérez'}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="website" className="form-label">
                    Sitio web
                  </label>
                  <Input
                    id="website"
                    type="text"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    disabled={isLoading}
                    placeholder="www.ejemplo.com"
                    leftIcon="bi-globe"
                  />
                </div>

                <div className="col-12">
                  <h5 className="mb-0 mt-3">
                    <i className="bi bi-envelope me-2" aria-hidden="true"></i>
                    Correos y teléfonos
                  </h5>
                </div>

                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    Correo principal
                  </label>
                  <Input
                    id="email"
                    type="text"
                    inputMode="email"
                    value={formData.email}
                    onChange={(e) => {
                      updateField('email', e.target.value)
                      const err = singleEmailError(e.target.value)
                      // Error en vivo solo por separadores o segunda @ (lo que pidio el cliente).
                      if (err && /[\s,;]|@.*@/.test(e.target.value.trim())) {
                        setFormErrors(prev => ({ ...prev, email: `${err} Los demás van en "Correos adicionales".` }))
                      }
                    }}
                    errorText={formErrors.email}
                    helpText={formErrors.email ? undefined : 'Un solo correo; también es el acceso al portal del cliente.'}
                    disabled={isLoading}
                    placeholder="compras@empresa.com"
                    leftIcon="bi-envelope"
                  />
                </div>

                <div className="col-md-6">
                  <EmailChipsInput
                    id="additionalEmails"
                    label="Correos adicionales"
                    value={formData.additionalEmails ?? []}
                    onChange={(emails) => updateField('additionalEmails', emails)}
                    exclude={formData.email ? [formData.email] : []}
                    errorText={formErrors.additionalEmails}
                    helpText="Laboratorio, inventarios, otra área. Sepáralos con coma o punto y coma."
                    placeholder="laboratorio@empresa.com; inventarios@empresa.com"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label mb-1">Teléfonos</label>
                  <PhoneListInput
                    value={formData.phones ?? []}
                    onChange={(phones) => updateField('phones', phones)}
                    showErrors={showPhoneErrors}
                    disabled={isLoading}
                  />
                </div>

                <div className="col-12">
                  <h5 className="mb-0 mt-3">
                    <i className="bi bi-tags me-2" aria-hidden="true"></i>
                    Clasificación
                  </h5>
                </div>

                {/* Roles del contacto (party model = plomeria: nunca checkboxes
                    crudos en flujos dirigidos; ver feedback 2026-08-31) */}
                <div className="col-12">
                  {roleContext && !contact ? (
                    <div className="alert alert-info d-flex align-items-center mb-0 py-2">
                      <i className={`bi ${roleContext === 'customer' ? 'bi-person-check' : roleContext === 'supplier' ? 'bi-building' : 'bi-person-dash'} me-2`} aria-hidden="true"></i>
                      <span>
                        Se creará como{' '}
                        <strong>
                          {roleContext === 'customer' ? 'Cliente' : roleContext === 'supplier' ? 'Proveedor' : 'Prospecto'}
                        </strong>
                      </span>
                    </div>
                  ) : contact ? (
                    <div>
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        {formData.isCustomer && (
                          <span className="badge bg-success"><i className="bi bi-person-check me-1" aria-hidden="true"></i>Cliente</span>
                        )}
                        {formData.isSupplier && (
                          <span className="badge bg-info"><i className="bi bi-building me-1" aria-hidden="true"></i>Proveedor</span>
                        )}
                        {!formData.isCustomer && !formData.isSupplier && (
                          <span className="badge bg-secondary"><i className="bi bi-person-dash me-1" aria-hidden="true"></i>Prospecto</span>
                        )}
                        <span className="vr mx-1 d-none d-md-inline-block"></span>
                        {!formData.isCustomer ? (
                          <button type="button" className="btn btn-sm btn-outline-success" disabled={isLoading}
                            onClick={() => updateField('isCustomer', true)}>
                            Convertir en cliente
                          </button>
                        ) : (
                          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={isLoading}
                            onClick={() => updateField('isCustomer', false)}>
                            Quitar rol de cliente
                          </button>
                        )}
                        {!formData.isSupplier ? (
                          <button type="button" className="btn btn-sm btn-outline-info" disabled={isLoading}
                            onClick={() => updateField('isSupplier', true)}>
                            También es proveedor
                          </button>
                        ) : (
                          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={isLoading}
                            onClick={() => updateField('isSupplier', false)}>
                            Quitar rol de proveedor
                          </button>
                        )}
                      </div>
                      {(formData.isCustomer !== contact.isCustomer || formData.isSupplier !== contact.isSupplier) && (
                        <div className="text-warning small mt-1">
                          <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
                          El cambio de rol se aplica al guardar el contacto
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex flex-wrap gap-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isCustomer"
                            checked={formData.isCustomer}
                            onChange={(e) => updateField('isCustomer', e.target.checked)}
                            disabled={isLoading}
                          />
                          <label className="form-check-label" htmlFor="isCustomer">
                            <i className="bi bi-person-check me-1" aria-hidden="true"></i>
                            Es cliente
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isSupplier"
                            checked={formData.isSupplier}
                            onChange={(e) => updateField('isSupplier', e.target.checked)}
                            disabled={isLoading}
                          />
                          <label className="form-check-label" htmlFor="isSupplier">
                            <i className="bi bi-building me-1" aria-hidden="true"></i>
                            Es proveedor
                          </label>
                        </div>
                      </div>
                      {!formData.isCustomer && !formData.isSupplier && (
                        <div className="text-warning small mt-1">
                          <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
                          Este contacto se guardará como Prospecto
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="classification" className="form-label">
                    Clasificación
                  </label>
                  <select
                    id="classification"
                    className="form-select"
                    value={formData.classification}
                    onChange={(e) => updateField('classification', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Sin clasificación</option>
                    {classifications.map((entry) => (
                      <option key={entry.code} value={entry.code}>{entry.label}</option>
                    ))}
                  </select>
                </div>

                {/* Condiciones comerciales: credito en dias (unico campo de
                    plazo; "Credito (meses)" se retiro por redundante) */}
                <div className="col-12">
                  <h5 className="mb-0 mt-3">
                    <i className="bi bi-cash-coin me-2" aria-hidden="true"></i>
                    Condiciones comerciales
                  </h5>
                </div>

                <div className="col-md-6">
                  <label htmlFor="paymentTerms" className="form-label">
                    Términos de pago (días)
                  </label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="0"
                    max="365"
                    value={formData.paymentTerms?.toString() ?? ''}
                    onChange={(e) => updateField('paymentTerms', e.target.value !== '' ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                    placeholder="30"
                    helpText="0 = contado."
                    errorText={formErrors.paymentTerms}
                  />
                </div>

                {formData.isCustomer && (
                  <div className="col-md-6">
                    <label htmlFor="creditLimit" className="form-label">
                      Límite de crédito
                    </label>
                    <Input
                      id="creditLimit"
                      type="number"
                      min="0"
                      max="999999.99"
                      step="0.01"
                      value={formData.creditLimit?.toString() || ''}
                      onChange={(e) => updateField('creditLimit', e.target.value ? parseFloat(e.target.value) : undefined)}
                      disabled={isLoading}
                      placeholder="0.00"
                      leftIcon="bi-currency-dollar"
                      errorText={formErrors.creditLimit}
                    />
                  </div>
                )}

                <ContactCommercialFields
                  formData={formData}
                  updateField={updateField}
                  isLoading={isLoading}
                  section="commercial"
                  showHeading={false}
                />

                <div className="col-12">
                  <label htmlFor="notes" className="form-label">
                    Notas adicionales
                  </label>
                  <textarea
                    id="notes"
                    className="form-control"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    disabled={isLoading}
                    placeholder="Información adicional sobre el contacto..."
                  />
                </div>
              </div>
            </form>
            {renderFooter()}
          </div>
        )}

        {/* ===== 2. Datos fiscales ===== */}
        {activeTab === 'fiscal' && (
          <div className="tab-pane fade show active">
            <div className="row g-3 mb-4">
              <div className="col-12">
                <h5 className="mb-0">
                  <i className="bi bi-bank me-2" aria-hidden="true"></i>
                  Datos fiscales
                </h5>
                <p className="text-muted small mb-0">Como aparecen en la constancia de situación fiscal; se usan para facturar.</p>
              </div>

              <div className="col-md-6">
                <label htmlFor="legalName" className="form-label">
                  {formData.contactType === 'company' ? 'Razón social' : 'Nombre legal'}
                </label>
                <Input
                  id="legalName"
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => updateField('legalName', e.target.value)}
                  disabled={isLoading}
                  placeholder={formData.contactType === 'company' ? 'Ej. Acme Corporation S.A. de C.V.' : 'Nombre completo legal'}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="taxId" className="form-label">
                  RFC
                </label>
                <Input
                  id="taxId"
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => updateField('taxId', e.target.value.toUpperCase())}
                  errorText={formErrors.taxId}
                  disabled={isLoading}
                  placeholder={formData.contactType === 'company' ? 'ACM123456ABC' : 'PERJ800101AB1'}
                  maxLength={13}
                  helpText={formErrors.taxId ? undefined : `${(formData.taxId || '').length}/13 caracteres`}
                />
              </div>

              <ContactCommercialFields
                formData={formData}
                updateField={updateField}
                isLoading={isLoading}
                section="fiscal"
                showHeading={false}
              />
            </div>

            <ContactAddresses
              contactId={contact?.id}
              addresses={addresses}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              isLoading={isLoading}
              section="fiscal"
            />
            {renderFooter()}
          </div>
        )}

        {/* ===== 3. Direcciones (entrega) ===== */}
        {activeTab === 'addresses' && (
          <div className="tab-pane fade show active">
            <ContactAddresses
              contactId={contact?.id}
              addresses={addresses}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              isLoading={isLoading}
              section="delivery"
            />
            {renderFooter()}
          </div>
        )}

        {/* ===== 4. Documentos ===== */}
        {activeTab === 'documents' && (
          <div className="tab-pane fade show active">
            <ContactDocuments
              contactId={contact?.id}
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onDownloadDocument={handleDownloadDocument}
              onVerifyDocument={handleVerifyDocument}
              isLoading={isLoading}
            />
            {renderFooter()}
          </div>
        )}

        {/* ===== 5. Personas ===== */}
        {activeTab === 'people' && (
          <div className="tab-pane fade show active">
            <ContactPeople
              contactId={contact?.id}
              people={people}
              onAddPerson={handleAddPerson}
              onUpdatePerson={handleUpdatePerson}
              onDeletePerson={handleDeletePerson}
              isLoading={isLoading}
            />
            {renderFooter()}
          </div>
        )}
      </div>
    </div>
  )
}

