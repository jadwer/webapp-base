'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input } from '@/ui/components/base'
import { PagesService } from '../services/pagesService'
import type { Page, CreatePageData, UpdatePageData } from '../types/page'

interface PageFormProps {
  page?: Page | null
  onSubmit: (data: CreatePageData | UpdatePageData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

interface FormData {
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived' | 'deleted'
}

export const PageForm: React.FC<PageFormProps> = ({
  page,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}) => {
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)
  const isEditing = Boolean(page)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      status: page?.status === 'deleted' ? 'draft' : (page?.status || 'draft') // Never allow deleted in form
    }
  })

  const watchedSlug = watch('slug')

  // Auto-generate slug in real-time as user types
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setValue('title', title)
    
    // Generate slug in real-time
    if (title) {
      const generatedSlug = generateSlug(title)
      setValue('slug', generatedSlug)
    } else {
      setValue('slug', '')
    }
  }

  // Check and auto-increment slug when user leaves title field
  const handleTitleBlur = async () => {
    const currentSlug = watchedSlug
    if (currentSlug) {
      setIsGeneratingSlug(true)
      try {
        const uniqueSlug = await PagesService.generateUniqueSlug({
          baseSlug: currentSlug,
          excludeId: page?.id,
          includeDeleted: false
        })
        
        // Only update if the slug changed (means it was taken)
        if (uniqueSlug !== currentSlug) {
          setValue('slug', uniqueSlug)
        }
      } catch {
        // Error handled silently
      } finally {
        setIsGeneratingSlug(false)
      }
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      // Normalize accented characters
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[ç]/g, 'c')
      // Replace em dashes, en dashes, and other dashes with regular hyphens
      .replace(/[—–−]/g, '-')
      // Replace spaces and other non-alphanumeric chars with hyphens
      .replace(/[^a-z0-9-]/g, '-')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
  }


  const handleFormSubmit = async (formData: FormData) => {
    try {
      const submitData: CreatePageData | UpdatePageData = {
        title: formData.title,
        slug: formData.slug,
        status: formData.status,
        // For new pages, include default content
        ...(!isEditing && {
          html: '<div class="container"><h1>Nueva página</h1><p>Contenido inicial</p></div>',
          css: '',
          json: {}
        })
      }

      await onSubmit(submitData)
    } catch {
      // Error handled silently
    }
  }


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={className}>
      <div className="row g-3">
        <div className="col-12">
          <Input
            label="Título"
            placeholder="Ingresa el título de la página"
            required
            errorText={errors.title?.message}
            {...register('title', {
              required: 'El título es obligatorio',
              minLength: {
                value: 3,
                message: 'El título debe tener al menos 3 caracteres'
              },
              maxLength: {
                value: 200,
                message: 'El título no puede exceder 200 caracteres'
              }
            })}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
          />
        </div>

        <div className="col-12">
          <Input
            label="Slug (URL)"
            placeholder="url-amigable"
            helpText="Se genera automáticamente desde el título. Solo se permiten letras, números y guiones."
            required
            errorText={errors.slug?.message}
            leftIcon="bi-link-45deg"
            rightIcon={isGeneratingSlug ? 'bi-hourglass-split' : watchedSlug ? 'bi-check-circle' : undefined}
            {...register('slug', {
              required: 'El slug es obligatorio',
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: 'El slug solo puede contener letras minúsculas, números y guiones'
              },
              minLength: {
                value: 3,
                message: 'El slug debe tener al menos 3 caracteres'
              }
            })}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Estado</label>
          <select 
            className="form-select"
            {...register('status', { required: 'El estado es obligatorio' })}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
          {errors.status && (
            <div className="text-danger small mt-1">{errors.status.message}</div>
          )}
        </div>

        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>¿Cómo funciona?</strong><br />
            1. Completa el título y slug de tu página<br />
            2. Selecciona si quieres que sea borrador o publicada<br />
            3. Haz clic en &quot;{isEditing ? 'Actualizar' : 'Crear'}&quot; para guardar en el servidor<br />
            4. Luego usa el editor visual de abajo para diseñar tu página
          </div>
          
          <div className="d-flex gap-2 justify-content-end">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                buttonStyle="outline"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancelar
              </Button>
            )}
            
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
              startIcon={<i className="bi bi-cloud-arrow-up" />}
            >
              {isEditing ? '💾 Actualizar en Servidor' : '🚀 Crear en Servidor'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PageForm