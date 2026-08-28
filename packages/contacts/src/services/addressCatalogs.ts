/**
 * ADDRESS CATALOGS SERVICE
 *
 * Catalogos de domicilio del SAT servidos por el backend (fuente unica):
 * lookup por codigo postal y cascada estado -> municipio.
 *
 * REGLA: estos catalogos ASISTEN la captura, jamas la bloquean. Un CP que
 * no este en el catalogo (404) significa "captura manual", no error.
 */

import { axiosClient } from '@lwm/auth'

export interface AddressColonia {
  clave: string
  nombre: string
}

export interface PostalCodeInfo {
  codigoPostal: string
  estadoClave: string
  estado: string
  municipioClave: string | null
  municipio: string | null
  colonias: AddressColonia[]
}

export interface AddressEstado {
  clave: string
  nombre: string
}

export const addressCatalogsService = {
  /**
   * Resuelve un CP a estado + municipio + colonias.
   * Devuelve null si el CP no esta en el catalogo (captura manual).
   */
  async lookupPostalCode(codigoPostal: string): Promise<PostalCodeInfo | null> {
    try {
      const response = await axiosClient.get(`/api/v1/sat/address/postal-codes/${codigoPostal}`)
      return response.data.data as PostalCodeInfo
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 404 || status === 422) {
        return null
      }
      throw error
    }
  },

  async getEstados(): Promise<AddressEstado[]> {
    const response = await axiosClient.get('/api/v1/sat/address/estados')
    return response.data.data as AddressEstado[]
  },

  async getMunicipios(estadoClave: string): Promise<AddressEstado[]> {
    const response = await axiosClient.get(`/api/v1/sat/address/estados/${estadoClave}/municipios`)
    return response.data.data as AddressEstado[]
  },
}

export default addressCatalogsService
