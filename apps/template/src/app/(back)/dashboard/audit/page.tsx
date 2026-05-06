'use client'

import React from 'react'
import { AuditAdminPage } from '@/modules/audit'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function AuditPage() {
  return (
    <DynamicRoleGuard path="/dashboard/audit">
      <AuditAdminPage />
    </DynamicRoleGuard>
  )
}
