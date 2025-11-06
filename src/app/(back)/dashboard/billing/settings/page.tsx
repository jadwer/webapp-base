'use client'

export default function BillingSettingsPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-building me-3" />
            Configuración Fiscal
          </h1>
          <p className="text-muted">
            Gestión de datos fiscales, certificados SAT (CSD) y conexión con PAC
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Interfaz completa de configuración fiscal con
        gestión de certificados SAT, series de facturación y conexión con PAC (SW).
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-lock me-2" />
                Certificados SAT (CSD)
              </h5>
              <p className="text-muted small">
                Carga de archivos .cer y .key para timbrado de CFDI
              </p>
              <button className="btn btn-primary" disabled>
                Cargar Certificados
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-plug me-2" />
                Conexión PAC (SW)
              </h5>
              <p className="text-muted small">
                Configuración de conexión con Smarter Web para timbrado
              </p>
              <button className="btn btn-outline-primary" disabled>
                Probar Conexión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
