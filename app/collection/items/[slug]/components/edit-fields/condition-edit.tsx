'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as zod from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
import type { ConditionsDTO } from '@/lib/conditions/queries'
import { cn } from '@/utils'

interface ConditionEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
  conditions: ConditionsDTO
}

const validationSchema = zod.object({
  conditionId: zod.string().min(1, 'Condition is required'),
})

type ConditionForm = zod.infer<typeof validationSchema>

export function ConditionEdit({
  size = 18,
  barometer,
  conditions,
  className,
  ...props
}: ConditionEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ConditionForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ conditionId: barometer.condition?.id ?? '' })
  }, [open, form.reset, barometer.condition?.id])

  const update = (values: ConditionForm) => {
    if (values.conditionId === barometer.conditionId) {
      toast.info(`Nothing was updated in ${barometer.name}.`)
      return setOpen(false)
    }
    startTransition(async () => {
      try {
        const { name } = await updateBarometer({
          id: barometer.id,
          conditionId: values.conditionId,
        })
        setOpen(false)
        toast.success(`Updated condition in ${name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer condition')
      }
    })
  }

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit condition"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-md">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Condition</UI.DialogTitle>
              <UI.DialogDescription>Update the condition for this barometer.</UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="conditionId"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Condition</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Select value={field.value} onValueChange={field.onChange}>
                        <UI.SelectTrigger className="w-full">
                          <UI.SelectValue placeholder="Select condition" />
                        </UI.SelectTrigger>
                        <UI.SelectContent>
                          {conditions.map(({ name, id }) => (
                            <UI.SelectItem key={id} value={id}>
                              {name}
                            </UI.SelectItem>
                          ))}
                        </UI.SelectContent>
                      </UI.Select>
                    </UI.FormControl>
                    <UI.FormMessage />
                  </UI.FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <UI.Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Save
              </UI.Button>
            </div>
          </form>
        </UI.FormProvider>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
