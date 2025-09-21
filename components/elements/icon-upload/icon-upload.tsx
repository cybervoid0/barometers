'use client'

import { Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface IconUploadProps {
  onFileChange: (file: File | null) => void
  currentIcon?: string | null
}

export const IconUpload = ({ onFileChange, currentIcon }: IconUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File | null) => {
    onFileChange(selectedFile)

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    handleFileSelect(file)
  }

  const handleRemoveIcon = () => {
    setPreviewUrl(null)
    onFileChange(null)
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Show current icon if no preview and currentIcon exists
  const displayIcon = previewUrl || currentIcon

  return (
    <div className="flex items-center gap-6">
      {displayIcon && (
        <div className="relative w-fit">
          {/* Delete button */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute top-0 right-0 h-4 w-4 rounded-full',
              'bg-foreground text-background hover:bg-muted-foreground hover:text-background',
            )}
            onClick={handleRemoveIcon}
            aria-label="Remove icon"
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
          {previewUrl ? (
            /** biome-ignore lint/performance/noImgElement: preview requires dynamic src from blob URL */
            <img
              src={previewUrl}
              alt="Icon preview"
              className="h-12 w-12 rounded border object-cover"
            />
          ) : currentIcon ? (
            /** biome-ignore lint/performance/noImgElement: current icon requires dynamic base64 src */
            <img
              src={currentIcon}
              alt="Current icon"
              className="h-12 w-12 rounded border object-cover"
            />
          ) : null}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {displayIcon ? 'Change Icon' : 'Select Icon'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
