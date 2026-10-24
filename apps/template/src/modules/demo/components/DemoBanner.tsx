'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { useDemoMode } from '../hooks/useDemoMode'
import { demoService } from '../services/demoService'

const CLOSED_KEY = 'demo_banner_closed'
// La demo la vende LWM (Gabino 23-10)
const CONTACT_EMAIL = 'direccion@laborwasserdemexico.com'

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
 * Se puede cerrar; queda cerrado durante la sesion del navegador.
 */
export function DemoBanner() {
  const { isDemo, nextReset } = useDemoMode()
  const router = useRouter()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [closed, setClosed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem(CLOSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  if (!isDemo) return null

  const close = () => {
    setClosed(true)
    try {
      sessionStorage.setItem(CLOSED_KEY, 'true')
    } catch {
      // sessionStorage no disponible (modo privado): se cierra solo en memoria
    }
  }

  const handleReset = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Se borrarán TODOS los datos del entorno de demostración, incluyendo usuarios, carritos y sesiones activas. Tu sesión actual dejará de ser válida y tendrás que volver a iniciar sesión. ¿Deseas continuar?',
      {
        title: 'Reiniciar entorno de demostración',
        confirmText: 'Sí, reiniciar todo',
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
        toast.error('El entorno se reinició hace poco, intenta en unos minutos')
      } else if (status === 401) {
        toast.error('Necesitas iniciar sesión para reiniciar el entorno')
      } else {
        toast.error('No se pudo reiniciar el entorno, intenta de nuevo')
      }
    } finally {
      setIsResetting(false)
    }
  }

  const nextResetLabel = formatNextReset(nextReset)

  if (closed) return null

  return (
    <>
      <div
        className="bg-warning-subtle border-bottom border-warning sticky-top"
        style={{ zIndex: 1090 }}
        role="region"
        aria-label="Aviso de entorno de demostración"
      >
        <div className="container-fluid d-flex flex-wrap align-items-center gap-2 py-2 px-3 small">
          <i className="bi bi-flask text-warning-emphasis" aria-hidden="true" />
          <span>
            <strong>Entorno de demostración:</strong> los datos se reinician cada semana.
          </span>
          {nextResetLabel && (
            <span className="text-muted d-none d-md-inline">
              Próximo reinicio: {nextResetLabel}
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
              ¿Te interesó? Contáctanos
            </a>
            <button
              type="button"
              className="btn-close ms-1"
              title="Cerrar aviso"
              aria-label="Cerrar aviso de entorno de demostración"
              onClick={close}
            />
          </div>
        </div>
      </div>
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default DemoBanner
