import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'
import { Image } from '@/components/elements'
import { Button } from '@/components/ui'

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
      className="relative w-[100px] h-[100px] cursor-grab active:cursor-grabbing"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
      <div className="aspect-square" {...listeners}>
        <Image
          width={100}
          height={100}
          alt={`Upload ${index + 1}`}
          src={fileName}
          className="w-full h-full object-cover rounded-lg absolute"
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
