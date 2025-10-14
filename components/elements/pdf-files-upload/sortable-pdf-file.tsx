import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MediaFile } from '@/types'

interface Props {
  file: MediaFile
  index: number
  onDelete: (index: number) => void
  fieldName: string
}

/**
 * Draggable PDF file item with edit functionality
 */
export function SortablePdfFile({ file, index, onDelete, fieldName }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(file.name)
  const { setValue, getValues } = useFormContext()

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: file.url,
  })

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== file.name) {
      const currentFiles = getValues(fieldName) as MediaFile[]
      const updatedFiles = [...currentFiles]
      updatedFiles[index] = { ...file, name: editedName.trim() }
      setValue(fieldName, updatedFiles, { shouldDirty: true })
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedName(file.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
      {...attributes}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <FileText className="h-8 w-8 text-secondary flex-shrink-0" />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
            autoFocus
            placeholder="Enter file name"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-left hover:text-primary transition-colors truncate block w-full"
            title="Click to edit name"
          >
            {file.name}
          </button>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Delete file"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
