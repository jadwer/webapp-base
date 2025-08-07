'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: 'ease',
  speed: 300,
})

export default function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start progress when navigation begins
    const handleStart = () => {
      NProgress.start()
    }

    // Complete progress when navigation ends
    const handleComplete = () => {
      NProgress.done()
    }

    // Listen for route changes
    handleComplete() // Complete any ongoing progress
    
    return () => {
      handleComplete()
    }
  }, [pathname, searchParams])

  return null // This component doesn't render anything
}