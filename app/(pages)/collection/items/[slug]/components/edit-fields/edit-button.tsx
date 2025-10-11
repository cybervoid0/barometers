import { Edit } from 'lucide-react'
import { Button, type ButtonProps, DialogTrigger } from '@/components/ui'
import { cn } from '@/utils'

export function EditButton({ className, ...props }: ButtonProps) {
  return (
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        aria-label="Edit condition"
        className={cn('h-fit w-fit p-1', className)}
        {...props}
      >
        <Edit className="text-destructive" size={18} />
      </Button>
    </DialogTrigger>
  )
}
