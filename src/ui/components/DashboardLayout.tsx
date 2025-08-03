'use client'

import Sidebar from '@/ui/components/Sidebar'
import HeaderNavbar from '@/ui/components/HeaderNavbar'
import styles from '@/ui/styles/modules/DashboardLayout.module.scss'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    </div>
  )
}
