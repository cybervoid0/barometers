import Link from 'next/link'
import { type HTMLAttributes } from 'react'
import { Button } from '@/components/ui'
import { FrontRoutes } from '@/constants/routes-front'
import { cn } from '@/utils'

export function NewArrivals({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button asChild size="sm" className={cn('tracking-wider uppercase', className)} {...props}>
      <Link href={FrontRoutes.NewArrivals}>
        <p className="xs:text-sm text-[3vw] sm:text-base">New Arrivals</p>
      </Link>
    </Button>
  )
}
