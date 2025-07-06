'use client'

import { useAuth } from '@/modules/auth/lib/auth'

export default function DashboardHomePage() {
  const { user } = useAuth({ middleware: 'auth' })

  return (
    <div className="container py-5">
      <h1 className="mb-4">Bienvenido, {user?.name}</h1>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Panel principal</h5>
          <p className="card-text">Aquí puedes comenzar a trabajar en tus módulos o revisar tus estadísticas.</p>
        </div>
      </div>
    </div>
  )
}
