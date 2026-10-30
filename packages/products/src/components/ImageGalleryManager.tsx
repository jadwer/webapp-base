'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { toast } from '@lwm/ui'
import { productService } from '../services/productService'
import { productImageService } from '../services/productImageService'
import { useProductImages } from '../hooks/useProductImages'
import { extractApiErrorMessage } from '../utils/errorHandling'
import type { ProductImage } from '../types/productImage'
import { ConfirmModal, type ConfirmModalHandle } from '@lwm/ui'

interface ImageGalleryManagerProps {
  productId: string
  /**
   * products.img_path / imgUrl. Si la galeria esta vacia pero el producto trae
   * imagen (dato legado sin fila en product_images), se muestra como "Imagen
   * actual" para poder quitarla o reemplazarla.
   */
  legacyImgPath?: string | null
  legacyImgUrl?: string | null
}

const MAX_SIZE_MB = 10
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'

/** Primaria primero y luego sortOrder: el mismo orden que la ficha publica. */
export function sortGalleryImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  })
}

function imageSrc(image: ProductImage): string {
  return image.imageUrl || `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/storage/${image.filePath}`
}

const actionButtonStyle: React.CSSProperties = { padding: '0 4px', fontSize: '0.75rem', lineHeight: 1.5 }

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  productId,
  legacyImgPath = null,
  legacyImgUrl = null,
}) => {
  const { images: rawImages, isLoading, error: loadError, mutate } = useProductImages(productId)
  const images = useMemo(() => sortGalleryImages(rawImages), [rawImages])
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [legacyCleared, setLegacyCleared] = useState(false)
  const [makeFirstPrimary, setMakeFirstPrimary] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const replaceTargetRef = useRef<ProductImage | 'legacy' | null>(null)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const showLegacy = images.length === 0 && !!legacyImgPath && !legacyCleared && !isLoading
  const hasAnyImage = images.length > 0 || showLegacy

  /** Error visible con el detalle del backend (regla 7). */
  const reportError = useCallback((err: unknown, fallback: string) => {
    const message = extractApiErrorMessage(err, fallback)
    toast.error(message)
    setErrors(prev => [...prev, message].slice(-5))
  }, [])

  const validateFiles = (files: File[]): File[] =>
    files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.warning(`"${file.name}" no es una imagen valida`)
        return false
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.warning(`"${file.name}" excede el tamaño máximo de ${MAX_SIZE_MB}MB`)
        return false
      }
      return true
    })

  const handleFilesSelect = useCallback(async (fileList: FileList | File[]) => {
    const validFiles = validateFiles(Array.from(fileList))
    if (validFiles.length === 0) return

    setUploading(true)
    setErrors([])
    let successCount = 0
    let nextSortOrder = images.reduce((max, img) => Math.max(max, img.sortOrder ?? 0), -1) + 1

    // Imagen legada (img_path sin fila): se incorpora a la galeria antes de
    // agregar las nuevas, para no perderla.
    if (showLegacy && legacyImgPath) {
      try {
        await productImageService.create({ productId, filePath: legacyImgPath, sortOrder: 0, isPrimary: true })
        nextSortOrder = 1
        setLegacyCleared(true)
      } catch (err) {
        reportError(err, 'No se pudo incorporar la imagen actual a la galeria')
        setUploading(false)
        return
      }
    }

    const wantPrimaryFirst = !hasAnyImage || makeFirstPrimary
    for (const file of validFiles) {
      try {
        const uploadResult = await productService.uploadImage(file)
        await productImageService.create({
          filePath: uploadResult.path,
          productId,
          sortOrder: nextSortOrder,
          ...(wantPrimaryFirst && successCount === 0 ? { isPrimary: true } : {}),
        })
        nextSortOrder++
        successCount++
      } catch (err) {
        reportError(err, `Error al subir "${file.name}"`)
      }
    }

    setUploading(false)
    setMakeFirstPrimary(false)
    if (successCount > 0) {
      toast.success(`${successCount} ${successCount > 1 ? 'imágenes subidas' : 'imagen subida'} correctamente`)
    }
    mutate()
  }, [productId, images, showLegacy, legacyImgPath, hasAnyImage, makeFirstPrimary, mutate, reportError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openReplace = (target: ProductImage | 'legacy') => {
    replaceTargetRef.current = target
    replaceInputRef.current?.click()
  }

  const handleReplaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const target = replaceTargetRef.current
    if (replaceInputRef.current) replaceInputRef.current.value = ''
    replaceTargetRef.current = null
    if (!file || !target) return
    if (validateFiles([file]).length === 0) return

    const id = target === 'legacy' ? 'legacy' : target.id
    setBusyId(id)
    setErrors([])
    try {
      const uploadResult = await productService.uploadImage(file)
      if (target === 'legacy') {
        // Primera fila de la galeria: queda principal y el backend reemplaza
        // img_path (el archivo anterior se borra si nadie mas lo usa).
        await productImageService.create({ productId, filePath: uploadResult.path, sortOrder: 0, isPrimary: true })
        setLegacyCleared(true)
      } else {
        await productImageService.update(target.id, { filePath: uploadResult.path })
      }
      toast.success('Imagen reemplazada')
    } catch (err) {
      reportError(err, 'Error al reemplazar la imagen')
    }
    setBusyId(null)
    mutate()
  }

  const handleSetPrimary = async (image: ProductImage) => {
    if (image.isPrimary) return
    setBusyId(image.id)
    try {
      await productImageService.setPrimary(image.id)
      toast.success('Imagen principal actualizada')
    } catch (err) {
      reportError(err, 'Error al establecer la imagen principal')
    }
    setBusyId(null)
    mutate()
  }

  const handleDelete = async (image: ProductImage) => {
    const confirmed = await confirmModalRef.current?.confirm(
      image.isPrimary && images.length > 1
        ? '¿Quitar la imagen principal? La siguiente de la galeria pasara a ser la principal.'
        : '¿Quitar esta imagen?',
      { title: 'Confirmar', confirmVariant: 'danger' }
    )
    if (!confirmed) return
    setBusyId(image.id)
    try {
      await productImageService.delete(image.id)
      toast.success('Imagen quitada')
    } catch (err) {
      reportError(err, 'Error al quitar la imagen')
    }
    setBusyId(null)
    mutate()
  }

  const handleRemoveLegacy = async () => {
    const confirmed = await confirmModalRef.current?.confirm('¿Quitar la imagen actual del producto?', {
      title: 'Confirmar',
      confirmVariant: 'danger'
    })
    if (!confirmed) return
    setBusyId('legacy')
    try {
      await productService.updateProduct(productId, { imgPath: null })
      setLegacyCleared(true)
      toast.success('Imagen quitada')
    } catch (err) {
      reportError(err, 'Error al quitar la imagen')
    }
    setBusyId(null)
  }

  const handleAltBlur = async (image: ProductImage) => {
    const draft = altDrafts[image.id]
    if (draft === undefined || draft === (image.altText ?? '')) return
    setBusyId(image.id)
    try {
      await productImageService.update(image.id, { altText: draft.trim() === '' ? null : draft.trim() })
      setAltDrafts(prev => {
        const { [image.id]: _drop, ...rest } = prev
        return rest
      })
      mutate()
    } catch (err) {
      reportError(err, 'Error al guardar el texto alternativo')
    }
    setBusyId(null)
  }

  // Drag and drop: la principal queda fija al frente (no se arrastra ni recibe).
  const canDrag = (index: number) => !images[index]?.isPrimary

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index || !canDrag(index)) return
    setDragOverIndex(index)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex || !canDrag(dropIndex)) {
      setDraggedIndex(null)
      return
    }

    const reordered = [...images]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    setDraggedIndex(null)

    mutate(reordered.map((img, i) => ({ ...img, sortOrder: i })), false)
    try {
      await productImageService.reorder(reordered.map(img => img.id))
    } catch (err) {
      reportError(err, 'Error al reordenar las imágenes')
    }
    mutate()
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

  const cardStyle = (borderColor: string, opacity = 1): React.CSSProperties => ({
    width: 120,
    height: 120,
    border: `2px solid ${borderColor}`,
    borderRadius: 8,
    overflow: 'hidden',
    opacity,
    transition: 'border-color 0.15s, opacity 0.15s',
  })

  const spinner = <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />

  return (
    <div className="image-gallery-manager">
      <label className="form-label">Galeria de imagenes</label>

      {loadError && (
        <div className="alert alert-danger py-2 small" role="alert">
          No se pudo cargar la galeria: {extractApiErrorMessage(loadError, 'error desconocido')}
        </div>
      )}

      {errors.length > 0 && (
        <div className="alert alert-danger py-2 small" role="alert">
          <ul className="mb-0 ps-3">
            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        {showLegacy && (
          <div style={{ width: 120 }} data-testid="legacy-image">
            <div className="position-relative" style={cardStyle('#8AC905', busyId === 'legacy' ? 0.5 : 1)}>
              {legacyImgUrl && (
                <Image src={legacyImgUrl} alt="Imagen actual del producto" fill sizes="120px" style={{ objectFit: 'cover' }} unoptimized />
              )}
              <span className="position-absolute badge bg-success" style={{ top: 4, left: 4, fontSize: '0.65rem' }}>
                Imagen actual
              </span>
              <div className="position-absolute d-flex gap-1" style={{ bottom: 4, right: 4 }}>
                <button type="button" className="btn btn-sm btn-light" style={actionButtonStyle}
                  aria-label="Reemplazar imagen actual" title="Reemplazar"
                  disabled={busyId === 'legacy'} onClick={() => openReplace('legacy')}>
                  <i className="bi bi-arrow-repeat" />
                </button>
                <button type="button" className="btn btn-sm btn-danger" style={actionButtonStyle}
                  aria-label="Quitar imagen actual" title="Quitar"
                  disabled={busyId === 'legacy'} onClick={handleRemoveLegacy}>
                  {busyId === 'legacy' ? spinner : <i className="bi bi-x" />}
                </button>
              </div>
            </div>
            <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>Aun no esta en la galeria</small>
          </div>
        )}

        {images.map((image, index) => (
          <div key={image.id} style={{ width: 120 }} data-testid="gallery-image">
            <div
              draggable={canDrag(index)}
              onDragStart={() => canDrag(index) && setDraggedIndex(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null) }}
              className="position-relative"
              style={{
                ...cardStyle(
                  dragOverIndex === index ? 'var(--bs-primary)' : image.isPrimary ? '#8AC905' : 'var(--bs-border-color)',
                  draggedIndex === index || busyId === image.id ? 0.4 : 1
                ),
                cursor: canDrag(index) ? 'grab' : 'default',
              }}
            >
              <Image
                src={imageSrc(image)}
                alt={image.altText || 'Imagen del producto'}
                fill
                sizes="120px"
                style={{ objectFit: 'cover' }}
                unoptimized
              />

              {image.isPrimary && (
                <span className="position-absolute badge bg-success" style={{ top: 4, left: 4, fontSize: '0.65rem' }}>
                  Principal
                </span>
              )}

              <div className="position-absolute d-flex gap-1" style={{ bottom: 4, right: 4 }}>
                {!image.isPrimary && (
                  <button
                    aria-label="Establecer como principal"
                    type="button"
                    className="btn btn-sm btn-light"
                    style={actionButtonStyle}
                    title="Establecer como principal"
                    disabled={busyId === image.id}
                    onClick={(e) => { e.stopPropagation(); handleSetPrimary(image) }}
                  >
                    <i className="bi bi-star" />
                  </button>
                )}
                <button
                  aria-label="Reemplazar imagen"
                  type="button"
                  className="btn btn-sm btn-light"
                  style={actionButtonStyle}
                  title="Reemplazar"
                  disabled={busyId === image.id}
                  onClick={(e) => { e.stopPropagation(); openReplace(image) }}
                >
                  <i className="bi bi-arrow-repeat" />
                </button>
                <button
                  aria-label="Quitar imagen"
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={actionButtonStyle}
                  title="Quitar"
                  disabled={busyId === image.id}
                  onClick={(e) => { e.stopPropagation(); handleDelete(image) }}
                >
                  {busyId === image.id ? spinner : <i className="bi bi-x" />}
                </button>
              </div>
            </div>
            <input
              type="text"
              className="form-control form-control-sm mt-1"
              style={{ fontSize: '0.7rem' }}
              placeholder="Texto alternativo"
              aria-label={`Texto alternativo de la imagen ${index + 1}`}
              maxLength={255}
              value={altDrafts[image.id] ?? image.altText ?? ''}
              onChange={(e) => setAltDrafts(prev => ({ ...prev, [image.id]: e.target.value }))}
              onBlur={() => handleAltBlur(image)}
              disabled={busyId === image.id}
            />
          </div>
        ))}

        <div
          role="button"
          tabIndex={0}
          aria-label="Agregar imágenes"
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
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
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
        accept={ACCEPT}
        multiple
        onChange={handleInputChange}
        disabled={uploading}
        data-testid="gallery-file-input"
      />
      <input
        ref={replaceInputRef}
        type="file"
        className="d-none"
        accept={ACCEPT}
        onChange={handleReplaceChange}
        data-testid="gallery-replace-input"
      />

      {hasAnyImage && (
        <div className="form-check mt-2">
          <input
            id={`gallery-make-primary-${productId}`}
            type="checkbox"
            className="form-check-input"
            checked={makeFirstPrimary}
            onChange={(e) => setMakeFirstPrimary(e.target.checked)}
            disabled={uploading}
          />
          <label className="form-check-label small" htmlFor={`gallery-make-primary-${productId}`}>
            Hacer principal la primera imagen que suba
          </label>
        </div>
      )}

      <small className="text-muted d-block mt-1">
        Puede seleccionar varias imagenes a la vez. La principal se muestra primero en el catalogo y en la ficha.
        Arrastra para reordenar las demas. JPG, PNG, GIF o WebP. Max {MAX_SIZE_MB}MB por imagen.
      </small>
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default ImageGalleryManager
