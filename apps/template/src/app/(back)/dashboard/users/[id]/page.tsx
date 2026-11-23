'use client'

import React from 'react'
import { UserViewPage } from '@/modules/users'
import { UserLoginHistory } from '@/modules/audit'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = React.use(params)

  return (
    <>
      <UserViewPage userId={resolvedParams.id} />
      <div className="container-fluid pb-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <UserLoginHistory userId={resolvedParams.id} title="Historial de sesiones" maxItems={10} />
          </div>
        </div>
      </div>
    </>
  )
}
