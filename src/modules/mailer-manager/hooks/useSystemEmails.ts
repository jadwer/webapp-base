'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { systemEmailService } from '../services/systemEmailService'
import type { SystemEmail, SystemEmailFilters } from '../types/systemEmail'

export function useSystemEmails(filters?: SystemEmailFilters) {
  const key = ['system-emails', JSON.stringify(filters)]
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => systemEmailService.getAll(filters),
    { revalidateOnFocus: false }
  )

  return {
    systemEmails: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useSystemEmailActions() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleEnabled = useCallback(async (systemEmail: SystemEmail): Promise<SystemEmail> => {
    setIsSubmitting(true)
    try {
      return await systemEmailService.update(systemEmail.id, {
        isEnabled: !systemEmail.isEnabled,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const assignTemplate = useCallback(async (systemEmailId: string, templateId: string | null): Promise<SystemEmail> => {
    setIsSubmitting(true)
    try {
      return await systemEmailService.update(systemEmailId, {
        emailTemplateId: templateId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const sendTest = useCallback(async (id: string, email: string): Promise<{ message: string; usedCustomTemplate: boolean }> => {
    setIsSubmitting(true)
    try {
      return await systemEmailService.sendTest(id, email)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { toggleEnabled, assignTemplate, sendTest, isSubmitting }
}
