import { Edit } from 'lucide-react'
import {
  Button,
  type ButtonProps,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { cn } from '@/utils'

export function EditButton({ className, title = 'Edit field', ...props }: ButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            aria-label={title}
            className={cn('h-fit w-fit p-1', className)}
            {...props}
          >
            <Edit className="text-destructive" size={18} />
          </Button>
        </DialogTrigger>
      </TooltipTrigger>
      <TooltipContent>
        <span>{title}</span>
      </TooltipContent>
    </Tooltip>
  )
}
