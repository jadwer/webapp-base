/**
 * Simple toast notification system
 * Compatible API with sonner for easy migration
 */

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  description?: string
}

const TOAST_DURATION = 4000

// Create toast container if not exists
function getOrCreateContainer(): HTMLElement {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `
    document.body.appendChild(container)
  }
  return container
}

function createToastElement(message: string, type: ToastType, options?: ToastOptions): HTMLElement {
  const toastEl = document.createElement('div')
  toastEl.style.cssText = `
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 280px;
    max-width: 420px;
    pointer-events: auto;
    animation: slideIn 0.2s ease-out;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.875rem;
  `

  // Type-specific styles
  const styles: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
    success: { bg: '#f0fdf4', border: '#86efac', icon: '\u2713', iconColor: '#16a34a' },
    error: { bg: '#fef2f2', border: '#fca5a5', icon: '\u2715', iconColor: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '\u26A0', iconColor: '#d97706' },
    info: { bg: '#eff6ff', border: '#93c5fd', icon: '\u2139', iconColor: '#2563eb' }
  }

  const style = styles[type]
  toastEl.style.backgroundColor = style.bg
  toastEl.style.border = `1px solid ${style.border}`

  const icon = document.createElement('span')
  icon.textContent = style.icon
  icon.style.cssText = `
    color: ${style.iconColor};
    font-weight: bold;
    flex-shrink: 0;
  `

  const content = document.createElement('div')
  content.style.cssText = 'flex: 1; color: #374151;'

  const messageEl = document.createElement('div')
  messageEl.textContent = message
  messageEl.style.fontWeight = '500'
  content.appendChild(messageEl)

  if (options?.description) {
    const descEl = document.createElement('div')
    descEl.textContent = options.description
    descEl.style.cssText = 'font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem;'
    content.appendChild(descEl)
  }

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '\u00D7'
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    flex-shrink: 0;
  `
  closeBtn.onclick = () => removeToast(toastEl)

  toastEl.appendChild(icon)
  toastEl.appendChild(content)
  toastEl.appendChild(closeBtn)

  return toastEl
}

function removeToast(toastEl: HTMLElement) {
  toastEl.style.animation = 'slideOut 0.2s ease-in forwards'
  setTimeout(() => toastEl.remove(), 200)
}

function showToast(message: string, type: ToastType, options?: ToastOptions) {
  // Inject keyframes if not already done
  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style')
    style.id = 'toast-keyframes'
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  const container = getOrCreateContainer()
  const toastEl = createToastElement(message, type, options)
  container.appendChild(toastEl)

  const duration = options?.duration ?? TOAST_DURATION
  if (duration > 0) {
    setTimeout(() => {
      if (toastEl.parentNode) {
        removeToast(toastEl)
      }
    }, duration)
  }
}

// Public API (compatible with sonner)
interface ToastFunction {
  (message: string, options?: ToastOptions): void
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
}

const toastFn = ((message: string, options?: ToastOptions) => {
  showToast(message, 'info', options)
}) as ToastFunction

toastFn.success = (message: string, options?: ToastOptions) => showToast(message, 'success', options)
toastFn.error = (message: string, options?: ToastOptions) => showToast(message, 'error', options)
toastFn.warning = (message: string, options?: ToastOptions) => showToast(message, 'warning', options)
toastFn.info = (message: string, options?: ToastOptions) => showToast(message, 'info', options)

export const toast = toastFn
