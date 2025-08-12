'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO } from '@/types'
import { updateBarometer } from '@/services/fetch'
import { FrontRoutes } from '@/constants/routes-front'
import { useBarometers } from '@/hooks/useBarometers'
import { cn } from '@/utils'
import * as UI from '@/components/ui'

interface ConditionEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

interface ConditionForm {
  conditionId: string
}

const validationSchema = yup.object({
  conditionId: yup.string().required('Condition is required'),
})

export function ConditionEdit({ size = 18, barometer, className, ...props }: ConditionEditProps) {
  const { condition } = useBarometers()

  const form = useForm<ConditionForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      conditionId: barometer.condition?.id ?? '',
    },
  })

  const update = async (values: ConditionForm) => {
    try {
      const { slug } = await updateBarometer({
        id: barometer.id,
        conditionId: values.conditionId,
      })
      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  return (
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({ conditionId: barometer.condition?.id ?? '' })
        }
      }}
    >
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
        <UI.Form {...form}>
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
                          {condition.data.map(({ name, id }) => (
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
              <UI.Button type="submit" variant="outline" className="w-full">
                Save
              </UI.Button>
            </div>
          </form>
        </UI.Form>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
