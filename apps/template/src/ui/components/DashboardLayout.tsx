'use client'

import Sidebar from '@/ui/components/Sidebar'
import HeaderNavbar from '@/ui/components/HeaderNavbar'
import { ToastContainer } from '@/ui/components/base/ToastContainer'
import { useToastStore } from '@/ui/stores/toastStore'
import styles from '@/ui/styles/modules/DashboardLayout.module.scss'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toasts, hideToast } = useToastStore()

  return (
    <div className={styles.layout}>
      <HeaderNavbar />
      <div className={styles.container}>
        <Sidebar />
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
