'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { type ButtonProps, type ButtonVariants, buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils'

const PaginationCore = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
PaginationCore.displayName = 'PaginationCore'

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  ),
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />,
)
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: (isActive ? 'outline' : 'ghost') as ButtonVariants['variant'],
        size,
      }),
      className,
    )}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  iconOnly = false,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { iconOnly?: boolean }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size={iconOnly ? 'icon' : 'default'}
    className={cn(!iconOnly && 'gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    {!iconOnly && <span>Previous</span>}
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  iconOnly = false,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { iconOnly?: boolean }) => (
  <PaginationLink
    aria-label="Go to next page"
    size={iconOnly ? 'icon' : 'default'}
    className={cn(!iconOnly && 'gap-1 pr-2.5', className)}
    {...props}
  >
    {!iconOnly && <span>Next</span>}
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i)

/**
 * Builds a windowed list of page numbers with `'ellipsis'` gaps:
 * always first + last, plus `siblings` pages on each side of the current page.
 */
const getPageRange = (
  total: number,
  current: number,
  siblings: number,
): (number | 'ellipsis')[] => {
  // first + last + current + 2 siblings + 2 ellipsis slots
  const totalSlots = siblings * 2 + 5
  if (total <= totalSlots) return range(1, total)

  const leftSibling = Math.max(current - siblings, 1)
  const rightSibling = Math.min(current + siblings, total)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1
  const edgeCount = 3 + siblings * 2

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeCount), 'ellipsis', total]
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis', ...range(total - edgeCount + 1, total)]
  }
  return [1, 'ellipsis', ...range(leftSibling, rightSibling), 'ellipsis', total]
}

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

interface PaginationProps {
  total: number
  value?: number
  onChange?: (page: number) => void
  className?: string
  pageAsRoute?: boolean
}

export function Pagination({
  total,
  value = 1,
  onChange,
  className,
  pageAsRoute = false,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    if (onChange) {
      onChange(newPage)
    } else {
      const updatedSearchParams = new URLSearchParams(searchParams)
      updatedSearchParams.set('page', String(newPage))
      const pagePath = pageAsRoute
        ? pathname.split('/').slice(0, -1).concat(`${newPage}`).join('/')
        : `${pathname}?${updatedSearchParams}`
      router.push(pagePath)
    }
  }

  if (total <= 1) return null

  const renderPages = (siblings: number) =>
    getPageRange(total, value, siblings).map((page, index) => (
      <PaginationItem key={page === 'ellipsis' ? `ellipsis-${index}` : `page-${page}`}>
        {page === 'ellipsis' ? (
          <PaginationEllipsis />
        ) : (
          <PaginationLink
            onClick={() => handlePageChange(page)}
            isActive={page === value}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        )}
      </PaginationItem>
    ))

  const prevButton = (iconOnly: boolean) => (
    <PaginationItem>
      <PaginationPrevious
        iconOnly={iconOnly}
        onClick={() => handlePageChange(Math.max(1, value - 1))}
        className={value <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
      />
    </PaginationItem>
  )

  const nextButton = (iconOnly: boolean) => (
    <PaginationItem>
      <PaginationNext
        iconOnly={iconOnly}
        onClick={() => handlePageChange(Math.min(total, value + 1))}
        className={value >= total ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
      />
    </PaginationItem>
  )

  return (
    <PaginationCore className={className}>
      {/* Mobile: icon-only arrows + tight window (1 sibling) to avoid overflow */}
      <PaginationContent className="md:hidden">
        {prevButton(true)}
        {renderPages(1)}
        {nextButton(true)}
      </PaginationContent>

      {/* Desktop: labelled arrows + wider window (2 siblings) */}
      <PaginationContent className="hidden md:flex">
        {prevButton(false)}
        {renderPages(2)}
        {nextButton(false)}
      </PaginationContent>
    </PaginationCore>
  )
}
