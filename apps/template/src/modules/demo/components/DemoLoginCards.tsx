'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDemoMode } from '../hooks/useDemoMode'
import { DEMO_ACCOUNTS, DEMO_PASSWORD, type DemoAccount } from '../data/accounts'

/**
 * Pre-fill a react-hook-form input rendered by @lwm/auth's LoginForm.
 * The form is uncontrolled (register + refs), so we set the value through
 * the native setter and dispatch a bubbling input event that React picks up.
 */
function fillInput(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement | null
  if (!input) return false
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  return true
}

/**
 * Tarjetas de acceso por perfil en el login de la demo. Elegir una llena el
 * formulario con las credenciales demo (sin enviarlo: el prospecto presiona
 * "Iniciar sesion"). `?perfil=administrador|vendedor|cliente`, que llega
 * desde la landing, la preselecciona. Solo en modo demo.
 */
export function DemoLoginCards() {
  const { isDemo } = useDemoMode()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<DemoAccount['key'] | null>(null)

  const handleSelect = (account: DemoAccount) => {
    setSelected(account.key)
    fillInput('email', account.email)
    fillInput('password', DEMO_PASSWORD)
    document.getElementById('email')?.focus()
  }

  const perfil = searchParams.get('perfil')
  useEffect(() => {
    if (!isDemo || !perfil) return
    const account = DEMO_ACCOUNTS.find((a) => a.key === perfil)
    if (!account) return
    // El formulario se monta junto con las tarjetas; reintentar un momento
    // si todavia no existe el input.
    let tries = 0
    const timer = setInterval(() => {
      tries += 1
      if (fillInput('email', account.email) || tries > 20) {
        fillInput('password', DEMO_PASSWORD)
        setSelected(account.key)
        clearInterval(timer)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [isDemo, perfil])

  if (!isDemo) return null

  return (
    <div className="container py-4" style={{ maxWidth: 1040 }}>
      <div className="text-center mb-4">
        <h1 className="h3 fw-bold mb-1">Demo del portal</h1>
        <p className="text-muted mb-0">
          Elige un perfil: llenamos el acceso por ti y solo presionas &quot;Iniciar sesión&quot;.
        </p>
      </div>
      <div className="row g-3 justify-content-center">
        {DEMO_ACCOUNTS.map((account) => {
          const active = selected === account.key
          return (
            <div key={account.key} className="col-12 col-md-4">
              <button
                type="button"
                className={`card h-100 w-100 text-start shadow-sm ${active ? 'border-warning border-2' : 'border'}`}
                onClick={() => handleSelect(account)}
                aria-pressed={active}
                aria-label={`Entrar como ${account.role}`}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className={`bi ${account.icon} fs-4 text-primary`} aria-hidden="true" />
                    <span className="fw-semibold fs-5">{account.role}</span>
                    {active && <span className="badge bg-warning text-dark ms-auto">Seleccionado</span>}
                  </div>
                  <p className="text-muted small mb-2">{account.description}</p>
                  <ul className="list-unstyled small mb-2">
                    {account.canTry.map((item) => (
                      <li key={item} className="py-1">
                        <i className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <code className="small">{account.email}</code>
                </div>
              </button>
            </div>
          )
        })}
      </div>
      <p className="text-center text-muted small mt-3 mb-0">
        Los datos de la demo se reinician cada semana.
      </p>
    </div>
  )
}

export default DemoLoginCards
