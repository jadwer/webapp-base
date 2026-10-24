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

type NavLink = { href: string }

/** /dashboard solo exacto; cualquier otro href abre tambien sus subrutas. */
function opensUnder(pathname: string, links: NavLink[]): boolean {
  return links
    .map((l) => l.href)
    .filter((h) => h.startsWith('/dashboard'))
    .some((h) => (h === '/dashboard' ? pathname === '/dashboard' : pathname === h || pathname.startsWith(`${h}/`)))
}

/**
 * Rutas del panel que un cliente puede abrir: las de su menu (y sus
 * subrutas, p. ej. /dashboard/my-orders/12).
 */
export function customerCanOpen(pathname: string, config: NavigationConfig): boolean {
  const section = config.customer
  return opensUnder(pathname, [
    ...section.topLinks,
    ...section.groups.flatMap((g) => g.items),
    ...(config.customerExtraLinks ?? []),
  ])
}

/**
 * El personal con rol propio abre lo que su menu filtrado por permisos le
 * muestra (y sus subrutas: detalle, alta, edicion) mas su perfil.
 */
export function staffCanOpen(pathname: string, menu: { topLinks: NavLink[]; groups: { items: NavLink[] }[] }): boolean {
  return opensUnder(pathname, [
    { href: '/dashboard/profile' },
    ...menu.topLinks,
    ...menu.groups.flatMap((g) => g.items),
  ])
}

export default function DashboardLayout({ children, navigationConfig }: DashboardLayoutProps) {
  const { toasts, hideToast } = useToastStore()
  const pathname = usePathname() ?? ''
  const nav = useNavigation(navigationConfig)
  // El API ya responde 403, pero sin esto el cliente (o el personal fuera de
  // sus permisos) veia la pantalla de administracion con errores encima.
  const blocked =
    (nav.isCustomer && !customerCanOpen(pathname, navigationConfig)) ||
    (nav.isStaff && !staffCanOpen(pathname, nav))

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
                <h1 className="h4 mt-3">
                  {nav.isCustomer ? 'Esta sección no está disponible en tu portal' : 'No tienes acceso a esta sección'}
                </h1>
                <p className="text-muted">
                  {nav.isCustomer
                    ? 'Tus pedidos, cotizaciones y carrito están en Mi Portal.'
                    : 'Pide a un administrador el permiso si lo necesitas.'}
                </p>
                <Link href="/dashboard" className="btn btn-primary">{nav.isCustomer ? 'Ir a Mi Panel' : 'Ir al inicio'}</Link>
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
