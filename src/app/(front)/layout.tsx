'use client'

import { Header } from '@/modules/laborwasser-landing/components/Header/Header'
import { Footer } from '@/modules/laborwasser-landing/components/Footer/Footer'
import CustomerSidebar from '@/modules/ecommerce/components/CustomerSidebar'

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <CustomerSidebar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
