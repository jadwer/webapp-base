'use client'

import { useState, useEffect, useCallback } from 'react'
import { appSettingsService, type AppSettingValue } from '../services/appSettingsService'

export interface PublicSettings {
  company: Record<string, AppSettingValue>
  branding: Record<string, AppSettingValue>
  social: Record<string, AppSettingValue>
}

// Module-level cache - shared across all hook instances, survives re-renders
let cachedSettings: PublicSettings | null = null
let fetchPromise: Promise<PublicSettings | null> | null = null

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(cachedSettings)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings)
      setLoading(false)
      return
    }

    if (!fetchPromise) {
      fetchPromise = appSettingsService.getPublic()
        .then(data => {
          cachedSettings = data
          return cachedSettings
        })
        .catch(() => {
          fetchPromise = null
          return null
        })
    }

    fetchPromise.then(data => {
      if (data) {
        setSettings(data)
        setLoading(false)
      }
    })
  }, [])

  const get = useCallback((key: string): string => {
    if (!settings) return ''
    const [group] = key.split('.')
    const groupData = settings[group as keyof PublicSettings]
    if (!groupData) return ''
    const setting = groupData[key]
    return setting ? String(setting.value ?? '') : ''
  }, [settings])

  const isConfigured = !!(settings && get('company.name') && get('company.email'))

  return { settings, loading, get, isConfigured }
}
