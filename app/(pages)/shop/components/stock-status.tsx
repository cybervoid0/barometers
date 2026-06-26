import { cn } from '@/utils'

interface Props {
  /** Whether the product/variant has any stock available. */
  inStock: boolean
  className?: string
}

/**
 * Availability badge shown to shoppers: green "In stock" or red "Out of stock".
 * Deliberately hides exact stock counts — buyers only need to know it's available.
 */
export function StockStatus({ inStock, className }: Props) {
  return (
    <span
      className={cn(
        'text-sm font-medium',
        inStock ? 'text-green-600 dark:text-green-500' : 'text-red-800 dark:text-red-700',
        className,
      )}
    >
      {inStock ? 'In stock' : 'Out of stock'}
    </span>
  )
}
