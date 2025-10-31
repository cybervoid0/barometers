import Link from 'next/link'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui'
import { Route } from '@/constants'
import { cn } from '@/utils'

function ViewShoppingCart({ className, ...props }: ComponentProps<'button'>) {
  return (
    <Link href={Route.Cart}>
      <Button className={cn('select-none', className)} variant="default" {...props}>
        View shopping cart
      </Button>
    </Link>
  )
}

export { ViewShoppingCart }
