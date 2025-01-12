import { Box, BoxProps } from '@mantine/core'
import Link from 'next/link'
import { CategoryIcon } from '../category-icon'
import { BarometerCard } from './barometer-card'
import { BarometerListDTO } from '@/app/types'

interface Props extends BoxProps {
  barometerName: string
  barometerLink: string
  categoryName: string
  categoryLink?: string
  manufacturer?: string
  image: BarometerListDTO['barometers'][number]['images'][number]
}

export function BarometerCardWithIcon({
  barometerName,
  barometerLink,
  categoryName,
  categoryLink,
  manufacturer,
  image,
  ...props
}: Props) {
  return (
    <Box pos="relative" {...props}>
      <Link href={categoryLink ?? barometerLink}>
        <CategoryIcon
          category={categoryName}
          bgColor="white"
          style={{ position: 'absolute', zIndex: 1, right: 0, top: '3px' }}
        />
      </Link>
      <BarometerCard
        manufacturer={manufacturer}
        priority={false}
        image={image}
        name={barometerName}
        link={barometerLink}
      />
    </Box>
  )
}
