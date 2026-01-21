'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useCompanySettings,
  useActiveCompanySetting,
  useCompanySettingsMutations,
} from '@/modules/billing/hooks'
import type { CompanySetting, CompanySettingFormData } from '@/modules/billing/types'

// =============================================================================
// COMPANY SETTING FORM COMPONENT
// =============================================================================

interface CompanySettingFormProps {
  setting?: CompanySetting | null
  onSubmit: (data: CompanySettingFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

function CompanySettingForm({
  setting,
  onSubmit,
  onCancel,
  isLoading,
}: CompanySettingFormProps) {
  const [formData, setFormData] = useState<CompanySettingFormData>({
    companyName: setting?.companyName || '',
    rfc: setting?.rfc || '',
    taxRegime: setting?.taxRegime || '601',
    postalCode: setting?.postalCode || '',
    invoiceSeries: setting?.invoiceSeries || 'A',
    creditNoteSeries: setting?.creditNoteSeries || 'NC',
    nextInvoiceFolio: setting?.nextInvoiceFolio || 1,
    nextCreditNoteFolio: setting?.nextCreditNoteFolio || 1,
    pacProvider: setting?.pacProvider || 'sw',
    pacUsername: setting?.pacUsername || '',
    pacPassword: '',
    pacProductionMode: setting?.pacProductionMode || false,
    certificateFile: setting?.certificateFile || '',
    keyFile: setting?.keyFile || '',
    keyPassword: '',
    logoPath: setting?.logoPath || '',
    isActive: setting?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value, 10)
            : value,
    }))
  }

  // Tax regimes from SAT catalog
  const taxRegimes = [
    { code: '601', name: 'General de Ley Personas Morales' },
    { code: '603', name: 'Personas Morales con Fines no Lucrativos' },
    { code: '605', name: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { code: '606', name: 'Arrendamiento' },
    { code: '607', name: 'Régimen de Enajenación o Adquisición de Bienes' },
    { code: '608', name: 'Demás ingresos' },
    { code: '610', name: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
    { code: '611', name: 'Ingresos por Dividendos' },
    { code: '612', name: 'Personas Físicas con Actividades Empresariales y Profesionales' },
    { code: '614', name: 'Ingresos por intereses' },
    { code: '615', name: 'Régimen de los ingresos por obtención de premios' },
    { code: '616', name: 'Sin obligaciones fiscales' },
    { code: '620', name: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
    { code: '621', name: 'Incorporación Fiscal' },
    { code: '622', name: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
    { code: '623', name: 'Opcional para Grupos de Sociedades' },
    { code: '624', name: 'Coordinados' },
    { code: '625', name: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
    { code: '626', name: 'Régimen Simplificado de Confianza' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-building me-2" />
            Datos Fiscales de la Empresa
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Razón Social *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="form-control"
                required
                placeholder="Mi Empresa S.A. de C.V."
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">RFC *</label>
              <input
                type="text"
                name="rfc"
                value={formData.rfc}
                onChange={handleChange}
                className="form-control"
                required
                maxLength={13}
                placeholder="XAXX010101000"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Régimen Fiscal *</label>
              <select
                name="taxRegime"
                value={formData.taxRegime}
                onChange={handleChange}
                className="form-select"
                required
              >
                {taxRegimes.map((regime) => (
                  <option key={regime.code} value={regime.code}>
                    {regime.code} - {regime.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Código Postal *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="form-control"
                required
                maxLength={5}
                placeholder="06600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-list-ol me-2" />
            Series y Folios
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <label className="form-label">Serie Factura</label>
              <input
                type="text"
                name="invoiceSeries"
                value={formData.invoiceSeries}
                onChange={handleChange}
                className="form-control"
                maxLength={10}
                placeholder="A"
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Próximo Folio</label>
              <input
                type="number"
                name="nextInvoiceFolio"
                value={formData.nextInvoiceFolio}
                onChange={handleChange}
                className="form-control"
                min={1}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Serie Nota Crédito</label>
              <input
                type="text"
                name="creditNoteSeries"
                value={formData.creditNoteSeries}
                onChange={handleChange}
                className="form-control"
                maxLength={10}
                placeholder="NC"
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Próximo Folio</label>
              <input
                type="number"
                name="nextCreditNoteFolio"
                value={formData.nextCreditNoteFolio}
                onChange={handleChange}
                className="form-control"
                min={1}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-plug me-2" />
            Conexión PAC (Proveedor de Timbrado)
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Proveedor PAC</label>
              <select
                name="pacProvider"
                value={formData.pacProvider}
                onChange={handleChange}
                className="form-select"
              >
                <option value="sw">SW (Smarter Web)</option>
                <option value="finkok">Finkok</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Usuario PAC</label>
              <input
                type="text"
                name="pacUsername"
                value={formData.pacUsername}
                onChange={handleChange}
                className="form-control"
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">
                Contraseña PAC {setting ? '(dejar vacío para no cambiar)' : ''}
              </label>
              <input
                type="password"
                name="pacPassword"
                value={formData.pacPassword}
                onChange={handleChange}
                className="form-control"
                placeholder="••••••••"
              />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="pacProductionMode"
                  checked={formData.pacProductionMode}
                  onChange={handleChange}
                  className="form-check-input"
                  id="pacProductionMode"
                />
                <label className="form-check-label" htmlFor="pacProductionMode">
                  <strong>Modo Producción</strong>
                  <span className="text-muted ms-2">
                    (Desmarcar para usar ambiente de pruebas)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-file-earmark-lock me-2" />
            Certificados SAT (CSD)
          </h5>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2" />
            Los certificados se suben después de guardar la configuración.
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Ruta Certificado (.cer)</label>
              <input
                type="text"
                name="certificateFile"
                value={formData.certificateFile}
                onChange={handleChange}
                className="form-control"
                placeholder="storage/certificates/mi_empresa.cer"
                readOnly={!!setting}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Ruta Llave (.key)</label>
              <input
                type="text"
                name="keyFile"
                value={formData.keyFile}
                onChange={handleChange}
                className="form-control"
                placeholder="storage/certificates/mi_empresa.key"
                readOnly={!!setting}
              />
            </div>
            {!setting && (
              <div className="col-12 col-md-6">
                <label className="form-label">Contraseña de Llave</label>
                <input
                  type="password"
                  name="keyPassword"
                  value={formData.keyPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-gear me-2" />
            Opciones Adicionales
          </h5>
        </div>
        <div className="card-body">
          <div className="form-check">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="form-check-input"
              id="isActive"
            />
            <label className="form-check-label" htmlFor="isActive">
              <strong>Configuración Activa</strong>
              <span className="text-muted ms-2">
                (Solo puede haber una configuración activa)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Guardando...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2" />
              {setting ? 'Actualizar Configuración' : 'Crear Configuración'}
            </>
          )}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// =============================================================================
// CERTIFICATE UPLOAD COMPONENT
// =============================================================================

interface CertificateUploadProps {
  settingId: string
  onSuccess: () => void
}

function CertificateUpload({ settingId, onSuccess }: CertificateUploadProps) {
  const { uploadCertificate, uploadKey } = useCompanySettingsMutations()
  const [isUploadingCer, setIsUploadingCer] = useState(false)
  const [isUploadingKey, setIsUploadingKey] = useState(false)
  const [keyPassword, setKeyPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingCer(true)
    setMessage(null)
    try {
      await uploadCertificate(settingId, file)
      setMessage({ type: 'success', text: 'Certificado .cer subido correctamente' })
      onSuccess()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al subir certificado: ' + (error as Error).message })
    } finally {
      setIsUploadingCer(false)
    }
  }

  const handleKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!keyPassword) {
      setMessage({ type: 'error', text: 'Ingresa la contraseña de la llave antes de subir' })
      return
    }

    setIsUploadingKey(true)
    setMessage(null)
    try {
      await uploadKey(settingId, file, keyPassword)
      setMessage({ type: 'success', text: 'Llave .key subida correctamente' })
      setKeyPassword('')
      onSuccess()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al subir llave: ' + (error as Error).message })
    } finally {
      setIsUploadingKey(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-upload me-2" />
          Subir Certificados
        </h5>
      </div>
      <div className="card-body">
        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-3`}>
            <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`} />
            {message.text}
          </div>
        )}

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Certificado (.cer)</label>
            <input
              type="file"
              accept=".cer"
              onChange={handleCerUpload}
              className="form-control"
              disabled={isUploadingCer}
            />
            {isUploadingCer && (
              <div className="text-muted small mt-1">
                <span className="spinner-border spinner-border-sm me-1" />
                Subiendo...
              </div>
            )}
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Llave Privada (.key)</label>
            <div className="input-group mb-2">
              <input
                type="password"
                value={keyPassword}
                onChange={(e) => setKeyPassword(e.target.value)}
                className="form-control"
                placeholder="Contraseña de la llave"
              />
            </div>
            <input
              type="file"
              accept=".key"
              onChange={handleKeyUpload}
              className="form-control"
              disabled={isUploadingKey || !keyPassword}
            />
            {isUploadingKey && (
              <div className="text-muted small mt-1">
                <span className="spinner-border spinner-border-sm me-1" />
                Subiendo...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function BillingSettingsPage() {
  const { settings, isLoading: isLoadingSettings, mutate } = useCompanySettings()
  const { mutate: mutateActive } = useActiveCompanySetting()
  const { createSetting, updateSetting, deleteSetting, testPACConnection } =
    useCompanySettingsMutations()

  const [showForm, setShowForm] = useState(false)
  const [editingSetting, setEditingSetting] = useState<CompanySetting | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    settingId: string
    success: boolean
    message: string
  } | null>(null)

  const handleCreate = () => {
    setEditingSetting(null)
    setShowForm(true)
  }

  const handleEdit = (setting: CompanySetting) => {
    setEditingSetting(setting)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSetting(null)
  }

  const handleSubmit = async (data: CompanySettingFormData) => {
    setIsSubmitting(true)
    try {
      if (editingSetting) {
        await updateSetting(editingSetting.id, data)
      } else {
        await createSetting(data)
      }
      mutate()
      mutateActive()
      setShowForm(false)
      setEditingSetting(null)
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Error al guardar: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta configuración?')) return

    try {
      await deleteSetting(id)
      mutate()
      mutateActive()
    } catch (error) {
      console.error('Error deleting setting:', error)
      alert('Error al eliminar: ' + (error as Error).message)
    }
  }

  const handleTestPAC = async (id: string) => {
    setIsTesting(id)
    setTestResult(null)
    try {
      const result = await testPACConnection(id)
      setTestResult({ settingId: id, ...result })
    } catch (error) {
      setTestResult({
        settingId: id,
        success: false,
        message: 'Error de conexión: ' + (error as Error).message,
      })
    } finally {
      setIsTesting(null)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard/billing">Facturación</Link>
              </li>
              <li className="breadcrumb-item active">Configuración Fiscal</li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-building me-3" />
                Configuración Fiscal
              </h1>
              <p className="text-muted mb-0">
                Gestión de datos fiscales, certificados SAT (CSD) y conexión con PAC
              </p>
            </div>
            {!showForm && (
              <button className="btn btn-primary" onClick={handleCreate}>
                <i className="bi bi-plus-lg me-2" />
                Nueva Configuración
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-4">
          <CompanySettingForm
            setting={editingSetting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Settings List */}
      {!showForm && (
        <>
          {settings.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2" />
              No hay configuraciones fiscales. Crea una para comenzar a facturar.
            </div>
          ) : (
            <div className="row g-4">
              {settings.map((setting) => (
                <div key={setting.id} className="col-12">
                  <div className={`card ${setting.isActive ? 'border-primary' : ''}`}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-0">
                          {setting.companyName}
                          {setting.isActive && (
                            <span className="badge bg-primary ms-2">Activa</span>
                          )}
                        </h5>
                        <span className="text-muted">RFC: {setting.rfc}</span>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(setting)}
                        >
                          <i className="bi bi-pencil me-1" />
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(setting.id)}
                        >
                          <i className="bi bi-trash me-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {/* Fiscal Info */}
                        <div className="col-12 col-md-4">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-building me-2" />
                            Datos Fiscales
                          </h6>
                          <ul className="list-unstyled mb-0">
                            <li>
                              <strong>Régimen:</strong> {setting.taxRegime}
                            </li>
                            <li>
                              <strong>C.P.:</strong> {setting.postalCode}
                            </li>
                          </ul>
                        </div>

                        {/* Series & Folios */}
                        <div className="col-12 col-md-4">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-list-ol me-2" />
                            Series y Folios
                          </h6>
                          <ul className="list-unstyled mb-0">
                            <li>
                              <strong>Factura:</strong> {setting.invoiceSeries}-
                              {setting.nextInvoiceFolio}
                            </li>
                            <li>
                              <strong>Nota Crédito:</strong> {setting.creditNoteSeries}-
                              {setting.nextCreditNoteFolio}
                            </li>
                          </ul>
                        </div>

                        {/* PAC */}
                        <div className="col-12 col-md-4">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-plug me-2" />
                            Conexión PAC
                          </h6>
                          <ul className="list-unstyled mb-0">
                            <li>
                              <strong>Proveedor:</strong>{' '}
                              {setting.pacProvider === 'sw' ? 'SW (Smarter Web)' : setting.pacProvider}
                            </li>
                            <li>
                              <strong>Usuario:</strong> {setting.pacUsername || '(no configurado)'}
                            </li>
                            <li>
                              <strong>Modo:</strong>{' '}
                              <span
                                className={`badge ${setting.pacProductionMode ? 'bg-success' : 'bg-warning'}`}
                              >
                                {setting.pacProductionMode ? 'Producción' : 'Pruebas'}
                              </span>
                            </li>
                          </ul>
                          <button
                            className="btn btn-sm btn-outline-secondary mt-2"
                            onClick={() => handleTestPAC(setting.id)}
                            disabled={isTesting === setting.id}
                          >
                            {isTesting === setting.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Probando...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-arrow-repeat me-1" />
                                Probar Conexión
                              </>
                            )}
                          </button>
                          {testResult && testResult.settingId === setting.id && (
                            <div
                              className={`alert alert-${testResult.success ? 'success' : 'danger'} mt-2 mb-0 py-2`}
                            >
                              <small>
                                <i
                                  className={`bi bi-${testResult.success ? 'check-circle' : 'exclamation-triangle'} me-1`}
                                />
                                {testResult.message}
                              </small>
                            </div>
                          )}
                        </div>

                        {/* Certificates */}
                        <div className="col-12">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-file-earmark-lock me-2" />
                            Certificados SAT (CSD)
                          </h6>
                          <div className="row g-2">
                            <div className="col-12 col-md-6">
                              <div className="bg-light rounded p-2">
                                <small>
                                  <strong>.cer:</strong>{' '}
                                  {setting.certificateFile || (
                                    <span className="text-danger">No configurado</span>
                                  )}
                                </small>
                              </div>
                            </div>
                            <div className="col-12 col-md-6">
                              <div className="bg-light rounded p-2">
                                <small>
                                  <strong>.key:</strong>{' '}
                                  {setting.keyFile || (
                                    <span className="text-danger">No configurado</span>
                                  )}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Upload */}
                    <div className="card-footer">
                      <CertificateUpload settingId={setting.id} onSuccess={() => mutate()} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
