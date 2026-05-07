'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import NProgress from 'nprogress'

export function useNavigationProgress() {
  const router = useRouter()

  const push = useCallback((href: string) => {
    NProgress.start()
    router.push(href)
  }, [router])

  const replace = useCallback((href: string) => {
    NProgress.start()
    router.replace(href)
  }, [router])

  const back = useCallback(() => {
    NProgress.start()
    router.back()
  }, [router])

  const forward = useCallback(() => {
    NProgress.start()
    router.forward()
  }, [router])

  return {
    push,
    replace,
    back,
    forward,
    // También exponer el router original por si se necesita
    router
  }
}