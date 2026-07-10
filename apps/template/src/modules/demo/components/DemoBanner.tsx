'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { useDemoMode } from '../hooks/useDemoMode'
import { demoService } from '../services/demoService'

const COLLAPSED_KEY = 'demo_banner_collapsed'
const CONTACT_EMAIL = 'contacto@atomosoluciones.com'

function formatNextReset(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getErrorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status
}

/**
 * Fixed top banner shown on every page (front and back) when the app runs
 * in demo mode (build flag + backend confirmation, see useDemoMode).
 * Collapsible to a small pin so it never gets in the way.
 */
export function DemoBanner() {
  const { isDemo, nextReset } = useDemoMode()
  const router = useRouter()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(COLLAPSED_KEY) === 'true'
  })

  if (!isDemo) return null

  const toggleCollapsed = (value: boolean) => {
    setCollapsed(value)
    try {
      sessionStorage.setItem(COLLAPSED_KEY, String(value))
    } catch {
      // sessionStorage unavailable (private mode): the toggle still works in-memory
    }
  }

  const handleReset = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Se borraran TODOS los datos del entorno de demostracion, incluyendo usuarios, carritos y sesiones activas. Tu sesion actual dejara de ser valida y tendras que volver a iniciar sesion. ¿Deseas continuar?',
      {
        title: 'Reiniciar entorno de demostracion',
        confirmText: 'Si, reiniciar todo',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-exclamation-triangle-fill text-danger" aria-hidden="true" />,
      }
    )
    if (!confirmed) return

    setIsResetting(true)
    try {
      await demoService.reset()
      // The reset wiped users and tokens on the backend: clear local session
      localStorage.removeItem('access_token')
      localStorage.removeItem('app_cart')
      toast.success('Entorno reiniciado')
      router.replace('/auth/login')
    } catch (error) {
      const status = getErrorStatus(error)
      if (status === 429) {
        toast.error('El entorno se reinicio hace poco, intenta en unos minutos')
      } else if (status === 401) {
        toast.error('Necesitas iniciar sesion para reiniciar el entorno')
      } else {
        toast.error('No se pudo reiniciar el entorno, intenta de nuevo')
      }
    } finally {
      setIsResetting(false)
    }
  }

  const nextResetLabel = formatNextReset(nextReset)

  if (collapsed) {
    return (
      <button
        type="button"
        className="btn btn-warning btn-sm position-fixed rounded-circle shadow d-flex align-items-center justify-content-center"
        style={{ top: '0.5rem', right: '0.5rem', width: 36, height: 36, zIndex: 1090 }}
        title="Entorno de demostracion (clic para expandir)"
        aria-label="Expandir aviso de entorno de demostracion"
        onClick={() => toggleCollapsed(false)}
      >
        <i className="bi bi-flask" aria-hidden="true" />
      </button>
    )
  }

  return (
    <>
      <div
        className="bg-warning-subtle border-bottom border-warning sticky-top"
        style={{ zIndex: 1090 }}
        role="region"
        aria-label="Aviso de entorno de demostracion"
      >
        <div className="container-fluid d-flex flex-wrap align-items-center gap-2 py-2 px-3 small">
          <i className="bi bi-flask text-warning-emphasis" aria-hidden="true" />
          <span>
            <strong>Entorno de demostracion:</strong> los datos se reinician cada lunes.
          </span>
          {nextResetLabel && (
            <span className="text-muted d-none d-md-inline">
              Proximo reinicio: {nextResetLabel}
            </span>
          )}
          <div className="ms-auto d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                  Reiniciando...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                  Reiniciar entorno
                </>
              )}
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Me%20interesa%20el%20sistema`}
              className="btn btn-sm btn-primary"
            >
              <i className="bi bi-envelope me-1" aria-hidden="true" />
              ¿Te intereso? Contactanos
            </a>
            <button
              type="button"
              className="btn btn-sm btn-link text-body p-0 ms-1"
              title="Colapsar aviso"
              aria-label="Colapsar aviso de entorno de demostracion"
              onClick={() => toggleCollapsed(true)}
            >
              <i className="bi bi-pin-angle" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default DemoBanner
