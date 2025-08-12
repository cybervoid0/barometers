import Link from 'next/link'
import { FrontRoutes } from '@/constants/routes-front'
import { cn } from '@/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui'

interface BreadcrumbsComponentProps {
  type: string
  catId: string
  className?: string
}

const bcTextStyle = 'text-base font-medium capitalize'

export function BreadcrumbsComponent({ type, catId, className }: BreadcrumbsComponentProps) {
  const categorySlug = type.toLowerCase()

  return (
    <Breadcrumb className={cn('my-4 sm:my-8', className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link className={bcTextStyle} href="/">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link className={bcTextStyle} href={FrontRoutes.Categories + categorySlug}>
              {categorySlug}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <p className={bcTextStyle}>{catId}</p>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
