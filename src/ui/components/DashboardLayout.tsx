'use client'

import Sidebar from '@/ui/components/Sidebar'
import HeaderNavbar from '@/ui/components/HeaderNavbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HeaderNavbar />
      <div className="d-flex">
        <Sidebar />
        <main className="flex-grow-1 p-4 bg-white" style={{ minHeight: '100vh' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
