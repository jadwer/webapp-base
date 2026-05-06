import axios from '@/lib/axiosClient'

export interface AppSettingValue {
  key: string
  value: string | boolean | number | null
  type: string
  label: string | null
  description: string | null
}

export interface AppSettingsGrouped {
  [group: string]: {
    [key: string]: AppSettingValue
  }
}

export const appSettingsService = {
  /**
   * Get all settings grouped (admin only).
   */
  async getAll(): Promise<AppSettingsGrouped> {
    const response = await axios.get('/api/v1/app-settings')
    return response.data.data
  },

  /**
   * Get settings by group (admin only).
   */
  async getByGroup(group: string): Promise<Record<string, AppSettingValue>> {
    const response = await axios.get(`/api/v1/app-settings/group/${group}`)
    return response.data.data
  },

  /**
   * Get public settings (no auth needed).
   */
  async getPublic(): Promise<{ company: Record<string, AppSettingValue>; branding: Record<string, AppSettingValue>; social: Record<string, AppSettingValue> }> {
    const response = await axios.get('/api/v1/app-settings/public')
    return response.data.data
  },

  /**
   * Update a setting value (admin only).
   */
  async update(key: string, value: string | boolean | number | null): Promise<AppSettingValue> {
    const response = await axios.patch(`/api/v1/app-settings/${key}`, { value })
    return response.data.data
  },
}
