/**
 * Catalogos del formulario de contactos servidos por el BACKEND
 * (GET /api/v1/contact-catalogs), que es la misma fuente contra la que
 * valida ContactRequest. Asi el formulario no puede ofrecer una opcion
 * que el backend rechace (regla 7; origen: bug prod 2026-07-30).
 *
 * El catalogo estatico local queda SOLO como fallback de red: si el
 * endpoint no responde, el formulario sigue siendo usable con la copia
 * local (que puede quedar desactualizada, por eso es fallback y no fuente).
 */

'use client'

import useSWR from 'swr'
import { axiosClient } from '@lwm/auth'
import { REGIMENES_FISCALES, USOS_CFDI, type SatCatalogEntry } from '../utils/satCatalogs'

interface ContactCatalogsPayload {
  regimenes_fiscales: SatCatalogEntry[]
  usos_cfdi: SatCatalogEntry[]
  classifications: SatCatalogEntry[]
}

const FALLBACK_CLASSIFICATIONS: SatCatalogEntry[] = [
  { code: 'premium', label: 'Premium' },
  { code: 'standard', label: 'Estandar' },
  { code: 'basic', label: 'Basico' },
]

const fetchCatalogs = async (): Promise<ContactCatalogsPayload> => {
  const response = await axiosClient.get('/api/v1/contact-catalogs')
  return response.data.data
}

export interface UseContactCatalogsResult {
  regimenesFiscales: SatCatalogEntry[]
  usosCfdi: SatCatalogEntry[]
  classifications: SatCatalogEntry[]
  /** true mientras carga Y no hay datos (con fallback nunca bloquea la UI) */
  isLoading: boolean
  /** true si se esta usando el fallback estatico por fallo del endpoint */
  isFallback: boolean
}

export function useContactCatalogs(): UseContactCatalogsResult {
  const { data, error, isLoading } = useSWR<ContactCatalogsPayload>(
    'contact-catalogs',
    fetchCatalogs,
    {
      revalidateOnFocus: false,
      // Catalogo casi estatico: si ya lo tenemos, no refetchear por navegar.
      dedupingInterval: 5 * 60 * 1000,
    }
  )

  const isFallback = Boolean(error) && !data

  return {
    regimenesFiscales: data?.regimenes_fiscales ?? REGIMENES_FISCALES,
    usosCfdi: data?.usos_cfdi ?? USOS_CFDI,
    classifications: data?.classifications ?? FALLBACK_CLASSIFICATIONS,
    isLoading: isLoading && !data,
    isFallback,
  }
}
