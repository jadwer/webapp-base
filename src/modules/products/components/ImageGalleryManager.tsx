'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { toast } from '@/lib/toast'
import { productService } from '../services/productService'
import { productImageService } from '../services/productImageService'
import { useProductImages } from '../hooks/useProductImages'
import type { ProductImage } from '../types/productImage'

interface ImageGalleryManagerProps {
  productId: string
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({ productId }) => {
  const { images, isLoading, mutate } = useProductImages(productId)
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.warning(`"${file.name}" no es una imagen valida`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.warning(`"${file.name}" excede el tamano maximo de 10MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    let successCount = 0

    for (const file of validFiles) {
      try {
        const uploadResult = await productService.uploadImage(file)
        await productImageService.create({
          filePath: uploadResult.path,
          productId,
          sortOrder: images.length + successCount,
        })
        successCount++
      } catch {
        toast.error(`Error al subir "${file.name}"`)
      }
    }

    setUploading(false)
    if (successCount > 0) {
      toast.success(`${successCount} imagen${successCount > 1 ? 'es subidas' : ' subida'} correctamente`)
      mutate()
    }
  }, [productId, images.length, mutate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSetPrimary = async (image: ProductImage) => {
    if (image.isPrimary) return
    setSettingPrimaryId(image.id)
    try {
      await productImageService.setPrimary(image.id)
      mutate()
      toast.success('Imagen principal actualizada')
    } catch {
      toast.error('Error al establecer imagen principal')
    }
    setSettingPrimaryId(null)
  }

  const handleDelete = async (image: ProductImage) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    setDeletingId(image.id)
    try {
      await productImageService.delete(image.id)
      mutate()
      toast.success('Imagen eliminada')
    } catch {
      toast.error('Error al eliminar la imagen')
    }
    setDeletingId(null)
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Reorder locally for immediate feedback
    const reordered = [...images]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, moved)

    // Optimistic update
    mutate(reordered, false)

    try {
      await productImageService.reorder(reordered.map(img => img.id))
      mutate()
    } catch {
      toast.error('Error al reordenar imagenes')
      mutate()
    }

    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  if (isLoading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted small mt-2 mb-0">Cargando galeria...</p>
      </div>
    )
  }

  return (
    <div className="image-gallery-manager">
      <label className="form-label">Galeria de imagenes</label>

      <div className="d-flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className="position-relative"
            style={{
              width: 120,
              height: 120,
              border: dragOverIndex === index
                ? '2px solid var(--bs-primary)'
                : image.isPrimary
                  ? '2px solid #8AC905'
                  : '2px solid var(--bs-border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'grab',
              opacity: draggedIndex === index ? 0.4 : 1,
              transition: 'border-color 0.15s, opacity 0.15s',
            }}
          >
            <Image
              src={image.imageUrl || `/storage/${image.filePath}`}
              alt={image.altText || 'Imagen del producto'}
              fill
              sizes="120px"
              style={{ objectFit: 'cover' }}
              unoptimized
            />

            {/* Primary badge */}
            {image.isPrimary && (
              <span
                className="position-absolute badge bg-success"
                style={{ top: 4, left: 4, fontSize: '0.65rem' }}
              >
                Principal
              </span>
            )}

            {/* Action buttons overlay */}
            <div
              className="position-absolute d-flex gap-1"
              style={{ bottom: 4, right: 4 }}
            >
              {/* Set primary button */}
              {!image.isPrimary && (
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  style={{ padding: '0 4px', fontSize: '0.75rem', lineHeight: 1.5 }}
                  title="Establecer como principal"
                  disabled={settingPrimaryId === image.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetPrimary(image)
                  }}
                >
                  {settingPrimaryId === image.id ? (
                    <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                  ) : (
                    <i className="bi bi-star" />
                  )}
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                className="btn btn-sm btn-danger"
                style={{ padding: '0 4px', fontSize: '0.75rem', lineHeight: 1.5 }}
                title="Eliminar imagen"
                disabled={deletingId === image.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(image)
                }}
              >
                {deletingId === image.id ? (
                  <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                ) : (
                  <i className="bi bi-x" />
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Add image card */}
        <div
          style={{
            width: 120,
            height: 120,
            border: '2px dashed var(--bs-border-color)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Subiendo...</span>
            </div>
          ) : (
            <>
              <i className="bi bi-plus-lg text-muted" style={{ fontSize: '1.5rem' }} />
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Agregar</span>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="d-none"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleInputChange}
        disabled={uploading}
      />

      <small className="text-muted d-block mt-1">
        Arrastra para reordenar. JPG, PNG, GIF o WebP. Max 10MB por imagen.
      </small>
    </div>
  )
}

export default ImageGalleryManager
