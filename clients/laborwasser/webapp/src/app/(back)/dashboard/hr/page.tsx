import { HRIndexPage } from '@/modules/hr'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function HRPage() {
  return (
    <DynamicRoleGuard path="/dashboard/hr">
      <HRIndexPage />
    </DynamicRoleGuard>
  )
}
