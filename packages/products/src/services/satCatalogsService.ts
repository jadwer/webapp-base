import { axiosClient as axios } from '@lwm/auth'

/**
 * Catalogo SAT c_ClaveProdServ (clave de producto/servicio del CFDI).
 */
export interface SatClaveProdServ {
  clave: string
  descripcion: string
}

/**
 * Catalogo SAT c_ClaveUnidad (clave de unidad de medida del CFDI).
 * El backend puede incluir campos adicionales (simbolo, nota, etc.) pero
 * el frontend solo consume clave + nombre para el combobox.
 */
export interface SatClaveUnidad {
  clave: string
  nombre: string
  [key: string]: unknown
}

interface SatCatalogResponse<T> {
  data: T[]
}

const SEARCH_MIN_LENGTH = 2

/**
 * Servicio de busqueda de catalogos SAT (clave de producto/servicio y
 * clave de unidad de medida) usados en los campos fiscales del producto.
 *
 * Ambos endpoints son de solo lectura y requieren sesion (sanctum). No se
 * pagina mas alla de page[size] porque el uso es un combobox de tipeo, no
 * un listado navegable.
 */
export const satCatalogsService = {
  async searchClaveProdServ(term: string): Promise<SatClaveProdServ[]> {
    const trimmed = term.trim()
    if (trimmed.length < SEARCH_MIN_LENGTH) return []

    const response = await axios.get('/api/v1/sat/clave-prod-serv', {
      params: {
        'filter[search]': trimmed,
        'page[size]': 20
      }
    })

    const body = response.data as SatCatalogResponse<SatClaveProdServ>
    return body.data || []
  },

  async searchClaveUnidad(term: string): Promise<SatClaveUnidad[]> {
    const trimmed = term.trim()
    if (trimmed.length < SEARCH_MIN_LENGTH) return []

    const response = await axios.get('/api/v1/sat/clave-unidad', {
      params: {
        'filter[search]': trimmed
      }
    })

    const body = response.data as SatCatalogResponse<SatClaveUnidad>
    return body.data || []
  }
}
