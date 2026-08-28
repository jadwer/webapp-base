/**
 * CONTACT ADDRESSES COMPONENT
 *
 * Direcciones del contacto separadas como lo pide el cliente (2026-08-25):
 *  - UNA "Direccion fiscal" (la que alimenta la facturacion CFDI)
 *  - N "Direcciones de entrega" (mas ligeras, con linea de referencia)
 *
 * Campos como el nodo Domicilio del SAT (calle, numero exterior/interior,
 * colonia, municipio, estado, CP, referencia) con autollenado por codigo
 * postal desde los catalogos del backend. El catalogo ASISTE, no bloquea:
 * un CP desconocido cae a captura manual y "Mz 3 Lt 3" es texto valido.
 *
 * Las direcciones legadas (solo addressLine1/2) se muestran tal cual y
 * conservan sus lineas hasta que se recapturen con los campos nuevos.
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Input } from '@lwm/ui'
import { Button } from '@lwm/ui'
import type { ContactAddress } from '../types'
import { addressCatalogsService } from '../services/addressCatalogs'
import type { PostalCodeInfo } from '../services/addressCatalogs'

interface ContactAddressesProps {
  contactId?: string
  addresses: ContactAddress[]
  onAddAddress: (address: Omit<ContactAddress, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>) => void
  onUpdateAddress: (id: string, address: Partial<ContactAddress>) => void
  onDeleteAddress: (id: string) => void
  isLoading?: boolean
  className?: string
}

interface AddressFormData {
  addressType: 'billing' | 'shipping' | 'fiscal' | 'other'
  street: string
  exteriorNumber: string
  interiorNumber: string
  neighborhood: string
  municipality: string
  state: string
  country: string
  postalCode: string
  reference: string
  isDefault: boolean
}

const emptyForm = (addressType: AddressFormData['addressType']): AddressFormData => ({
  addressType,
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  municipality: '',
  state: '',
  country: 'México',
  postalCode: '',
  reference: '',
  isDefault: false,
})

type CpStatus = 'idle' | 'loading' | 'found' | 'notfound'

const OTRA_COLONIA = '__otra__'

/** Linea principal de la tarjeta: campos SAT si existen, legado si no. */
function addressMainLine(address: ContactAddress): string {
  if (address.street) {
    return [
      address.street,
      address.exteriorNumber,
      address.interiorNumber ? `Int. ${address.interiorNumber}` : '',
    ].filter(Boolean).join(' ')
  }
  return address.addressLine1 || 'Sin calle capturada'
}

function addressSecondLine(address: ContactAddress): string {
  if (address.street) {
    return [
      address.neighborhood ? `Col. ${address.neighborhood}` : '',
      address.municipality || address.city,
      address.state,
    ].filter(Boolean).join(', ')
  }
  return [address.addressLine2, address.city, address.state].filter(Boolean).join(', ')
}

export const ContactAddresses: React.FC<ContactAddressesProps> = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  isLoading = false,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<ContactAddress | null>(null)
  const [formData, setFormData] = useState<AddressFormData>(emptyForm('shipping'))

  // Autollenado por CP
  const [cpStatus, setCpStatus] = useState<CpStatus>('idle')
  const [cpInfo, setCpInfo] = useState<PostalCodeInfo | null>(null)
  const [coloniaLibre, setColoniaLibre] = useState(false)
  const cpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextLookup = useRef(false)

  const fiscalAddress = addresses.find(a => a.addressType === 'fiscal') ?? null
  const deliveryAddresses = addresses.filter(a => a.addressType === 'shipping')
  const legacyOthers = addresses.filter(a => a.addressType !== 'fiscal' && a.addressType !== 'shipping')

  const isFiscalForm = formData.addressType === 'fiscal'

  // Lookup debounced del CP: asiste, nunca bloquea
  useEffect(() => {
    if (cpTimer.current) clearTimeout(cpTimer.current)
    if (skipNextLookup.current) {
      skipNextLookup.current = false
      return
    }
    if (!showForm) return
    if (!/^\d{5}$/.test(formData.postalCode)) {
      setCpStatus('idle')
      setCpInfo(null)
      return
    }
    setCpStatus('loading')
    cpTimer.current = setTimeout(async () => {
      try {
        const info = await addressCatalogsService.lookupPostalCode(formData.postalCode)
        if (info) {
          setCpInfo(info)
          setCpStatus('found')
          setFormData(prev => ({
            ...prev,
            state: info.estado || prev.state,
            municipality: info.municipio || prev.municipality,
            country: 'México',
          }))
          setColoniaLibre(false)
        } else {
          setCpInfo(null)
          setCpStatus('notfound')
        }
      } catch {
        // Falla de red: captura manual, sin drama
        setCpInfo(null)
        setCpStatus('notfound')
      }
    }, 450)
    return () => {
      if (cpTimer.current) clearTimeout(cpTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.postalCode, showForm])

  // Colonias del CP, deduplicadas por nombre (el SAT repite nombres con clave distinta)
  const coloniaOptions = React.useMemo(() => {
    if (!cpInfo) return []
    const seen = new Set<string>()
    return cpInfo.colonias.filter(c => {
      if (seen.has(c.nombre)) return false
      seen.add(c.nombre)
      return true
    })
  }, [cpInfo])

  const coloniaEnCatalogo = coloniaOptions.some(c => c.nombre === formData.neighborhood)
  const coloniaSelectValue = coloniaLibre || (formData.neighborhood && !coloniaEnCatalogo)
    ? OTRA_COLONIA
    : formData.neighborhood

  const openForm = (addressType: AddressFormData['addressType']) => {
    setFormData(emptyForm(addressType))
    setEditingAddress(null)
    setCpStatus('idle')
    setCpInfo(null)
    setColoniaLibre(false)
    setShowForm(true)
  }

  const handleEdit = (address: ContactAddress) => {
    // Al abrir la edicion NO se dispara el lookup (pisaria estado/municipio
    // ya capturados); solo busca cuando el usuario CAMBIA el CP.
    skipNextLookup.current = true
    setFormData({
      addressType: address.addressType,
      street: address.street || '',
      exteriorNumber: address.exteriorNumber || '',
      interiorNumber: address.interiorNumber || '',
      neighborhood: address.neighborhood || '',
      municipality: address.municipality || '',
      state: address.state || '',
      country: address.country === 'MX' ? 'México' : (address.country || 'México'),
      postalCode: address.postalCode || '',
      reference: address.reference || '',
      isDefault: address.isDefault,
    })
    setEditingAddress(address)
    setCpStatus('idle')
    setCpInfo(null)
    setColoniaLibre(false)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData(emptyForm('shipping'))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAddress) {
      onUpdateAddress(editingAddress.id, formData)
      setEditingAddress(null)
    } else {
      onAddAddress(formData as unknown as Omit<ContactAddress, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>)
    }
    setShowForm(false)
    setFormData(emptyForm('shipping'))
  }

  const updateField = <K extends keyof AddressFormData>(field: K, value: AddressFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderAddressCard = (address: ContactAddress, badge: React.ReactNode) => (
    <div key={address.id} className={`card h-100 ${address.isDefault ? 'border-primary' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center flex-wrap gap-1">
            {badge}
            {address.isDefault && address.addressType === 'shipping' && (
              <span className="badge bg-warning text-dark">
                <i className="bi bi-star-fill me-1"></i>
                Predeterminada
              </span>
            )}
          </div>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleEdit(address)}
              disabled={isLoading}
              title="Editar"
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDeleteAddress(address.id)}
              disabled={isLoading}
              title="Eliminar"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div className="address-details">
          <div className="mb-1"><strong>{addressMainLine(address)}</strong></div>
          <div className="text-muted small">{addressSecondLine(address)}</div>
          <div className="text-muted small">
            {(address.country === 'MX' ? 'México' : address.country)}{address.postalCode ? ` - CP ${address.postalCode}` : ''}
          </div>
          {address.reference && (
            <div className="text-muted small mt-1">
              <i className="bi bi-signpost me-1"></i>
              {address.reference}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`contact-addresses ${className}`}>
      {/* ===== Direccion fiscal (una sola) ===== */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">
            <i className="bi bi-bank me-2"></i>
            Dirección fiscal
          </h5>
          {!fiscalAddress && !showForm && (
            <Button
              variant="primary"
              size="small"
              onClick={() => openForm('fiscal')}
              disabled={isLoading}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Agregar dirección fiscal
            </Button>
          )}
        </div>
        <p className="text-muted small mb-2">
          El domicilio del RFC (constancia de situación fiscal); se usa para la facturación.
        </p>
        {fiscalAddress ? (
          <div className="row g-3">
            <div className="col-md-8">
              {renderAddressCard(fiscalAddress, (
                <span className="badge bg-primary me-2">Fiscal</span>
              ))}
            </div>
          </div>
        ) : (
          !showForm && (
            <div className="alert alert-light border small mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Este contacto aún no tiene dirección fiscal.
            </div>
          )
        )}
      </div>

      {/* ===== Direcciones de entrega ===== */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">
            <i className="bi bi-truck me-2"></i>
            Direcciones de entrega
          </h5>
          {!showForm && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => openForm('shipping')}
              disabled={isLoading}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Agregar dirección de entrega
            </Button>
          )}
        </div>
        {deliveryAddresses.length > 0 ? (
          <div className="row g-3">
            {deliveryAddresses.map(address => (
              <div key={address.id} className="col-md-6">
                {renderAddressCard(address, (
                  <span className="badge bg-info me-2">Entrega</span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="alert alert-light border small mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Sin direcciones de entrega registradas.
            </div>
          )
        )}
      </div>

      {/* ===== Otras direcciones (legado) ===== */}
      {legacyOthers.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">
            <i className="bi bi-archive me-2"></i>
            Otras direcciones
          </h6>
          <div className="row g-3">
            {legacyOthers.map(address => (
              <div key={address.id} className="col-md-6">
                {renderAddressCard(address, (
                  <span className="badge bg-secondary me-2">
                    {address.addressType === 'billing' ? 'Facturación' : 'Otra'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Formulario ===== */}
      {showForm && (
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="card-title mb-0">
              <i className={`bi ${isFiscalForm ? 'bi-bank' : 'bi-truck'} me-2`}></i>
              {editingAddress ? 'Editar' : 'Nueva'} dirección {isFiscalForm ? 'fiscal' : formData.addressType === 'shipping' ? 'de entrega' : ''}
            </h6>
          </div>
          <div className="card-body">
            {editingAddress && !editingAddress.street && editingAddress.addressLine1 && (
              <div className="alert alert-warning small">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Dirección capturada en formato anterior: <strong>{editingAddress.addressLine1}
                {editingAddress.addressLine2 ? `, ${editingAddress.addressLine2}` : ''}</strong>.
                Captura los campos nuevos y al guardar se mostrarán en su lugar.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* CP primero: autollenado */}
                <div className="col-md-4">
                  <label htmlFor="postalCode" className="form-label">
                    Código postal {isFiscalForm && <span className="text-danger">*</span>}
                  </label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    disabled={isLoading}
                    placeholder="Ej. 06600"
                    required={isFiscalForm}
                  />
                  {cpStatus === 'loading' && (
                    <div className="form-text"><span className="spinner-border spinner-border-sm me-1" />Buscando...</div>
                  )}
                  {cpStatus === 'found' && cpInfo && (
                    <div className="form-text text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      {cpInfo.municipio || cpInfo.estado}, {cpInfo.estado}
                    </div>
                  )}
                  {cpStatus === 'notfound' && (
                    <div className="form-text text-warning">
                      CP fuera del catálogo; captura los datos manualmente.
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label htmlFor="state" className="form-label">Estado</label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Ciudad de México"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="municipality" className="form-label">Municipio o alcaldía</label>
                  <Input
                    id="municipality"
                    type="text"
                    value={formData.municipality}
                    onChange={(e) => updateField('municipality', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Cuauhtémoc"
                  />
                </div>

                {/* Colonia: select del catalogo con salida a texto libre */}
                <div className="col-md-6">
                  <label htmlFor="neighborhood" className="form-label">Colonia</label>
                  {coloniaOptions.length > 0 && !coloniaLibre ? (
                    <select
                      id="neighborhood"
                      className="form-select"
                      value={coloniaSelectValue}
                      onChange={(e) => {
                        if (e.target.value === OTRA_COLONIA) {
                          setColoniaLibre(true)
                          updateField('neighborhood', '')
                        } else {
                          updateField('neighborhood', e.target.value)
                        }
                      }}
                      disabled={isLoading}
                    >
                      <option value="">Selecciona la colonia...</option>
                      {coloniaOptions.map(colonia => (
                        <option key={colonia.clave} value={colonia.nombre}>{colonia.nombre}</option>
                      ))}
                      <option value={OTRA_COLONIA}>Otra colonia (capturar)</option>
                    </select>
                  ) : (
                    <Input
                      id="neighborhood"
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => updateField('neighborhood', e.target.value)}
                      disabled={isLoading}
                      placeholder="Ej. Juárez"
                    />
                  )}
                  {coloniaLibre && coloniaOptions.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      onClick={() => setColoniaLibre(false)}
                    >
                      Volver a la lista del CP
                    </button>
                  )}
                </div>

                {/* Calle y numeros: texto libre (Mz 3 Lt 3 es valido) */}
                <div className="col-md-6">
                  <label htmlFor="street" className="form-label">
                    Calle <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Av. Insurgentes Sur (o Mz 3 Lt 3)"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label htmlFor="exteriorNumber" className="form-label">Número exterior</label>
                  <Input
                    id="exteriorNumber"
                    type="text"
                    value={formData.exteriorNumber}
                    onChange={(e) => updateField('exteriorNumber', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. 1234 o Mz 3 Lt 3"
                  />
                </div>

                <div className="col-md-3">
                  <label htmlFor="interiorNumber" className="form-label">Número interior</label>
                  <Input
                    id="interiorNumber"
                    type="text"
                    value={formData.interiorNumber}
                    onChange={(e) => updateField('interiorNumber', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Int 103"
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="country" className="form-label">País</label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Referencia: una linea (campo Referencia del SAT) */}
                <div className="col-12">
                  <label htmlFor="reference" className="form-label">Referencia</label>
                  <Input
                    id="reference"
                    type="text"
                    value={formData.reference}
                    onChange={(e) => updateField('reference', e.target.value)}
                    disabled={isLoading}
                    placeholder="Frente a una escuela o en una esquina"
                  />
                </div>

                {formData.addressType === 'shipping' && (
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => updateField('isDefault', e.target.checked)}
                        disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor="isDefault">
                        Dirección de entrega predeterminada
                      </label>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                      <i className="bi bi-check-lg me-1"></i>
                      {editingAddress ? 'Actualizar' : 'Guardar'} dirección
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State global */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-4">
          <i className="bi bi-geo-alt text-muted mb-2" style={{ fontSize: '2.5rem' }}></i>
          <p className="text-muted small mb-0">
            Agrega la dirección fiscal y las direcciones de entrega de este contacto.
          </p>
        </div>
      )}
    </div>
  )
}
