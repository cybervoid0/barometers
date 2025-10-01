import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { customImageLoader } from '@/utils'

/**
 * Draggable image item with delete button
 */
function SortableImage({
  fileName,
  index,
  handleDelete,
}: {
  fileName: string
  index: number
  handleDelete: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: fileName,
  })

  return (
    <div
      className="relative w-[100px] h-[100px]"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
      <div className="aspect-square relative" {...listeners}>
        <Image
          unoptimized
          alt={`Upload ${index + 1}`}
          src={customImageLoader({ src: fileName, width: 100, quality: 90 })}
          fill
          className="object-cover rounded-lg absolute"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full"
        onClick={() => handleDelete(index)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

export { SortableImage }
