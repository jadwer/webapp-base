'use client'

import AlphaLabHeader from '@/modules/landing/AlphaLabHeader'
import AlphaLabFooter from '@/modules/landing/AlphaLabFooter'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AlphaLabHeader />
      <main>{children}</main>
      <AlphaLabFooter />
    </>
  )
}
