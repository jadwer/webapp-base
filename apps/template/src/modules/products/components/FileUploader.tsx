'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { toast } from '@/lib/toast'

interface FileUploaderProps {
  accept: string
  maxSizeMB: number
  onFileSelect: (file: File) => void
  onClear: () => void
  previewUrl?: string | null
  currentFileName?: string
  isLoading?: boolean
  label: string
  helpText?: string
  errorText?: string
  isImage?: boolean
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSizeMB,
  onFileSelect,
  onClear,
  previewUrl,
  currentFileName,
  isLoading = false,
  label,
  helpText,
  errorText,
  isImage = false
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [localFileName, setLocalFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const handleFileSelect = useCallback((file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.warning(`El archivo excede el tamano maximo de ${maxSizeMB}MB`)
      return
    }

    // Store filename
    setLocalFileName(file.name)

    // Create local preview for images using URL.createObjectURL (more efficient)
    if (isImage && file.type.startsWith('image/')) {
      // Revoke previous preview URL if exists
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview)
      }
      const objectUrl = URL.createObjectURL(file)
      setLocalPreview(objectUrl)
    }

    onFileSelect(file)
  }, [maxSizeMB, isImage, onFileSelect, localPreview])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClear = () => {
    // Revoke object URL if exists
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview)
    }
    setLocalPreview(null)
    setLocalFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClear()
  }

  const displayPreview = localPreview || previewUrl
  const displayFileName = localFileName || currentFileName

  return (
    <div className="file-uploader">
      <label className="form-label">{label}</label>

      <div
        className={`border rounded p-3 text-center transition-colors ${
          dragOver ? 'border-primary bg-light' : 'border-secondary border-opacity-25'
        } ${errorText ? 'border-danger' : ''}`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '2px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
              <span className="visually-hidden">Subiendo...</span>
            </div>
            <p className="text-muted small mb-0">Subiendo archivo...</p>
          </div>
        ) : displayPreview && isImage ? (
          <div className="position-relative" style={{ maxWidth: '200px' }}>
            <Image
              src={displayPreview}
              alt="Preview"
              className="img-fluid rounded"
              width={200}
              height={150}
              style={{ maxHeight: '150px', objectFit: 'contain' }}
              unoptimized
            />
            <button
              type="button"
              className="btn btn-sm btn-danger position-absolute"
              style={{ top: '-8px', right: '-8px' }}
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <i className="bi bi-x"></i>
            </button>
            {displayFileName && (
              <p className="text-muted small mb-0 mt-2 text-truncate" style={{ maxWidth: '200px' }}>
                {displayFileName}
              </p>
            )}
          </div>
        ) : displayFileName ? (
          <div className="d-flex flex-column align-items-center">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <span className="text-truncate mb-2" style={{ maxWidth: '200px' }}>{displayFileName}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <i className="bi bi-x me-1"></i>
              Quitar
            </button>
          </div>
        ) : (
          <>
            <i
              className={`bi ${isImage ? 'bi-image' : 'bi-file-earmark-pdf'} text-muted mb-2`}
              style={{ fontSize: '2.5rem' }}
            ></i>
            <p className="text-muted small mb-2">
              Arrastra y suelta aquí o haz clic para seleccionar
            </p>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              <i className="bi bi-upload me-1"></i>
              Seleccionar archivo
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept={accept}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      {helpText && !errorText && (
        <small className="text-muted d-block mt-1">{helpText}</small>
      )}
      {errorText && (
        <small className="text-danger d-block mt-1">{errorText}</small>
      )}
    </div>
  )
}

export default FileUploader
