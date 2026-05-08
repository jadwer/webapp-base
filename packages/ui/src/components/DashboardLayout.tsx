'use client'

import Sidebar from './Sidebar'
import HeaderNavbar from './HeaderNavbar'
import { ToastContainer } from './base/ToastContainer'
import { useToastStore } from '../stores/toastStore'
import type { NavigationConfig } from '../hooks/useNavigation'
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

export default function DashboardLayout({ children, navigationConfig }: DashboardLayoutProps) {
  const { toasts, hideToast } = useToastStore()

  return (
    <div className={styles.layout}>
      <HeaderNavbar />
      <div className={styles.container}>
        <Sidebar navigationConfig={navigationConfig} />
        <div className={styles.content}>
          <main className={styles.mainContent}>
            {children}
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
