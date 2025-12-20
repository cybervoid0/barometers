import { Edit } from 'lucide-react'
import { Button, type ButtonProps, DialogTrigger } from '@/components/ui'
import { cn } from '@/utils'

interface Props extends ButtonProps {
  label?: string
}

export function EditButton({ label = 'Edit', className, ...props }: Props) {
  return (
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        aria-label={label}
        className={cn('h-fit w-fit p-1', className)}
        {...props}
      >
        <Edit className="text-destructive" size={18} />
      </Button>
    </DialogTrigger>
  )
}
