'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import HeaderNavbar from './HeaderNavbar'
import { ToastContainer } from './base/ToastContainer'
import { useToastStore } from '../stores/toastStore'
import { useNavigation, type NavigationConfig } from '../hooks/useNavigation'
import styles from '../styles/modules/DashboardLayout.module.scss'

export interface DashboardLayoutProps {
  children: React.ReactNode
  /**
   * Tenant-specific navigation config forwarded to Sidebar. Lives in the
   * consumer app — the template provides one and each `clients/<name>/`
   * can ship its own.
   */
  navigationConfig: NavigationConfig
}

/**
 * Rutas del panel que un cliente puede abrir: las de su menu (y sus
 * subrutas, p. ej. /dashboard/my-orders/12). /dashboard solo exacto.
 */
export function customerCanOpen(pathname: string, config: NavigationConfig): boolean {
  const section = config.customer
  const hrefs = [
    ...section.topLinks,
    ...section.groups.flatMap((g) => g.items),
    ...(config.customerExtraLinks ?? []),
  ]
    .map((i) => i.href)
    .filter((h) => h.startsWith('/dashboard'))
  return hrefs.some((h) =>
    h === '/dashboard' ? pathname === '/dashboard' : pathname === h || pathname.startsWith(`${h}/`)
  )
}

export default function DashboardLayout({ children, navigationConfig }: DashboardLayoutProps) {
  const { toasts, hideToast } = useToastStore()
  const pathname = usePathname() ?? ''
  const { isCustomer } = useNavigation(navigationConfig)
  // El API ya responde 403, pero sin esto el cliente veia la pantalla de
  // administracion (botones de crear, editar, eliminar) con un error encima.
  const blocked = isCustomer && !customerCanOpen(pathname, navigationConfig)

  return (
    <div className={styles.layout}>
      <HeaderNavbar />
      <div className={styles.container}>
        <Sidebar navigationConfig={navigationConfig} />
        <div className={styles.content}>
          <main className={styles.mainContent}>
            {blocked ? (
              <div className="container py-5 text-center" role="alert">
                <i className="bi bi-shield-lock display-4 text-muted" aria-hidden="true" />
                <h1 className="h4 mt-3">Esta sección no está disponible en tu portal</h1>
                <p className="text-muted">Tus pedidos, cotizaciones y carrito están en Mi Portal.</p>
                <Link href="/dashboard" className="btn btn-primary">Ir a Mi Panel</Link>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      {/* Global toast container for the dashboard */}
      <ToastContainer
        toasts={toasts}
        onClose={hideToast}
        position="top-right"
      />
    </div>
  )
}
