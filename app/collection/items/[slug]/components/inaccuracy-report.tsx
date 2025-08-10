'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isEmail, isLength } from 'validator'
import { toast } from 'sonner'
import { createReport } from '@/utils/fetch'
import { BarometerDTO } from '@/app/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Props extends React.ComponentProps<'button'> {
  barometer: BarometerDTO
}
const maxFeedbackLen = 1000

export function InaccuracyReport({ barometer, ...props }: Props) {
  const queryClient = useQueryClient()
  const [isOpened, setIsOpened] = React.useState<boolean>(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ reporterName: string; reporterEmail: string; description: string }>({
    defaultValues: { reporterName: '', reporterEmail: '', description: '' },
    mode: 'onBlur',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createReport,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['inaccuracyReport'] })
      setIsOpened(false)
      reset()
      toast.success(
        `Thank you! Your report was registered with ID ${id}. We will contact you at the provided email`,
      )
    },
    onError: err => toast.error(err.message),
  })
  const onSubmit = handleSubmit(values => {
    const { reporterEmail, reporterName, description } = values
    if (!isEmail(reporterEmail)) {
      toast.error('Invalid email')
      return
    }
    if (!isLength(reporterName, { min: 2, max: 50 })) {
      toast.error('Value must be between 2 and 50 characters')
      return
    }
    if (!isLength(description, { min: 5, max: maxFeedbackLen })) {
      toast.error(`Value must be between 5 and ${maxFeedbackLen} characters`)
      return
    }
    mutate({ ...values, barometerId: barometer.id })
  })

  const descriptionValue = watch('description') ?? ''
  const symbolsLeft = maxFeedbackLen - descriptionValue.length

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...props}
            type="button"
            variant="outline"
            onClick={() => setIsOpened(true)}
            aria-label={`Open report inaccuracy dialog for ${barometer.name}`}
          >
            <span className="text-sm font-normal uppercase tracking-wider">Report inaccuracy</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Report issues in the description of
          <span className="ml-1 capitalize">{barometer.name}</span>
        </TooltipContent>
      </Tooltip>
      <Dialog open={isOpened} onOpenChange={setIsOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Report Inaccuracy in {barometer.name}</DialogTitle>
            <DialogDescription>We will contact you using the provided email.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reporterName">Name</Label>
              <Input
                id="reporterName"
                aria-invalid={!!errors.reporterName}
                aria-describedby="reporterName-error"
                placeholder="Your name"
                {...register('reporterName', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporterEmail">Email</Label>
              <Input
                id="reporterEmail"
                type="email"
                aria-invalid={!!errors.reporterEmail}
                aria-describedby="reporterEmail-error"
                placeholder="your@email.com"
                {...register('reporterEmail', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Feedback</Label>
              <Textarea
                id="description"
                aria-invalid={!!errors.description}
                aria-describedby="description-help"
                placeholder="Describe the inaccuracy"
                className="min-h-24"
                {...register('description', { required: true })}
              />
              <p id="description-help" className="text-xs text-muted-foreground">
                {descriptionValue.length > 0 && descriptionValue.length <= maxFeedbackLen
                  ? `${symbolsLeft} symbol${symbolsLeft === 1 ? '' : 's'} remaining`
                  : descriptionValue.length > maxFeedbackLen
                    ? `Feedback is ${-symbolsLeft} character${-symbolsLeft === 1 ? '' : 's'} longer than allowed`
                    : null}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isPending}>
                Send
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
