'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO } from '@/app/types'
import { updateBarometer } from '@/utils/fetch'
import { FrontRoutes } from '@/utils/routes-front'
import { useBarometers } from '@/app/hooks/useBarometers'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

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
    <Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({ conditionId: barometer.condition?.id ?? '' })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit condition"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Condition</DialogTitle>
              <DialogDescription>Update the condition for this barometer.</DialogDescription>
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
                          {condition.data.map(({ name, id }) => (
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
              <Button type="submit" variant="outline" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
