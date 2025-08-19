'use client'

import React, { useState } from 'react'
import { Card, Button } from '@/ui/components/base'
// import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { laborWasserTemplates } from '../blocks/laborwasser-blocks'
import { heroRevolutionBlocks } from '../blocks/hero-revolution-blocks'
import { publicCatalogTemplates } from '../templates/PublicCatalogTemplates'
import styles from './TemplateGallery.module.scss'

interface Template {
  name: string
  description: string
  thumbnail: string
  content: string
}

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void
  onClose?: () => void
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ 
  onSelectTemplate, 
  onClose 
}) => {
  // const navigation = useNavigationProgress() // Removed unused variable
  // const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null) // Removed unused state
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  // Combine all templates
  const laborTemplates = Object.entries(laborWasserTemplates).map(([key, template]) => ({
    id: key,
    category: 'LaborWasser',
    ...template
  }))

  const catalogTemplates = publicCatalogTemplates.map(template => ({
    id: template.id,
    category: template.category,
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
    content: template.html
  }))

  const templates = [...laborTemplates, ...catalogTemplates]

  const handleSelectTemplate = (template: Template) => {
    // Process dynamic hero templates
    const processedTemplate = { ...template }
    
    if (template.content.includes('<!-- Hero Slider será insertado dinámicamente -->')) {
      const heroSlider = heroRevolutionBlocks.find(block => block.id === 'hero-slider')
      if (heroSlider) {
        processedTemplate.content = template.content.replace(
          '<!-- Hero Slider será insertado dinámicamente -->',
          heroSlider.content
        )
      }
    }
    
    if (template.content.includes('<!-- Hero Video será insertado dinámicamente -->')) {
      const heroVideo = heroRevolutionBlocks.find(block => block.id === 'hero-video')
      if (heroVideo) {
        processedTemplate.content = template.content.replace(
          '<!-- Hero Video será insertado dinámicamente -->',
          heroVideo.content
        )
      }
    }
    
    if (template.content.includes('<!-- Hero Parallax será insertado dinámicamente -->')) {
      const heroParallax = heroRevolutionBlocks.find(block => block.id === 'hero-parallax')
      if (heroParallax) {
        processedTemplate.content = template.content.replace(
          '<!-- Hero Parallax será insertado dinámicamente -->',
          heroParallax.content
        )
      }
    }
    
    onSelectTemplate(processedTemplate)
    if (onClose) {
      onClose()
    }
  }

  const handlePreview = (template: Template) => {
    // Process dynamic hero templates for preview
    const processedTemplate = { ...template }
    
    if (template.content.includes('<!-- Hero Slider será insertado dinámicamente -->')) {
      const heroSlider = heroRevolutionBlocks.find(block => block.id === 'hero-slider')
      if (heroSlider) {
        processedTemplate.content = template.content.replace(
          '<!-- Hero Slider será insertado dinámicamente -->',
          heroSlider.content
        )
      }
    }
    
    if (template.content.includes('<!-- Hero Video será insertado dinámicamente -->')) {
      const heroVideo = heroRevolutionBlocks.find(block => block.id === 'hero-video')
      if (heroVideo) {
        processedTemplate.content = template.content.replace(
          '<!-- Hero Video será insertado dinámicamente -->',
          heroVideo.content
        )
      }
    }
    
    if (template.content.includes('<!-- Hero Parallax será insertado dinámicamente -->')) {
      const heroParallax = heroRevolutionBlocks.find(block => block.id === 'hero-parallax')
      if (heroParallax) {
        processedTemplate.content = template.content.replace(
          '<!-- Hero Parallax será insertado dinámicamente -->',
          heroParallax.content
        )
      }
    }
    
    setPreviewTemplate(processedTemplate)
  }

  return (
    <div className={styles.templateGallery}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <i className="bi bi-layout-text-window-reverse me-2"></i>
          Galería de Templates
        </h2>
        <p className={styles.subtitle}>
          Selecciona un template profesional para comenzar tu página
        </p>
      </div>

      <div className={styles.templates}>
        <div className="row g-4">
          {templates.map((template) => (
            <div key={template.id} className="col-lg-4 col-md-6">
              <Card className={styles.templateCard}>
                <div className={styles.templateThumbnail}>
                  <div className={styles.thumbnailPlaceholder}>
                    <i className="bi bi-file-earmark-richtext"></i>
                    <span>{template.name}</span>
                  </div>
                  <div className={styles.templateOverlay}>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handlePreview(template)}
                      className={styles.previewButton}
                    >
                      <i className="bi bi-eye"></i> Vista Previa
                    </Button>
                  </div>
                </div>
                <div className={styles.templateInfo}>
                  <h5 className={styles.templateName}>{template.name}</h5>
                  <p className={styles.templateDescription}>
                    {template.description}
                  </p>
                  <div className={styles.templateActions}>
                    <Button
                      variant="success"
                      size="small"
                      onClick={() => handleSelectTemplate(template)}
                      className={styles.useButton}
                    >
                      <i className="bi bi-check-circle"></i> Usar Template
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          {/* Template vacío */}
          <div className="col-lg-4 col-md-6">
            <Card className={styles.templateCard}>
              <div className={styles.templateThumbnail}>
                <div className={styles.thumbnailPlaceholder}>
                  <i className="bi bi-file-earmark-plus"></i>
                  <span>Página en Blanco</span>
                </div>
              </div>
              <div className={styles.templateInfo}>
                <h5 className={styles.templateName}>Página en Blanco</h5>
                <p className={styles.templateDescription}>
                  Comienza desde cero con una página vacía
                </p>
                <div className={styles.templateActions}>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleSelectTemplate({
                      name: 'Página en Blanco',
                      description: 'Página vacía',
                      thumbnail: '',
                      content: '<div class="container"><h1>Nueva Página</h1></div>'
                    })}
                    className={styles.useButton}
                  >
                    <i className="bi bi-plus-circle"></i> Crear desde Cero
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className={styles.previewModal}>
          <div className={styles.previewContent}>
            <div className={styles.previewHeader}>
              <h3>{previewTemplate.name}</h3>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setPreviewTemplate(null)}
              >
                <i className="bi bi-x"></i>
              </Button>
            </div>
            <div className={styles.previewBody}>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
                      <style>
                        body { margin: 0; padding: 0; }
                      </style>
                    </head>
                    <body>
                      ${previewTemplate.content}
                    </body>
                  </html>
                `}
                className={styles.previewIframe}
              />
            </div>
            <div className={styles.previewFooter}>
              <Button
                variant="secondary"
                onClick={() => setPreviewTemplate(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="success"
                onClick={() => handleSelectTemplate(previewTemplate)}
              >
                <i className="bi bi-check-circle"></i> Usar este Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateGallery