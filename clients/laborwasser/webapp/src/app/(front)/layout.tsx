'use client'

import { Header, TopNav, Footer } from '@/modules/landing'
import { CustomerSidebar } from '@lwm/ecommerce'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <TopNav />
      <CustomerSidebar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
