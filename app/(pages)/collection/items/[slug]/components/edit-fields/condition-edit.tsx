'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EditButton } from '@/components/elements/EditButton'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { ConditionsDTO } from '@/server/conditions/queries'

interface ConditionEditProps {
  barometer: NonNullable<BarometerDTO>
  conditions: ConditionsDTO
}

const ValidationSchema = z.object({
  conditionId: z.string().min(1, 'Condition is required'),
})

type ConditionForm = z.infer<typeof ValidationSchema>

export function ConditionEdit({ barometer, conditions }: ConditionEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ConditionForm>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      conditionId: barometer.conditionId,
    },
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset()
  }, [open, form])

  const update = useCallback(
    (values: ConditionForm) => {
      if (values.conditionId === barometer.conditionId) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        return setOpen(false)
      }
      startTransition(async () => {
        try {
          const result = await updateBarometer({
            id: barometer.id,
            conditionId: values.conditionId,
          })
          if (!result.success) throw new Error(result.error)
          setOpen(false)
          toast.success(`Updated condition in ${result.data.name}.`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error updating barometer condition')
        }
      })
    },
    [barometer],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton label="Edit condition" />
      <DialogContent className="sm:max-w-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Condition</DialogTitle>
              <DialogDescription>Update the condition for {barometer.name}.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="conditionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map(({ name, id }) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
