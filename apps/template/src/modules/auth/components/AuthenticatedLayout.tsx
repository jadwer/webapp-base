// src/modules/auth/components/AuthenticatedLayout.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/modules/auth/lib/auth"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth({ middleware: "auth" })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const currentPath = encodeURIComponent(window.location.pathname)
        router.replace(`/auth/login?redirect=${currentPath}`)
      } else {
        setReady(true)
      }
    }
  }, [user, isLoading, router])

  if (!ready) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-muted">
        <div className="spinner-border me-3" role="status"></div>
        <span>Cargando sesión...</span>
      </div>
    )
  }

  return <>{children}</>
}
