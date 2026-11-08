import { axiosClient } from '@lwm/auth'
import type { GuideAction } from '../types'

/**
 * Ejecuta una accion tal como la describe la API (metodo, ruta y cuerpo). Es
 * el manejador generico de D10: solo para acciones SIN `asks`; las que piden
 * datos las ejecuta la pagina con su formulario. El motivo viaja en el cuerpo
 * (`reason`) y en la cabecera que lee el activity log.
 */
export async function runGuideAction(action: GuideAction, reason?: string): Promise<void> {
  const trimmed = reason?.trim()
  const body = { ...(action.action.body ?? {}), ...(trimmed ? { reason: trimmed } : {}) }
  await axiosClient.request({
    method: action.action.method,
    url: action.action.path,
    data: action.action.method === 'GET' ? undefined : body,
    headers: trimmed ? { 'X-Change-Reason': encodeURIComponent(trimmed) } : undefined,
  })
}
