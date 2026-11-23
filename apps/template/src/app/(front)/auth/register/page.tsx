'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { RegisterTemplate, safeRedirect } from '@/modules/auth'

function RegisterContent() {
  // La pagina a la que iba el visitante viaja con el (BUG-03).
  const redirect = safeRedirect(useSearchParams().get('redirect'))
  return <RegisterTemplate redirect={redirect} />
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  )
}
