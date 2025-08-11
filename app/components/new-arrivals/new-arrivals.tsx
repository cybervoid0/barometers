import { type HTMLAttributes } from 'react'
import Link from 'next/link'
import { FrontRoutes } from '@/utils/routes-front'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NewArrivals({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button asChild size="sm" className={cn('tracking-wider uppercase', className)} {...props}>
      <Link href={FrontRoutes.NewArrivals}>
        <p className="xs:text-sm text-[3vw] sm:text-base">New Arrivals</p>
      </Link>
    </Button>
  )
}
