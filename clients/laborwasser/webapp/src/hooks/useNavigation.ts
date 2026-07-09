// Compatibility shim. The agnostic useNavigation hook now lives in @lwm/ui.
// This wrapper binds it to the template's navigationConfig so existing
// callers keep working without arguments.
'use client'

import { useNavigation as useNavigationBase, type UseNavigationResult } from '@lwm/ui'
import { adminNavigation, customerNavigation, customerExtraLinks } from '@/config/navigationConfig'

const navigationConfig = {
  admin: adminNavigation,
  customer: customerNavigation,
  customerExtraLinks,
}

export function useNavigation(): UseNavigationResult {
  return useNavigationBase(navigationConfig)
}
