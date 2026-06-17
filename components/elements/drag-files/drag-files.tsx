'use client'

import { Upload } from 'lucide-react'
import { useCallback, useRef } from 'react'

interface Props {
  onFileSelect: (files: FileList | null) => void
  disabled?: boolean
  maxFiles?: number
  currentCount?: number
  acceptedTypes?: string[]
  children?: React.ReactNode
  message?: string
  icon?: typeof Upload
}

/**
 * Drag & drop area for uploading image files
 */
export function DragFiles({
  onFileSelect,
  disabled = false,
  maxFiles = 10,
  currentCount = 0,
  message = 'Drop files here or click to select',
  icon: Icon = Upload,
  acceptedTypes,
  children,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) onFileSelect(e.dataTransfer.files)
    },
    [onFileSelect, disabled],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect(e.target.files)
      // reset so picking the same file again still fires `change`
      e.target.value = ''
    },
    [onFileSelect],
  )

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptedTypes?.join(',') ?? ''}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />
      <button
        type="button"
        disabled={disabled}
        className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        aria-label="Upload files"
      >
        <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

        <div className="space-y-2">
          <p className="text-sm font-medium">{disabled ? 'Processing...' : message}</p>
          <p className="text-xs text-muted-foreground">{maxFiles && ` (max ${maxFiles} files)`}</p>
          {typeof currentCount === 'number' && maxFiles && (
            <p className="text-xs text-muted-foreground">
              {currentCount}/{maxFiles} files selected
            </p>
          )}
        </div>

        {children}
      </button>
    </>
  )
}
