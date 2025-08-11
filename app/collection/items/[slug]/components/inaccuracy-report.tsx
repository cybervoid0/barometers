'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createReport } from '@/utils/fetch'
import { BarometerDTO } from '@/app/types'
import * as UI from '@/components/ui'

interface Props extends React.ComponentProps<'button'> {
  barometer: BarometerDTO
}

interface ReportForm {
  reporterName: string
  reporterEmail: string
  description: string
}

const maxFeedbackLen = 1000

const validationSchema: yup.ObjectSchema<ReportForm> = yup.object({
  reporterName: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  reporterEmail: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  description: yup
    .string()
    .required('Description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(maxFeedbackLen, `Description must be less than ${maxFeedbackLen} characters`),
})

export function InaccuracyReport({ barometer, ...props }: Props) {
  const queryClient = useQueryClient()
  const [isOpened, setIsOpened] = React.useState<boolean>(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportForm>({
    resolver: yupResolver(validationSchema),
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
    mutate({ ...values, barometerId: barometer.id })
  })

  const descriptionValue = watch('description') ?? ''
  const symbolsLeft = maxFeedbackLen - descriptionValue.length

  return (
    <>
      <UI.Tooltip>
        <UI.TooltipTrigger asChild>
          <UI.Button
            {...props}
            type="button"
            variant="outline"
            onClick={() => setIsOpened(true)}
            aria-label={`Open report inaccuracy dialog for ${barometer.name}`}
          >
            <span className="text-sm font-normal tracking-wider uppercase">Report inaccuracy</span>
          </UI.Button>
        </UI.TooltipTrigger>
        <UI.TooltipContent>
          Report issues in the description of
          <span className="ml-1 capitalize">{barometer.name}</span>
        </UI.TooltipContent>
      </UI.Tooltip>
      <UI.Dialog open={isOpened} onOpenChange={setIsOpened}>
        <UI.DialogContent>
          <UI.DialogHeader>
            <UI.DialogTitle className="capitalize">
              Report Inaccuracy in {barometer.name}
            </UI.DialogTitle>
            <UI.DialogDescription>
              We will contact you using the provided email.
            </UI.DialogDescription>
          </UI.DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <UI.Label htmlFor="reporterName">Name</UI.Label>
              <UI.Input
                id="reporterName"
                aria-invalid={!!errors.reporterName}
                aria-describedby="reporterName-error"
                placeholder="Your name"
                {...register('reporterName')}
              />
              {errors.reporterName && (
                <p id="reporterName-error" className="text-xs text-red-500">
                  {errors.reporterName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <UI.Label htmlFor="reporterEmail">Email</UI.Label>
              <UI.Input
                id="reporterEmail"
                type="email"
                aria-invalid={!!errors.reporterEmail}
                aria-describedby="reporterEmail-error"
                placeholder="your@email.com"
                {...register('reporterEmail')}
              />
              {errors.reporterEmail && (
                <p id="reporterEmail-error" className="text-xs text-red-500">
                  {errors.reporterEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <UI.Label htmlFor="description">Feedback</UI.Label>
              <UI.Textarea
                id="description"
                aria-invalid={!!errors.description}
                aria-describedby="description-help"
                placeholder="Describe the inaccuracy"
                className="min-h-24"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
              <p id="description-help" className="text-muted-foreground text-xs">
                {descriptionValue.length > 0 && descriptionValue.length <= maxFeedbackLen
                  ? `${symbolsLeft} symbol${symbolsLeft === 1 ? '' : 's'} remaining`
                  : descriptionValue.length > maxFeedbackLen
                    ? `Feedback is ${-symbolsLeft} character${-symbolsLeft === 1 ? '' : 's'} longer than allowed`
                    : null}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <UI.Button type="button" variant="ghost" onClick={() => setIsOpened(false)}>
                Cancel
              </UI.Button>
              <UI.Button type="submit" disabled={isSubmitting || isPending}>
                Send
              </UI.Button>
            </div>
          </form>
        </UI.DialogContent>
      </UI.Dialog>
    </>
  )
}
