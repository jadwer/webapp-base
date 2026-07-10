'use client'

import { useDemoMode } from '../hooks/useDemoMode'

interface DemoAccount {
  role: string
  description: string
  email: string
  icon: string
}

const DEMO_PASSWORD = 'Demo2026!'

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Administrador',
    description: 'Acceso completo al dashboard y configuracion',
    email: 'admin@demo.mx',
    icon: 'bi-shield-lock',
  },
  {
    role: 'Vendedor',
    description: 'Cotizaciones, ventas y clientes',
    email: 'vendedor@demo.mx',
    icon: 'bi-briefcase',
  },
  {
    role: 'Cliente',
    description: 'Portal de cliente y compras en linea',
    email: 'cliente@demo.mx',
    icon: 'bi-person',
  },
]

/**
 * Pre-fill a react-hook-form input rendered by @lwm/auth's LoginForm.
 * The form is uncontrolled (register + refs), so we set the value through
 * the native setter and dispatch a bubbling input event that React picks up.
 */
function fillInput(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement | null
  if (!input) return
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * Demo login cards for the login page. Clicking a card pre-fills the login
 * form with the demo credentials (no auto-submit: the prospect still presses
 * "Iniciar sesion"). Rendered only in demo mode.
 */
export function DemoLoginCards() {
  const { isDemo } = useDemoMode()

  if (!isDemo) return null

  const handleSelect = (account: DemoAccount) => {
    fillInput('email', account.email)
    fillInput('password', DEMO_PASSWORD)
    document.getElementById('email')?.focus()
  }

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <p className="text-center text-muted small mb-3">
        Entorno de demostracion: elige un perfil para llenar el formulario y prueba el sistema.
      </p>
      <div className="row g-3 justify-content-center">
        {DEMO_ACCOUNTS.map((account) => (
          <div key={account.email} className="col-12 col-md-4">
            <button
              type="button"
              className="card h-100 w-100 text-start border shadow-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelect(account)}
              aria-label={`Entrar como ${account.role}`}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${account.icon} fs-4 text-primary`} aria-hidden="true" />
                  <span className="fw-semibold">Entrar como {account.role}</span>
                </div>
                <p className="text-muted small mb-1">{account.description}</p>
                <code className="small">{account.email}</code>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DemoLoginCards
