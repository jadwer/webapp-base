/**
 * AYUDAS DE LISTADOS DE INVENTARIO
 * Lectura de meta.page (PagePagination de laravel-json-api) y mensajes de
 * error de la API para toasts.
 */

export interface PageInfo {
  total: number
  lastPage: number
  currentPage: number
  perPage: number
}

/** Lee meta.page; sin dato usa los valores de respaldo */
export const readPageMeta = (meta: unknown, fallbackPage = 1, fallbackSize = 20): PageInfo => {
  const page = (meta as { page?: Partial<PageInfo> } | undefined)?.page
  return {
    total: typeof page?.total === 'number' ? page.total : 0,
    lastPage: typeof page?.lastPage === 'number' ? page.lastPage : 1,
    currentPage: typeof page?.currentPage === 'number' ? page.currentPage : fallbackPage,
    perPage: typeof page?.perPage === 'number' ? page.perPage : fallbackSize,
  }
}

interface ApiErrorShape {
  message?: string
  response?: {
    status?: number
    data?: {
      message?: string
      errors?: Array<{ detail?: string; title?: string }>
    }
  }
}

/** Mensaje legible de un error de axios/JSON:API */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  const e = error as ApiErrorShape | undefined
  const data = e?.response?.data
  return (
    data?.errors?.[0]?.detail ||
    data?.errors?.[0]?.title ||
    data?.message ||
    e?.message ||
    fallback
  )
}

/** Mensaje para un borrado fallido; 409/400 suele ser por registros relacionados */
export const deleteErrorMessage = (error: unknown, entity: string): string => {
  const status = (error as ApiErrorShape | undefined)?.response?.status
  if (status === 409 || status === 400) {
    return `No se puede eliminar ${entity} porque tiene registros relacionados.`
  }
  return `Error al eliminar ${entity}: ${apiErrorMessage(error, 'error desconocido')}`
}

/** Todos los mensajes de un error JSON:API (422 trae uno por campo) */
export const apiErrorList = (error: unknown, fallback: string): string[] => {
  const e = error as ApiErrorShape | undefined
  const list = (e?.response?.data?.errors || [])
    .map((item) => item.detail || item.title)
    .filter((msg): msg is string => Boolean(msg))
  return list.length > 0 ? Array.from(new Set(list)) : [apiErrorMessage(error, fallback)]
}
