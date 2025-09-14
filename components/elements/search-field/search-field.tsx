'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/form'
import { cn } from '@/utils'

interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  queryString?: string
}

const schema = z.object({
  query: z
    .string()
    .transform(arg => arg.trim())
    .pipe(z.string().min(1, 'Search query is required').max(100, 'Allowed length 1-100 symbols')),
})

type SearchFormData = z.infer<typeof schema>

export function SearchField({ queryString, ...props }: SearchProps) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<SearchFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      query: '',
    },
  })

  const queryValue = form.watch('query')

  // Fill querystring from the page to the form
  useEffect(() => {
    if (!queryString) return
    form.reset({ query: queryString })
  }, [queryString, form])

  // biome-ignore lint/correctness/useExhaustiveDependencies: exclude router.push
  const onSubmit = useCallback(
    (values: SearchFormData) => {
      if (!form.formState.isDirty) return
      startTransition(() => {
        try {
          const qs = values.query.trim()
          const searchParams = new URLSearchParams({ q: qs })
          router.push(`/search?${searchParams}`, { scroll: true })
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Search failed')
        }
      })
    },
    [form.formState.isDirty],
  )

  const handleClear = () => {
    form.setValue('query', '', { shouldValidate: false })
  }

  return (
    <div {...props}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="flex w-full">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="relative grow">
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Enter your query"
                      title="Fill in any barometer related word"
                      className={cn(
                        'rounded-r-none border-r-0 pr-8',
                        form.formState.errors.query &&
                          'border-destructive focus-visible:ring-destructive',
                      )}
                      {...field}
                    />
                  </FormControl>
                  {queryValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className="absolute top-0 right-0 w-8 hover:bg-transparent"
                      aria-label="Clear input"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-l-none"
              disabled={pending}
            >
              {pending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
