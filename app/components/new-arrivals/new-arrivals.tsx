import { type HTMLAttributes } from 'react'
import Link from 'next/link'
import { FrontRoutes } from '@/utils/routes-front'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NewArrivals({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button asChild size="sm" className={cn('uppercase tracking-wider', className)} {...props}>
      <Link href={FrontRoutes.NewArrivals}>
        <p className="hidden text-base xs:block">New Arrivals</p>
        <p className="xs:hidden">New</p>
      </Link>
    </Button>
  )
}
