'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { emailTemplateService } from '../services/emailTemplateService'
import type { EmailTemplate, EmailTemplateFormData, EmailTemplateFilters } from '../types/emailTemplate'

export function useEmailTemplates(filters?: EmailTemplateFilters) {
  const key = ['email-templates', JSON.stringify(filters)]
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => emailTemplateService.getAll(filters),
    { revalidateOnFocus: false }
  )

  return {
    templates: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useEmailTemplate(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['email-template', id] : null,
    () => emailTemplateService.getById(id!),
    { revalidateOnFocus: false }
  )

  return {
    template: data || null,
    isLoading,
    error,
    mutate,
  }
}

export function useEmailTemplateActions() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = useCallback(async (data: EmailTemplateFormData): Promise<EmailTemplate> => {
    setIsSubmitting(true)
    try {
      return await emailTemplateService.create(data)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const update = useCallback(async (id: string, data: Partial<EmailTemplateFormData>): Promise<EmailTemplate> => {
    setIsSubmitting(true)
    try {
      return await emailTemplateService.update(id, data)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    setIsSubmitting(true)
    try {
      await emailTemplateService.delete(id)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const sendTest = useCallback(async (id: string, email: string): Promise<{ message: string }> => {
    setIsSubmitting(true)
    try {
      return await emailTemplateService.sendTest(id, email)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { create, update, remove, sendTest, isSubmitting }
}
