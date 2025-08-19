'use client'

import React, { useState } from 'react'
// import { useRouter } from 'next/navigation'
import { TemplateGallery } from '@/modules/page-builder-pro/components/TemplateGallery'
import { usePageActions } from '@/modules/page-builder-pro'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function TemplatesPage() {
  // const router = useRouter() // Removed unused variable
  const navigation = useNavigationProgress()
  const { createPage } = usePageActions()
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectTemplate = async (template: { name: string; content: string }) => {
    try {
      setIsCreating(true)
      
      // Crear página con el contenido del template
      const newPage = await createPage({
        title: `Nueva página desde ${template.name}`,
        slug: `pagina-${Date.now()}`,
        html: template.content,
        css: '',
        json: {},
        status: 'draft'
      })

      if (newPage) {
        // 🔧 SOLUCIÓN: Guardar temporalmente en localStorage para evitar 404
        const tempPageData = {
          id: newPage.id,
          title: newPage.title,
          slug: newPage.slug,
          html: newPage.html,
          css: newPage.css,
          json: newPage.json,
          status: newPage.status,
          createdAt: newPage.createdAt,
          updatedAt: newPage.updatedAt,
          timestamp: Date.now() // Para cleanup automático
        }
        localStorage.setItem(`temp-page-${newPage.id}`, JSON.stringify(tempPageData))
        
        // Redirigir al editor con la nueva página
        navigation.push(`/dashboard/page-builder/${newPage.id}`)
      }
    } catch (error) {
      console.error('Error creating page from template:', error)
      alert('Error al crear la página desde el template')
    } finally {
      setIsCreating(false)
    }
  }

  const handleBack = () => {
    navigation.push('/dashboard/pages')
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Galería de Templates</h1>
        <Button
          variant="secondary"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver
        </Button>
      </div>

      {isCreating ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Creando página...</span>
          </div>
          <p className="mt-3">Creando página desde template...</p>
        </div>
      ) : (
        <TemplateGallery
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  )
}