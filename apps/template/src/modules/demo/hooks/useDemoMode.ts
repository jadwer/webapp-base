'use client'

import useSWR from 'swr'
import { demoService } from '../services/demoService'
import type { DemoStatus } from '../types'

const FIVE_MINUTES = 5 * 60 * 1000

/**
 * Demo mode hook with double check:
 * 1. Build flag: NEXT_PUBLIC_DEMO_MODE must be 'true' (inlined at build time).
 * 2. Backend confirmation: GET /api/v1/demo/status must return demo_mode: true.
 *
 * If the build flag is off, no request is made at all (SWR key null).
 * If the backend says demo_mode: false, isDemo stays false even on a demo build.
 * Slow revalidation (5 min): the status barely changes.
 */
export function useDemoMode() {
  const buildFlagEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const { data, error, isLoading } = useSWR<DemoStatus>(
    buildFlagEnabled ? 'demo-status' : null,
    () => demoService.getStatus(),
    {
      revalidateOnFocus: false,
      refreshInterval: FIVE_MINUTES,
      dedupingInterval: FIVE_MINUTES,
    }
  )

  const isDemo = buildFlagEnabled && data?.demo_mode === true

  return {
    isDemo,
    nextReset: isDemo ? (data?.next_scheduled_reset ?? null) : null,
    isLoading: buildFlagEnabled ? isLoading : false,
    isError: !!error,
  }
}

export default useDemoMode
