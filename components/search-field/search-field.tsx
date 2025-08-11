'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { Search, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  queryString?: string
}

const schema = yup.object({
  query: yup
    .string()
    .required('Search query is required')
    .min(1, 'Allowed length 1-100 symbols')
    .max(100, 'Allowed length 1-100 symbols')
    .test('trimmed-length', 'Allowed length 1-100 symbols', value => {
      const trimmed = value?.trim() || ''
      return trimmed.length >= 1 && trimmed.length <= 100
    }),
})

type SearchFormData = yup.InferType<typeof schema>

export function SearchField({ queryString, ...props }: SearchProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      query: '',
    },
  })

  const queryValue = watch('query')

  // Fill querystring from the page to the form
  useEffect(() => {
    if (queryString) {
      setValue('query', queryString)
    }
  }, [queryString, setValue])

  const onSubmit = async (data: SearchFormData) => {
    try {
      const qs = data.query.trim()
      const searchParams = new URLSearchParams({ q: qs })
      router.push(`/search?${searchParams}`, { scroll: true })
    } catch (error) {
      toast.error('Search failed')
    }
  }

  // Show toast on validation error
  useEffect(() => {
    if (errors.query?.message) {
      toast.error(errors.query.message)
    }
  }, [errors.query?.message])

  const handleClear = () => {
    setValue('query', '', { shouldValidate: false })
  }

  return (
    <div {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full">
          <div className="relative grow">
            <Input
              type="text"
              autoComplete="off"
              placeholder="Enter your query"
              title="Fill in any barometer related word"
              className={cn(
                'rounded-r-none border-r-0 pr-8',
                errors.query && 'border-destructive focus-visible:ring-destructive',
              )}
              {...register('query')}
            />
            {queryValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute top-0 right-0 h-full w-8 px-0 hover:bg-transparent"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-l-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? '...' : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
