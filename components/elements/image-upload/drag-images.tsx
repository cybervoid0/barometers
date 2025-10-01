'use client'

import { Upload } from 'lucide-react'
import { useCallback } from 'react'

interface DragImagesProps {
  onFileSelect: (files: FileList | null) => void
  disabled?: boolean
  maxImages?: number
  currentCount?: number
  acceptedTypes?: string[]
  children?: React.ReactNode
}

/**
 * Drag & drop area for uploading image files
 */
export function DragImages({
  onFileSelect,
  disabled = false,
  maxImages = 10,
  currentCount = 0,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  children,
}: DragImagesProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        const files = e.dataTransfer.files
        onFileSelect(files)
      }
    },
    [onFileSelect, disabled],
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      // Create a temporary file input
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = acceptedTypes.join(',')
      input.onchange = e => {
        const target = e.target as HTMLInputElement
        onFileSelect(target.files)
      }
      input.click()
    }
  }, [onFileSelect, disabled, acceptedTypes])

  return (
    <button
      type="button"
      disabled={disabled}
      className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      aria-label="Upload images"
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

      <div className="space-y-2">
        <p className="text-sm font-medium">
          {disabled ? 'Processing...' : 'Drop images here or click to select'}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WEBP {maxImages && ` (max ${maxImages} images)`}
        </p>
        {typeof currentCount === 'number' && maxImages && (
          <p className="text-xs text-muted-foreground">
            {currentCount}/{maxImages} images selected
          </p>
        )}
      </div>

      {children}
    </button>
  )
}
