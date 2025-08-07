'use client'

import { useEffect, Suspense } from 'react'
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

function NavigationProgressInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
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

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  )
}