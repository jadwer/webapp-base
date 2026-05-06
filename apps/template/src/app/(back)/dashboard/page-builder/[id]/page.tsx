'use client'

import React from 'react'
import { PageEditorTemplate } from '@/modules/page-builder-pro'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Button } from '@/ui/components/base'

interface PageBuilderEditorPageProps {
  params: Promise<{ id: string }>
}

export default function PageBuilderEditorPage({ params }: PageBuilderEditorPageProps) {
  const navigation = useNavigationProgress()
  const [pageId, setPageId] = React.useState<string | null>(null)
  
  // Handle async params for Next.js 15
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setPageId(resolvedParams.id)
    })
  }, [params])

  const handleSave = () => {
    // Redirect to pages management after save
    navigation.push('/dashboard/pages')
  }

  const handleCancel = () => {
    // Go back to pages management
    navigation.push('/dashboard/pages')
  }

  // Show loading while params are being resolved
  if (!pageId) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Preparando editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header Bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button
            variant="secondary"
            size="small"
            onClick={handleCancel}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Volver
          </Button>
          <div>
            <h5 style={{ margin: 0, fontWeight: 600 }}>
              <i className="bi bi-brush me-2"></i>
              Editor Visual de Páginas
            </h5>
            <small style={{ color: '#666' }}>
              Página ID: {pageId}
            </small>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              // Trigger save from editor if available
              const event = new CustomEvent('pagebuilder-save');
              window.dispatchEvent(event);
            }}
          >
            <i className="bi bi-floppy me-1"></i>
            Guardar
          </Button>
          <Button
            variant="success"
            size="small"
            onClick={() => {
              // Open preview in new tab
              window.open(`/p/preview-${pageId}`, '_blank');
            }}
          >
            <i className="bi bi-eye me-1"></i>
            Vista Previa
          </Button>
        </div>
      </div>

      {/* Page Editor */}
      <PageEditorTemplate
        pageId={pageId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}