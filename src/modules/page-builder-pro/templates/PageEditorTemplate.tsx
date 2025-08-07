'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button, Card } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { usePage, usePageActions } from '../hooks/usePages'
import PageForm from '../components/PageForm'
import ToastNotifier, { ToastNotifierHandle } from '../components/ToastNotifier'
import initPageBuilder from '../index'
import type { CreatePageData, UpdatePageData } from '../types/page'

interface PageEditorTemplateProps {
  pageId?: string | null | undefined
  onSave?: (pageId: string) => void
  onCancel?: () => void
  className?: string
}

export const PageEditorTemplate: React.FC<PageEditorTemplateProps> = ({
  pageId,
  onSave,
  onCancel,
  className
}) => {
  const navigation = useNavigationProgress()
  const editorRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<ToastNotifierHandle>(null)
  const [grapesjsEditor, setGrapesjsEditor] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const initializingRef = useRef(false) // Prevent double initialization
  const cleanupRef = useRef<(() => void) | null>(null)

  const { page, isLoading: pageLoading } = usePage(pageId)
  const { createPage, updatePage, isLoading: actionLoading } = usePageActions()
  
  const isEditing = Boolean(pageId && page)
  const isLoading = pageLoading || actionLoading

  // Initialize GrapeJS editor - single effect
  useEffect(() => {
    console.log('useEffect triggered - editorRef:', !!editorRef.current, 'pageId:', pageId, 'initializing:', initializingRef.current)
    
    // Prevent double initialization (React StrictMode protection)
    if (initializingRef.current) {
      console.log('Already initializing, skipping...')
      return
    }
    
    // Cleanup any existing editor first
    if (cleanupRef.current) {
      console.log('Cleaning up previous editor...')
      cleanupRef.current()
      cleanupRef.current = null
    }
    
    // Wait for the DOM element to be available
    const initWhenReady = () => {
      if (!editorRef.current) {
        console.log('Editor ref not ready, waiting...')
        setTimeout(initWhenReady, 100)
        return
      }
      
      if (initializingRef.current) {
        console.log('Already initializing in another call, aborting...')
        return
      }
      
      initializingRef.current = true
      console.log('Editor ref is ready, proceeding with initialization')

      const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        toastRef.current?.show(msg, type)
      }

      let editor: any = null

      const initAsync = async () => {
        try {
          console.log('Starting editor initialization...')
          console.log('PageID:', pageId)
          console.log('Page data available:', !!page)
          console.log('Page HTML available:', !!(page && page.html))
          
          // Initialize new editor
          // Disable autoLoad from localStorage when editing an existing page
          editor = await initPageBuilder(editorRef.current!, notify, { 
            disableAutoLoad: Boolean(pageId) 
          })
          console.log('Editor created successfully')
          
          // Set default loading content immediately
          editor.setComponents(`
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 400px; 
              background: #f8f9fa;
              border-radius: 8px;
              margin: 20px;
              color: #6c757d;
              font-family: Arial, sans-serif;
            ">
              <div style="text-align: center;">
                <div style="
                  display: inline-block; 
                  width: 40px; 
                  height: 40px; 
                  border: 4px solid #e3e3e3; 
                  border-top: 4px solid #007bff; 
                  border-radius: 50%; 
                  animation: spin 1s linear infinite; 
                  margin-bottom: 16px;
                "></div>
                <div style="font-size: 18px; font-weight: 500;">Cargando contenido de la página...</div>
                <div style="font-size: 14px; margin-top: 8px; opacity: 0.7;">Por favor espera un momento</div>
              </div>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `)
          
          // Set up cleanup function
          cleanupRef.current = () => {
            if (editor && typeof editor.destroy === 'function') {
              try {
                console.log('Destroying editor...')
                editor.destroy()
              } catch (error) {
                console.warn('Error destroying editor:', error)
              }
            }
            initializingRef.current = false
          }
          
          setGrapesjsEditor(editor)
          console.log('Editor initialization complete with loading content, real content loading will be handled separately')

        } catch (error) {
          console.error('Error initializing page builder:', error)
          notify('Error al inicializar el editor', 'error')
          initializingRef.current = false
        }
      }

      initAsync()
    }

    // Start the initialization process
    initWhenReady()

    // Cleanup function
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      setGrapesjsEditor(null)
    }
  }, [pageId]) // Only re-initialize when pageId changes, not page data

  // Separate effect for loading content when page data becomes available
  useEffect(() => {
    console.log('Content loading effect - grapesjsEditor:', !!grapesjsEditor, 'page:', !!page, 'page.html:', !!(page && page.html))
    
    if (!grapesjsEditor || !page || !page.html) {
      console.log('Not ready to load content yet')
      return
    }
    
    console.log('Setting up content loading for editor...')
    
    const loadContent = () => {
      console.log('🔄 Starting content load process...')
      console.log('Page data:', { 
        hasHtml: !!page.html, 
        hasCSS: !!page.css, 
        hasJSON: !!(page.json && typeof page.json === 'object' && Object.keys(page.json).length > 0),
        htmlLength: page.html?.length,
        cssLength: page.css?.length 
      })
      
      // Listen for when canvas is ready to receive content
      const handleCanvasFrameLoad = () => {
        console.log('🎯 Canvas frame loaded, checking current state...')
        
        // First, let's see what's currently in the editor (with safety check)
        let currentBefore = ''
        try {
          if (grapesjsEditor && !grapesjsEditor.destroyed) {
            currentBefore = grapesjsEditor.getHtml()
            console.log('📄 Current content BEFORE loading:', {
              hasContent: currentBefore.length > 0,
              preview: currentBefore.substring(0, 200) + '...'
            })
          }
        } catch (beforeError) {
          console.log('⚠️ Could not get current content (editor may be destroyed):', beforeError.message)
        }
        
        try {
          // Let's try a step-by-step approach to see where it fails
          console.log('Loading page content...')
          
          // Check if editor is still valid before proceeding
          if (!grapesjsEditor || grapesjsEditor.destroyed) {
            console.log('🛑 Editor is destroyed, aborting content loading')
            return
          }

          // Load the actual page content directly
          try {
            console.log('Setting page content:', page.html.substring(0, 100) + '...')
            grapesjsEditor.setComponents(page.html)
            if (page.css) {
              grapesjsEditor.setStyle(page.css)
            }
            console.log('✅ Page content loaded successfully')
            
            // Final refresh
            if (grapesjsEditor && !grapesjsEditor.destroyed) {
              grapesjsEditor.refresh()
            }
          } catch (error) {
            console.error('❌ Error loading page content:', error)
          }
          
        } catch (error) {
          console.error('❌ Error loading content:', error)
        }
      }
      
      // Listen for canvas frame load event
      grapesjsEditor.on('canvas:frame:load', handleCanvasFrameLoad)
      
      // Also try immediately in case canvas is already loaded
      const canvas = grapesjsEditor.Canvas
      if (canvas && canvas.getFrameEl && canvas.getFrameEl()) {
        console.log('🎯 Canvas already available, loading content immediately...')
        setTimeout(handleCanvasFrameLoad, 100)
      } else {
        console.log('⏳ Waiting for canvas frame to load...')
      }
      
      // Cleanup listener
      return () => {
        grapesjsEditor.off('canvas:frame:load', handleCanvasFrameLoad)
      }
    }

    // Wait for the editor to be fully ready with proper LayerManager initialization
    const waitForEditorReady = () => {
      // Enhanced check for all necessary components
      if (!grapesjsEditor.getContainer || 
          !grapesjsEditor.getContainer() ||
          !grapesjsEditor.DomComponents ||
          !grapesjsEditor.LayerManager ||
          !grapesjsEditor.Canvas ||
          typeof grapesjsEditor.DomComponents.addComponent !== 'function') {
        console.log('⏳ Editor not fully ready, waiting 500ms...')
        setTimeout(waitForEditorReady, 500)
        return
      }
      
      console.log('✅ Editor is fully ready with all components, starting content loading...')
      // Add a small delay to ensure LayerManager is fully initialized
      setTimeout(() => {
        const cleanup = loadContent()
        
        // Store cleanup function for this effect
        return cleanup
      }, 200)
    }

    // Start checking for editor readiness
    const cleanup = waitForEditorReady()
    
    // Return cleanup function for this effect
    return cleanup
    
  }, [grapesjsEditor, page?.id, page?.html, page?.css, page?.json])

  const handleFormSubmit = async (formData: CreatePageData | UpdatePageData) => {
    try {
      let pageData = { ...formData }

      // If we have an editor instance, get the current content
      if (grapesjsEditor) {
        pageData = {
          ...pageData,
          html: grapesjsEditor.getHtml(),
          css: grapesjsEditor.getCss(),
          json: grapesjsEditor.getProjectData()
        }
      }

      let resultPage
      if (isEditing && pageId) {
        resultPage = await updatePage(pageId, pageData as UpdatePageData)
        toastRef.current?.show('Página actualizada correctamente', 'success')
      } else {
        resultPage = await createPage(pageData as CreatePageData)
        toastRef.current?.show('Página creada correctamente', 'success')
      }

      if (resultPage) {
        if (onSave) {
          onSave(resultPage.id)
        } else {
          navigation.push('/dashboard/pages')
        }
      }
    } catch {
      toastRef.current?.show(
        `Error al ${isEditing ? 'actualizar' : 'crear'} la página`,
        'error'
      )
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigation.back()
    }
  }

  const handleQuickSave = async () => {
    if (!grapesjsEditor || !pageId || !page) return

    try {
      const pageData: UpdatePageData = {
        html: grapesjsEditor.getHtml(),
        css: grapesjsEditor.getCss(),
        json: grapesjsEditor.getProjectData()
      }

      await updatePage(pageId, pageData)
      toastRef.current?.show('Cambios guardados automáticamente', 'success')
    } catch {
      toastRef.current?.show('Error al guardar cambios', 'error')
    }
  }

  const handlePreview = () => {
    if (!grapesjsEditor) return
    
    const html = grapesjsEditor.getHtml()
    const css = grapesjsEditor.getCss()
    const fullHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`
    
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando editor de páginas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">
            {isEditing ? `✏️ Editar: ${page?.title}` : '🆕 Crear Nueva Página'}
          </h1>
          <p className="text-muted mb-0">
            {isEditing 
              ? 'Actualiza la información básica y luego usa el editor visual para modificar el diseño' 
              : 'Primero configura el título y slug, luego diseña tu página con el editor visual'
            }
          </p>
        </div>

        <div className="d-flex gap-2">
          {isEditing && (
            <>
              <Button
                variant="secondary"
                buttonStyle="outline"
                onClick={handleQuickSave}
                disabled={isLoading}
                startIcon={<i className="bi bi-cloud-arrow-up" />}
              >
                Guardar cambios
              </Button>
              
              <Button
                variant="secondary"
                buttonStyle="outline"
                onClick={handlePreview}
                startIcon={<i className="bi bi-eye" />}
              >
                Vista previa
              </Button>
            </>
          )}
          
          <Button
            variant="secondary"
            buttonStyle="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isEditing ? 'Cancelar' : 'Volver'}
          </Button>
        </div>
      </div>

      {/* Page Settings (always visible at top) */}
      {(!isEditing || page) && (
        <Card className="mb-3">
          <div className="p-3">
            <h5 className="mb-3">Información de la Página</h5>
            
            <PageForm
              page={page}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        </Card>
      )}

      {/* Visual Editor */}
      <Card className="p-0">
        <div className="bg-light p-2 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-palette me-2" />
            Editor Visual
          </h6>
          <div className="small text-muted">
            {grapesjsEditor ? 'Editor listo' : 'Iniciando editor...'}
          </div>
        </div>
        
        <div 
          ref={editorRef}
          style={{ 
            minHeight: '70vh',
            border: 'none'
          }}
        />
      </Card>

      <ToastNotifier ref={toastRef} />
    </div>
  )
}

export default PageEditorTemplate