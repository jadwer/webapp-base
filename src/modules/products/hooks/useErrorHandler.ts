'use client'

import { 
  isForeignKeyConstraintError, 
  getForeignKeyConstraintMessage,
  isValidationError,
  isNetworkError,
  isAuthError,
  getFirstErrorMessage 
} from '../utils/errorHandling'

// Función simple de toast usando DOM directo
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  // Crear toast elemento directamente
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
    word-wrap: break-word;
  `
  toast.textContent = message
  
  // Agregar animación CSS si no existe
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style')
    style.id = 'toast-animations'
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)
  }
  
  // Mostrar toast
  document.body.appendChild(toast)
  
  // Remover después de 6 segundos para errores (más tiempo para leer)
  const duration = type === 'error' ? 6000 : 4000
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideIn 0.3s ease-out reverse'
      setTimeout(() => {
        toast.remove()
      }, 300)
    }
  }, duration)
}

export const useErrorHandler = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleError = (error: unknown, context?: string) => {
    if (isForeignKeyConstraintError(error)) {
      showToast(getForeignKeyConstraintMessage(error), 'error')
      return
    }

    if (isNetworkError(error)) {
      showToast('Sin conexión a internet. Verifique su conexión.', 'error')
      return
    }

    if (isAuthError(error)) {
      showToast('No tiene permisos para realizar esta acción.', 'error')
      return
    }

    if (isValidationError(error)) {
      showToast('Por favor corrija los errores en el formulario.', 'error')
      return
    }

    // Error genérico
    const message = getFirstErrorMessage(error)
    showToast(message, 'error')
  }

  return { handleError }
}

export default useErrorHandler