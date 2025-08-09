'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { BarometerDTO } from '@/app/types'
import { deleteBarometer } from '@/utils/fetch'
import { FrontRoutes } from '@/utils/routes-front'
import { IsAdmin } from '@/app/components/is-admin'

interface Props {
  barometer: BarometerDTO
  className?: string
}

const warnStyles = 'leading-tight tracking-tighter indent-4 font-medium text-destructive'

export function DeleteBarometer({ barometer, className }: Props) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { message } = await deleteBarometer(barometer.slug)
      toast.success(message)
      setOpen(false)
      router.replace(FrontRoutes.Categories + barometer.category.name)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting barometer')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <IsAdmin>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn('text-destructive hover:text-destructive', className)}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="capitalize">Delete {barometer.name}</p>
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium capitalize">
              Delete {barometer.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className={warnStyles}>
              Are you sure you want to completely remove {barometer.name} from the database?
            </p>
            <p className={cn('mt-4', warnStyles)}>This action cannot be undone.</p>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </IsAdmin>
  )
}
