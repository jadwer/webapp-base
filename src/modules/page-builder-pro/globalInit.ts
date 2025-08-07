// Global GrapeJS initialization
// This ensures all required dependencies are loaded only once

let isGloballyInitialized = false
let initPromise: Promise<void> | null = null

export function ensureGrapeJSGlobalInit(): Promise<void> {
  if (isGloballyInitialized) return Promise.resolve()
  
  if (initPromise) return initPromise
  
  initPromise = new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined') {
        resolve()
        return
      }
      
      // Load GrapeJS CSS if not already loaded
      const existingLink = document.head.querySelector('link[href*="grapes.min.css"]')
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
        document.head.appendChild(link)
        
        // Wait for CSS to load
        link.onload = () => {
          isGloballyInitialized = true
          resolve()
        }
        
        link.onerror = () => {
          console.error('Failed to load GrapeJS CSS')
          reject(new Error('Failed to load GrapeJS CSS'))
        }
        
        // Fallback timeout
        setTimeout(() => {
          if (!isGloballyInitialized) {
            console.warn('GrapeJS CSS load timeout, proceeding anyway')
            isGloballyInitialized = true
            resolve()
          }
        }, 3000)
      } else {
        // CSS already loaded
        isGloballyInitialized = true
        resolve()
      }
    } catch (error) {
      console.warn('Error in global GrapeJS init:', error)
      reject(error)
    }
  })
  
  return initPromise
}

export function resetGlobalInit() {
  isGloballyInitialized = false
  initPromise = null
}