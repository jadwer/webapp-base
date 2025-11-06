'use client'

export default function PaymentsPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-credit-card me-3" />
            Pagos con Stripe
          </h1>
          <p className="text-muted">
            Procesamiento de pagos en línea e integración con facturación CFDI
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Dashboard completo de transacciones Stripe con
        generación automática de CFDI y webhooks.
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-credit-card-2-back me-2" />
                Transacciones
              </h5>
              <p className="text-muted small">
                Historial completo de pagos procesados con Stripe
              </p>
              <button className="btn btn-primary" disabled>
                Ver Transacciones
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-arrow-repeat me-2" />
                Suscripciones
              </h5>
              <p className="text-muted small">
                Gestión de suscripciones y pagos recurrentes
              </p>
              <button className="btn btn-outline-primary" disabled>
                Ver Suscripciones
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-webhook me-2" />
                Webhooks
              </h5>
              <p className="text-muted small">
                Configuración de webhooks para sincronización automática
              </p>
              <button className="btn btn-outline-primary" disabled>
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
