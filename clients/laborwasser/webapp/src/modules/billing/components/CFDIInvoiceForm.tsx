'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useActiveCompanySetting } from '../hooks'
import type { CFDIInvoice, CFDIInvoiceFormData, TipoComprobante, CFDIStatus, MetodoPago } from '../types'

interface CFDIInvoiceFormProps {
  invoice?: CFDIInvoice
  isLoading?: boolean
  onSubmit: (data: CFDIInvoiceFormData) => Promise<void>
  onCancel?: () => void
}

const TIPO_COMPROBANTE_OPTIONS: { value: TipoComprobante; label: string }[] = [
  { value: 'I', label: 'Ingreso' },
  { value: 'E', label: 'Egreso' },
  { value: 'T', label: 'Traslado' },
  { value: 'N', label: 'Nomina' },
  { value: 'P', label: 'Pago' },
]

const METODO_PAGO_OPTIONS: { value: MetodoPago; label: string }[] = [
  { value: 'PUE', label: 'Pago en Una Exhibicion' },
  { value: 'PPD', label: 'Pago en Parcialidades o Diferido' },
]

const FORMA_PAGO_OPTIONS = [
  { value: '01', label: '01 - Efectivo' },
  { value: '02', label: '02 - Cheque nominativo' },
  { value: '03', label: '03 - Transferencia electronica de fondos' },
  { value: '04', label: '04 - Tarjeta de credito' },
  { value: '28', label: '28 - Tarjeta de debito' },
  { value: '99', label: '99 - Por definir' },
]

const USO_CFDI_OPTIONS = [
  { value: 'G01', label: 'G01 - Adquisicion de mercancias' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'I04', label: 'I04 - Equipo de computo y accesorios' },
  { value: 'P01', label: 'P01 - Por definir' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
]

const MONEDA_OPTIONS = [
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
  { value: 'USD', label: 'USD - Dolar Americano' },
  { value: 'EUR', label: 'EUR - Euro' },
]

export const CFDIInvoiceForm: React.FC<CFDIInvoiceFormProps> = ({
  invoice,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const { activeSetting, isLoading: settingLoading } = useActiveCompanySetting()

  const [formData, setFormData] = useState({
    companySettingId: invoice?.companySettingId?.toString() || '',
    contactId: invoice?.contactId?.toString() || '',
    series: invoice?.series || activeSetting?.invoiceSeries || 'A',
    tipoComprobante: (invoice?.tipoComprobante || 'I') as TipoComprobante,
    receptorRfc: invoice?.receptorRfc || '',
    receptorNombre: invoice?.receptorNombre || '',
    receptorUsoCfdi: invoice?.receptorUsoCfdi || 'G03',
    receptorRegimenFiscal: invoice?.receptorRegimenFiscal || '601',
    receptorDomicilioFiscal: invoice?.receptorDomicilioFiscal || '',
    subtotal: invoice?.subtotal?.toString() || '0',
    total: invoice?.total?.toString() || '0',
    descuento: invoice?.descuento?.toString() || '0',
    iva: invoice?.iva?.toString() || '0',
    ieps: invoice?.ieps?.toString() || '0',
    isrRetenido: invoice?.isrRetenido?.toString() || '0',
    ivaRetenido: invoice?.ivaRetenido?.toString() || '0',
    moneda: invoice?.moneda || 'MXN',
    tipoCambio: invoice?.tipoCambio?.toString() || '1',
    formaPago: invoice?.formaPago || '03',
    metodoPago: (invoice?.metodoPago || 'PUE') as MetodoPago,
    condicionesPago: invoice?.condicionesPago || '',
    status: (invoice?.status || 'draft') as CFDIStatus,
    fechaEmision: invoice?.fechaEmision || new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (invoice) {
      setFormData({
        companySettingId: invoice.companySettingId?.toString() || '',
        contactId: invoice.contactId?.toString() || '',
        series: invoice.series || 'A',
        tipoComprobante: invoice.tipoComprobante || 'I',
        receptorRfc: invoice.receptorRfc || '',
        receptorNombre: invoice.receptorNombre || '',
        receptorUsoCfdi: invoice.receptorUsoCfdi || 'G03',
        receptorRegimenFiscal: invoice.receptorRegimenFiscal || '601',
        receptorDomicilioFiscal: invoice.receptorDomicilioFiscal || '',
        subtotal: invoice.subtotal?.toString() || '0',
        total: invoice.total?.toString() || '0',
        descuento: invoice.descuento?.toString() || '0',
        iva: invoice.iva?.toString() || '0',
        ieps: invoice.ieps?.toString() || '0',
        isrRetenido: invoice.isrRetenido?.toString() || '0',
        ivaRetenido: invoice.ivaRetenido?.toString() || '0',
        moneda: invoice.moneda || 'MXN',
        tipoCambio: invoice.tipoCambio?.toString() || '1',
        formaPago: invoice.formaPago || '03',
        metodoPago: invoice.metodoPago || 'PUE',
        condicionesPago: invoice.condicionesPago || '',
        status: invoice.status || 'draft',
        fechaEmision: invoice.fechaEmision || new Date().toISOString().split('T')[0]
      })
    }
  }, [invoice])

  useEffect(() => {
    if (activeSetting && !invoice) {
      setFormData(prev => ({
        ...prev,
        companySettingId: activeSetting.id,
        series: activeSetting.invoiceSeries || prev.series
      }))
    }
  }, [activeSetting, invoice])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.receptorRfc.trim()) {
      newErrors.receptorRfc = 'El RFC del receptor es requerido'
    } else if (!/^[A-Z&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(formData.receptorRfc)) {
      newErrors.receptorRfc = 'RFC invalido'
    }

    if (!formData.receptorNombre.trim()) {
      newErrors.receptorNombre = 'El nombre del receptor es requerido'
    }

    if (!formData.receptorDomicilioFiscal.trim()) {
      newErrors.receptorDomicilioFiscal = 'El codigo postal es requerido'
    }

    if (parseFloat(formData.total) <= 0) {
      newErrors.total = 'El total debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData: CFDIInvoiceFormData = {
      companySettingId: parseInt(formData.companySettingId) || parseInt(activeSetting?.id || '0'),
      contactId: parseInt(formData.contactId) || 0,
      series: formData.series,
      tipoComprobante: formData.tipoComprobante,
      receptorRfc: formData.receptorRfc.toUpperCase(),
      receptorNombre: formData.receptorNombre,
      receptorUsoCfdi: formData.receptorUsoCfdi,
      receptorRegimenFiscal: formData.receptorRegimenFiscal,
      receptorDomicilioFiscal: formData.receptorDomicilioFiscal,
      subtotal: Math.round(parseFloat(formData.subtotal) * 100), // Convert to cents
      total: Math.round(parseFloat(formData.total) * 100),
      descuento: Math.round(parseFloat(formData.descuento) * 100),
      iva: Math.round(parseFloat(formData.iva) * 100),
      ieps: Math.round(parseFloat(formData.ieps) * 100),
      isrRetenido: Math.round(parseFloat(formData.isrRetenido) * 100),
      ivaRetenido: Math.round(parseFloat(formData.ivaRetenido) * 100),
      moneda: formData.moneda,
      tipoCambio: parseFloat(formData.tipoCambio),
      formaPago: formData.formaPago,
      metodoPago: formData.metodoPago,
      condicionesPago: formData.condicionesPago || undefined,
      status: formData.status,
      fechaEmision: formData.fechaEmision
    }

    await onSubmit(submitData)
  }

  const isFormLoading = isLoading || settingLoading

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-lg-8">
          {/* Receptor Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-person me-2"></i>
                Datos del Receptor
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Input
                    label="RFC"
                    type="text"
                    value={formData.receptorRfc}
                    onChange={(e) => handleInputChange('receptorRfc', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('receptorRfc')}
                    errorText={touched.receptorRfc ? errors.receptorRfc : ''}
                    required
                    placeholder="XAXX010101000"
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-8">
                  <Input
                    label="Razon Social / Nombre"
                    type="text"
                    value={formData.receptorNombre}
                    onChange={(e) => handleInputChange('receptorNombre', e.target.value)}
                    onBlur={() => handleBlur('receptorNombre')}
                    errorText={touched.receptorNombre ? errors.receptorNombre : ''}
                    required
                    placeholder="Nombre completo o razon social"
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Codigo Postal"
                    type="text"
                    value={formData.receptorDomicilioFiscal}
                    onChange={(e) => handleInputChange('receptorDomicilioFiscal', e.target.value)}
                    onBlur={() => handleBlur('receptorDomicilioFiscal')}
                    errorText={touched.receptorDomicilioFiscal ? errors.receptorDomicilioFiscal : ''}
                    required
                    placeholder="00000"
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Regimen Fiscal"
                    type="text"
                    value={formData.receptorRegimenFiscal}
                    onChange={(e) => handleInputChange('receptorRegimenFiscal', e.target.value)}
                    onBlur={() => handleBlur('receptorRegimenFiscal')}
                    placeholder="601"
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Uso del CFDI"
                    type="select"
                    value={formData.receptorUsoCfdi}
                    onChange={(e) => handleInputChange('receptorUsoCfdi', e.target.value)}
                    onBlur={() => handleBlur('receptorUsoCfdi')}
                    disabled={isFormLoading}
                    options={USO_CFDI_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-receipt me-2"></i>
                Detalles del Comprobante
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Input
                    label="Serie"
                    type="text"
                    value={formData.series}
                    onChange={(e) => handleInputChange('series', e.target.value)}
                    onBlur={() => handleBlur('series')}
                    placeholder="A"
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Tipo de Comprobante"
                    type="select"
                    value={formData.tipoComprobante}
                    onChange={(e) => handleInputChange('tipoComprobante', e.target.value)}
                    onBlur={() => handleBlur('tipoComprobante')}
                    disabled={isFormLoading}
                    options={TIPO_COMPROBANTE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Fecha de Emision"
                    type="date"
                    value={formData.fechaEmision}
                    onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
                    onBlur={() => handleBlur('fechaEmision')}
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Forma de Pago"
                    type="select"
                    value={formData.formaPago}
                    onChange={(e) => handleInputChange('formaPago', e.target.value)}
                    onBlur={() => handleBlur('formaPago')}
                    disabled={isFormLoading}
                    options={FORMA_PAGO_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Metodo de Pago"
                    type="select"
                    value={formData.metodoPago}
                    onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                    onBlur={() => handleBlur('metodoPago')}
                    disabled={isFormLoading}
                    options={METODO_PAGO_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Moneda"
                    type="select"
                    value={formData.moneda}
                    onChange={(e) => handleInputChange('moneda', e.target.value)}
                    onBlur={() => handleBlur('moneda')}
                    disabled={isFormLoading}
                    options={MONEDA_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  />
                </div>

                {formData.moneda !== 'MXN' && (
                  <div className="col-md-4">
                    <Input
                      label="Tipo de Cambio"
                      type="number"
                      value={formData.tipoCambio}
                      onChange={(e) => handleInputChange('tipoCambio', e.target.value)}
                      onBlur={() => handleBlur('tipoCambio')}
                      step="0.0001"
                      min="0"
                      disabled={isFormLoading}
                    />
                  </div>
                )}

                <div className="col-12">
                  <Input
                    label="Condiciones de Pago"
                    type="text"
                    value={formData.condicionesPago}
                    onChange={(e) => handleInputChange('condicionesPago', e.target.value)}
                    onBlur={() => handleBlur('condicionesPago')}
                    placeholder="Ej: Pago a 30 dias"
                    disabled={isFormLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Amounts Card */}
          <div className="card sticky-top" style={{ top: '1rem' }}>
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-calculator me-2"></i>
                Importes
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <Input
                  label="Subtotal"
                  type="number"
                  value={formData.subtotal}
                  onChange={(e) => handleInputChange('subtotal', e.target.value)}
                  onBlur={() => handleBlur('subtotal')}
                  step="0.01"
                  min="0"
                  leftIcon="bi-currency-dollar"
                  disabled={isFormLoading}
                />
              </div>

              <div className="mb-3">
                <Input
                  label="Descuento"
                  type="number"
                  value={formData.descuento}
                  onChange={(e) => handleInputChange('descuento', e.target.value)}
                  onBlur={() => handleBlur('descuento')}
                  step="0.01"
                  min="0"
                  leftIcon="bi-dash-circle"
                  disabled={isFormLoading}
                />
              </div>

              <div className="mb-3">
                <Input
                  label="IVA (16%)"
                  type="number"
                  value={formData.iva}
                  onChange={(e) => handleInputChange('iva', e.target.value)}
                  onBlur={() => handleBlur('iva')}
                  step="0.01"
                  min="0"
                  leftIcon="bi-percent"
                  disabled={isFormLoading}
                />
              </div>

              <hr />

              <div className="mb-3">
                <Input
                  label="Total"
                  type="number"
                  value={formData.total}
                  onChange={(e) => handleInputChange('total', e.target.value)}
                  onBlur={() => handleBlur('total')}
                  errorText={touched.total ? errors.total : ''}
                  step="0.01"
                  min="0"
                  leftIcon="bi-currency-dollar"
                  disabled={isFormLoading}
                  required
                />
              </div>
            </div>
            <div className="card-footer">
              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isFormLoading}
                >
                  <i className="bi bi-check-lg me-2" />
                  {invoice ? 'Actualizar CFDI' : 'Crear CFDI'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default CFDIInvoiceForm
