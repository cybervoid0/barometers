'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { IsAdmin } from '@/components/elements'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { FrontRoutes } from '@/constants'
import { deleteBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { cn } from '@/utils'

interface Props {
  barometer: NonNullable<BarometerDTO>
  className?: string
}

const warnStyles = 'leading-tight tracking-tighter indent-4 font-medium text-destructive'

export function DeleteBarometer({ barometer, className }: Props) {
  const [open, setOpen] = useState(false)
  const [isDeleting, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteBarometer(barometer.slug)
        toast.success('Barometer deleted successfully')
        setOpen(false)
        router.replace(FrontRoutes.Categories + barometer.category.name)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error deleting barometer')
      }
    })
  }

  return (
    <IsAdmin>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn('text-destructive hover:text-destructive', className)}
          >
            <Trash2 />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium capitalize">
              Delete {barometer.name}
            </DialogTitle>
            <DialogDescription>
              This action will permanently remove the barometer from the database.
            </DialogDescription>
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
