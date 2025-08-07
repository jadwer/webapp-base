'use client'

import { useRef, useEffect } from 'react'
import initPageBuilder from '@/modules/page-builder-pro'
import ToastNotifier, { ToastNotifierHandle } from '@/modules/page-builder-pro/components/ToastNotifier'
import { ToastType } from '@/modules/page-builder-pro/types/ToastType'

export default function PageBuilderTestPage() {
  const editorRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<ToastNotifierHandle>(null)

  useEffect(() => {
    if (!editorRef.current) return

    let editor: any

    const initAsync = async () => {
      try {
        editor = await initPageBuilder(editorRef.current!, (msg: string, type?: ToastType) => {
          toastRef.current?.show(msg, type)
        })
        console.log('Editor initialized successfully:', editor)
      } catch (error) {
        console.error('Error initializing editor:', error)
      }
    }

    initAsync()

    return () => {
      try {
        if (editor && typeof editor.destroy === 'function') {
          editor.destroy()
        }
      } catch (error) {
        console.warn('Error destroying editor:', error)
      }
    }
  }, [])

  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Page Builder Test</h1>
      <div 
        ref={editorRef}
        style={{ 
          minHeight: '80vh',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
      <ToastNotifier ref={toastRef} />
    </div>
  )
}