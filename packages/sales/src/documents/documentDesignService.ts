import { axiosClient as axios } from '@lwm/auth'
import type { DocumentDesign, DocumentDesignSummary, RawLayout } from './types'

const BASE = '/api/v1/document-designs'

/**
 * El mensaje que manda el backend (siempre en espanol). La vista previa pide
 * un Blob, asi que su error tambien llega como Blob y hay que leerlo.
 */
export async function designErrorMessage(err: unknown, fallback: string): Promise<string> {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  let body: unknown = data
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      body = JSON.parse(await data.text())
    } catch {
      body = null
    }
  }
  const message = (body as { message?: unknown } | null)?.message
  return typeof message === 'string' && message.trim() !== '' ? message : fallback
}

export const documentDesignService = {
  async list(): Promise<DocumentDesignSummary[]> {
    const res = await axios.get(BASE)
    return res.data.data
  },

  async get(type: string): Promise<DocumentDesign> {
    const res = await axios.get(`${BASE}/${type}`)
    return res.data.data
  },

  async save(type: string, layout: RawLayout): Promise<{ layout: RawLayout; customized: boolean; updatedAt: string | null }> {
    const res = await axios.put(`${BASE}/${type}`, { layout })
    return res.data.data
  },

  async restore(type: string): Promise<{ layout: RawLayout; customized: boolean; updatedAt: string | null }> {
    const res = await axios.delete(`${BASE}/${type}`)
    return res.data.data
  },

  async preview(type: string, layout: RawLayout, mode: string): Promise<Blob> {
    const res = await axios.post(`${BASE}/${type}/preview`, { layout, mode }, { responseType: 'blob' })
    return res.data as Blob
  },

  /** Interruptor y colores viven en la configuracion del sistema (app-settings). */
  async setSetting(key: string, value: string | boolean): Promise<void> {
    await axios.patch(`/api/v1/app-settings/${key}`, { value })
  },
}
