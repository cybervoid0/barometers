import Link from 'next/link'
import { FrontRoutes } from '@/utils/routes-front'
import { Button } from '@/components/ui/button'

export function NewArrivals() {
  return (
    <Button asChild size="sm" className="uppercase tracking-wider">
      <Link href={FrontRoutes.NewArrivals}>
        <p className="hidden text-base xs:block">New Arrivals</p>
        <p className="xs:hidden">New</p>
      </Link>
    </Button>
  )
}
