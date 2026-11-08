import useSWR from 'swr'
import { axiosClient } from '@lwm/auth'
import type { GuideData, GuideResponse } from '../types'

/**
 * La siguiente accion y el expediente de un documento. `revision` es algo que
 * cambia cuando el documento cambia en la pantalla (su `updatedAt` o su
 * estado): la guia se vuelve a pedir sin que la pagina la llame.
 */
export function useGuide(type: string | null | undefined, id: string | number | null | undefined, revision?: string | null) {
  const key = type && id !== null && id !== undefined && id !== '' ? [`/api/v1/guide/${type}/${id}`, revision ?? ''] : null
  const { data, error, isLoading, mutate } = useSWR<GuideData>(
    key,
    ([path]: [string, string]) => axiosClient.get<GuideResponse>(path).then((r) => r.data.data),
    { revalidateOnFocus: false }
  )

  return { guide: data, error, isLoading, refresh: mutate }
}
