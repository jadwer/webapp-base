/**
 * Regla 9 (todo mensaje visible en espanol): axios arma `error.message` en
 * ingles ("Request failed with status code 422", "Network Error", "timeout of
 * 10000ms exceeded") y muchos catch lo muestran tal cual. El interceptor de
 * respuesta del cliente HTTP lo reemplaza por el detalle del backend (que ya
 * llega en espanol) o por un texto equivalente en espanol.
 */

interface HttpErrorLike {
  message?: string
  code?: string
  response?: {
    status?: number
    data?: unknown
  }
}

const AXIOS_GENERIC_MESSAGE = /^(Request failed with status code \d+|Network Error|timeout of \d+ms exceeded|Request aborted|canceled)$/

/** true si el texto es uno de los mensajes genericos (en ingles) de axios. */
export function isGenericHttpClientMessage(message: unknown): boolean {
  return typeof message === 'string' && AXIOS_GENERIC_MESSAGE.test(message.trim())
}

/** Primer texto util del cuerpo del error: errors[0].detail/title, message o error. */
function backendText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const body = data as { errors?: unknown; message?: unknown; error?: unknown }
  if (Array.isArray(body.errors) && body.errors[0] && typeof body.errors[0] === 'object') {
    const first = body.errors[0] as { detail?: unknown; title?: unknown }
    if (typeof first.detail === 'string' && first.detail) return first.detail
    if (typeof first.title === 'string' && first.title) return first.title
  }
  if (typeof body.message === 'string' && body.message) return body.message
  if (typeof body.error === 'string' && body.error) return body.error
  return null
}

/** Texto en espanol segun el codigo HTTP cuando el backend no manda detalle. */
export function httpStatusMessage(status: number): string {
  if (status === 401) return 'Tu sesión expiró; vuelve a iniciar sesión.'
  if (status === 403) return 'No tienes permiso para realizar esta acción.'
  if (status === 404) return 'No se encontró el recurso solicitado.'
  if (status === 409) return 'La operación entra en conflicto con otros registros.'
  if (status === 413) return 'El archivo o la solicitud es demasiado grande.'
  if (status === 419) return 'La sesión expiró; recarga la página e intenta de nuevo.'
  if (status === 422) return 'Hay datos que corregir antes de continuar.'
  if (status === 429) return 'Demasiadas solicitudes; espera un momento e intenta de nuevo.'
  if (status >= 500) return `El servidor no pudo completar la solicitud (error ${status}).`
  return `La solicitud no se pudo completar (error ${status}).`
}

/**
 * Mensaje en espanol para un error HTTP. Solo reemplaza los mensajes genericos
 * de axios; un mensaje propio (p. ej. un Error lanzado por el codigo) se
 * conserva.
 */
export function localizeHttpErrorMessage(error: HttpErrorLike): string | undefined {
  const current = error.message
  if (current && !isGenericHttpClientMessage(current)) return current
  const fromBackend = backendText(error.response?.data)
  if (fromBackend) return fromBackend
  const status = error.response?.status
  if (status) return httpStatusMessage(status)
  if (error.code === 'ECONNABORTED' || /^timeout of/.test(current ?? '')) {
    return 'El servidor tardó demasiado en responder; intenta de nuevo.'
  }
  if (current === 'canceled' || current === 'Request aborted') return 'La solicitud se canceló.'
  return 'No hay conexión con el servidor; revisa tu conexión a internet.'
}
