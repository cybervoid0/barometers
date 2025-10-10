import Link from 'next/link'
import { CategoryIcon } from '@/components/elements'
import { cn } from '@/utils'
import { BarometerCard } from './barometer-card'

interface Props extends React.ComponentProps<'div'> {
  barometerName: string
  barometerLink: string
  categoryName: string
  categoryLink?: string
  manufacturer?: string
  image: {
    url: string
    order: number | null
    blurData: string | null
  }
}

export function BarometerCardWithIcon({
  barometerName,
  barometerLink,
  categoryName,
  categoryLink,
  manufacturer,
  image,
  className,
  ...props
}: Props) {
  return (
    <div className={cn('relative h-full', className)} {...props}>
      <Link href={categoryLink ?? barometerLink}>
        <CategoryIcon category={categoryName} className="absolute top-2 right-2 z-1" />
      </Link>
      <BarometerCard
        manufacturer={manufacturer}
        priority={false}
        image={image}
        name={barometerName}
        link={barometerLink}
      />
    </div>
  )
}
