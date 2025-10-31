import Link from 'next/link'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui'
import { Route } from '@/constants'
import { cn } from '@/utils'

function ContinueShopping({ className, ...props }: ComponentProps<'button'>) {
  return (
    <Link href={Route.Shop}>
      <Button className={cn('select-none', className)} variant="outline" {...props}>
        Continue Shopping
      </Button>
    </Link>
  )
}

export { ContinueShopping }
