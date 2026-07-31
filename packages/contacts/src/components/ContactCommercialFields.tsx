/**
 * CONTACT COMMERCIAL & FISCAL FIELDS
 * Seccion reutilizable "Datos comerciales y fiscales" (nota cliente #10).
 * Se comparte entre ContactForm (form simple) y ContactFormTabs (tab basico).
 *
 * Campo estrella: "Vendedor asignado" (defaultSalespersonId) para comisiones.
 */

'use client'

import React from 'react'
import { Input } from '@lwm/ui'
import { useUsers } from '@lwm/permissions'
import type { ContactFormData } from '../types'
import type { SatCatalogEntry } from '../utils/satCatalogs'
import { useContactCatalogs } from '../hooks/useContactCatalogs'

// Roles considerados "vendibles" para el select de vendedor/cobrador.
// Si un usuario no tiene rol o su rol no esta aqui, igual se muestra en la
// lista completa (fallback), pero estos aparecen priorizados.
const SALES_ROLES = ['god', 'admin', 'tech', 'vendedor', 'salesperson']

interface ContactCommercialFieldsProps {
  formData: ContactFormData
  updateField: <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => void
  isLoading?: boolean
}

export const ContactCommercialFields: React.FC<ContactCommercialFieldsProps> = ({
  formData,
  updateField,
  isLoading = false,
}) => {
  const { users, loading: usersLoading } = useUsers()
  // Catalogos desde el backend (misma fuente que valida ContactRequest);
  // el estatico local solo entra como fallback si el endpoint falla.
  const { regimenesFiscales, usosCfdi } = useContactCatalogs()

  // Priorizar usuarios con rol vendible; si ninguno matchea, usar todos.
  const sellableUsers = React.useMemo(() => {
    const matches = users.filter((u) =>
      (u.roles || []).some((r) => SALES_ROLES.includes(r.name)) ||
      (u.role ? SALES_ROLES.includes(u.role) : false)
    )
    return matches.length > 0 ? matches : users
  }, [users])

  const userOptions = (
    <>
      <option value="">Sin asignar</option>
      {sellableUsers.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}{u.email ? ` (${u.email})` : ''}
        </option>
      ))}
    </>
  )

  // Helpers para inputs numericos nullable: '' -> null explicito (limpiar).
  const numberOrNull = (raw: string): number | null =>
    raw.trim() === '' ? null : Number(raw)

  // Opciones de un catalogo SAT. Si el contacto trae guardado un valor que
  // ya no esta en el catalogo (texto libre de antes del fix), se agrega como
  // opcion extra para no perderlo silenciosamente al editar.
  const satOptions = (catalog: SatCatalogEntry[], current?: string | null) => {
    const known = catalog.some((entry) => entry.code === current)
    return (
      <>
        <option value="">Sin especificar</option>
        {current && !known && (
          <option value={current}>{current} (valor guardado, revisar)</option>
        )}
        {catalog.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.code} - {entry.label}
          </option>
        ))}
      </>
    )
  }

  return (
    <>
      <div className="col-12">
        <h5 className="mb-3 mt-4">
          <i className="bi bi-cash-coin me-2"></i>
          Datos comerciales y fiscales
        </h5>
      </div>

      {/* Vendedor asignado (campo estrella - comisiones) */}
      <div className="col-md-6">
        <label htmlFor="defaultSalespersonId" className="form-label">
          <i className="bi bi-person-badge me-1"></i>
          Vendedor asignado
        </label>
        <select
          id="defaultSalespersonId"
          className="form-select"
          value={formData.defaultSalespersonId ?? ''}
          onChange={(e) =>
            updateField('defaultSalespersonId', e.target.value ? Number(e.target.value) : null)
          }
          disabled={isLoading || usersLoading}
        >
          {userOptions}
        </select>
        <div className="form-text">Responsable de ventas para el calculo de comisiones.</div>
      </div>

      {/* Agente de cobranza */}
      <div className="col-md-6">
        <label htmlFor="collectionsAgentId" className="form-label">
          <i className="bi bi-person-check me-1"></i>
          Agente de cobranza
        </label>
        <select
          id="collectionsAgentId"
          className="form-select"
          value={formData.collectionsAgentId ?? ''}
          onChange={(e) =>
            updateField('collectionsAgentId', e.target.value ? Number(e.target.value) : null)
          }
          disabled={isLoading || usersLoading}
        >
          {userOptions}
        </select>
      </div>

      {/* % comision override */}
      <div className="col-md-6">
        <label htmlFor="commissionPctOverride" className="form-label">
          % comision (override)
        </label>
        <Input
          id="commissionPctOverride"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={formData.commissionPctOverride?.toString() ?? ''}
          onChange={(e) => updateField('commissionPctOverride', numberOrNull(e.target.value))}
          disabled={isLoading}
          placeholder="Usa el % del vendedor si se deja vacio"
        />
      </div>

      {/* Descuento pactado % */}
      <div className="col-md-6">
        <label htmlFor="discountPct" className="form-label">
          Descuento pactado %
        </label>
        <Input
          id="discountPct"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={formData.discountPct?.toString() ?? ''}
          onChange={(e) => updateField('discountPct', numberOrNull(e.target.value))}
          disabled={isLoading}
          placeholder="0"
        />
      </div>

      {/* Regimen fiscal SAT. Select con el catalogo espejo del backend: como
          texto libre, el usuario (y el autofill del navegador) escribia
          "601 - General de Ley..." y el backend (Rule::in de codigos) lo
          rechazaba con 422 (bug 2026-07-30). Se envia SOLO el codigo. */}
      <div className="col-md-6">
        <label htmlFor="regimenFiscal" className="form-label">
          Regimen fiscal (SAT)
        </label>
        <select
          id="regimenFiscal"
          className="form-select"
          value={formData.regimenFiscal ?? ''}
          onChange={(e) => updateField('regimenFiscal', e.target.value || null)}
          disabled={isLoading}
        >
          {satOptions(regimenesFiscales, formData.regimenFiscal)}
        </select>
      </div>

      {/* Uso CFDI SAT (mismo tratamiento que regimen fiscal). */}
      <div className="col-md-6">
        <label htmlFor="usoCfdi" className="form-label">
          Uso CFDI (SAT)
        </label>
        <select
          id="usoCfdi"
          className="form-select"
          value={formData.usoCfdi ?? ''}
          onChange={(e) => updateField('usoCfdi', e.target.value || null)}
          disabled={isLoading}
        >
          {satOptions(usosCfdi, formData.usoCfdi)}
        </select>
      </div>

      {/* Credito (meses) */}
      <div className="col-md-6">
        <label htmlFor="creditMonths" className="form-label">
          Credito (meses)
        </label>
        <Input
          id="creditMonths"
          type="number"
          min="0"
          max="120"
          value={formData.creditMonths?.toString() ?? ''}
          onChange={(e) => updateField('creditMonths', numberOrNull(e.target.value))}
          disabled={isLoading}
          placeholder="0"
        />
      </div>

      {/* No. de cuenta bancaria */}
      <div className="col-md-6">
        <label htmlFor="bankAccountNumber" className="form-label">
          No. de cuenta bancaria
        </label>
        <Input
          id="bankAccountNumber"
          type="text"
          value={formData.bankAccountNumber ?? ''}
          onChange={(e) => updateField('bankAccountNumber', e.target.value)}
          disabled={isLoading}
          placeholder="Cuenta / CLABE del cliente"
        />
      </div>

      {/* Cuenta contable */}
      <div className="col-md-6">
        <label htmlFor="cuentaContable" className="form-label">
          Cuenta contable
        </label>
        <Input
          id="cuentaContable"
          type="text"
          value={formData.cuentaContable ?? ''}
          onChange={(e) => updateField('cuentaContable', e.target.value)}
          disabled={isLoading}
          placeholder="Ej. 105-01-001"
        />
      </div>

      {/* Como se entero de nosotros */}
      <div className="col-md-6">
        <label htmlFor="referralSource" className="form-label">
          ¿Como se entero de nosotros?
        </label>
        <Input
          id="referralSource"
          type="text"
          value={formData.referralSource ?? ''}
          onChange={(e) => updateField('referralSource', e.target.value)}
          disabled={isLoading}
          placeholder="Ej. Recomendacion, Google, Feria..."
        />
      </div>
    </>
  )
}
