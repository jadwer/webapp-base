'use client'

import Link from 'next/link'
import { useCFDIInvoices, useActiveCompanySetting } from '../hooks'

export function BillingIndexPage() {
  const { invoices, isLoading: invoicesLoading } = useCFDIInvoices()
  const { activeSetting, isLoading: settingLoading } = useActiveCompanySetting()

  // Calculate metrics
  const totalInvoices = invoices.length
  const draftInvoices = invoices.filter((inv) => inv.status === 'draft').length
  const stampedInvoices = invoices.filter(
    (inv) => inv.status === 'stamped' || inv.status === 'valid'
  ).length
  const totalAmount = invoices
    .filter((inv) => inv.status === 'stamped' || inv.status === 'valid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount / 100)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-receipt-cutoff me-3" />
            Facturación y Pagos
          </h1>
          <p className="text-muted">
            Gestión completa de facturación electrónica CFDI 4.0 (SAT México) y
            procesamiento de pagos con Stripe
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Facturas</h6>
                  <h3 className="mb-0">
                    {invoicesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      totalInvoices
                    )}
                  </h3>
                </div>
                <i className="bi bi-receipt fs-1 text-primary opacity-25" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Borradores</h6>
                  <h3 className="mb-0 text-secondary">
                    {invoicesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      draftInvoices
                    )}
                  </h3>
                </div>
                <i className="bi bi-file-earmark-text fs-1 text-secondary opacity-25" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Timbradas</h6>
                  <h3 className="mb-0 text-success">
                    {invoicesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      stampedInvoices
                    )}
                  </h3>
                </div>
                <i className="bi bi-award fs-1 text-success opacity-25" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Facturado</h6>
                  <h4 className="mb-0 text-success">
                    {invoicesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatCurrency(totalAmount)
                    )}
                  </h4>
                </div>
                <i className="bi bi-cash-stack fs-1 text-success opacity-25" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Settings Status */}
      {!settingLoading && !activeSetting && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Configuración requerida:</strong> No hay una configuración de empresa
          activa. Configure sus datos fiscales y certificados SAT para comenzar a facturar.
        </div>
      )}

      {activeSetting && (
        <div className="alert alert-success mb-4">
          <i className="bi bi-check-circle me-2" />
          <strong>Configuración activa:</strong> {activeSetting.companyName} (RFC:{' '}
          {activeSetting.rfc}) - PAC: {activeSetting.pacProvider.toUpperCase()} -{' '}
          {activeSetting.pacProductionMode ? 'Producción' : 'Pruebas'}
        </div>
      )}

      {/* Quick Access Cards */}
      <h5 className="mb-3">Acceso Rápido</h5>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-receipt me-2" />
                Facturas CFDI
              </h5>
              <p className="text-muted small">
                Gestión completa de Comprobantes Fiscales Digitales por Internet (CFDI
                4.0). Workflow: Borrador → XML → PDF → Timbrado SAT
              </p>
              <Link href="/dashboard/billing/invoices" className="btn btn-primary">
                Ver Facturas
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-building me-2" />
                Configuración Fiscal
              </h5>
              <p className="text-muted small">
                Configuración de datos fiscales, series de facturación, certificados SAT
                (CSD), y conexión con PAC (SW - Smarter Web)
              </p>
              <Link href="/dashboard/billing/settings" className="btn btn-outline-primary">
                Configurar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-credit-card me-2" />
                Pagos con Stripe
              </h5>
              <p className="text-muted small">
                Procesamiento de pagos en línea con Stripe. Integración completa con
                facturación CFDI para emisión automática
              </p>
              <Link href="/dashboard/billing/payments" className="btn btn-outline-primary">
                Ver Pagos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <h5 className="mb-3">Información del Sistema</h5>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle me-2" />
                CFDI 4.0 (SAT México)
              </h6>
              <ul className="mb-0 small">
                <li>Comprobantes tipo: Ingreso, Egreso, Traslado, Nómina, Pago</li>
                <li>Catálogos SAT: Productos/Servicios, Unidades, Formas de pago</li>
                <li>
                  Timbrado electrónico con PAC autorizado (SW - Smarter Web)
                </li>
                <li>Generación automática de XML y PDF</li>
                <li>Cancelación y sustitución de comprobantes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-credit-card-2-front me-2" />
                Stripe Integration
              </h6>
              <ul className="mb-0 small">
                <li>Procesamiento de pagos con tarjeta de crédito/débito</li>
                <li>Soporte para pagos recurrentes y suscripciones</li>
                <li>Webhooks para sincronización automática</li>
                <li>Generación automática de CFDI al confirmar pago</li>
                <li>Dashboard de transacciones y reportes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
