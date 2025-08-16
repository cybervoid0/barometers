import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui'
import { SearchResultsDTO } from '@/types'
import { customImageLoader } from '@/utils'

interface ItemProps {
  image: SearchResultsDTO['barometers'][number]['image']
  name: string
  link: string
  manufacturer?: string
  dating?: string
}

export function SearchItem({ image, link, name, manufacturer, dating }: ItemProps) {
  const noManufacturer = !manufacturer || manufacturer.toLowerCase() === 'unsigned'
  return (
    <Card className="border-r-primary overflow-hidden rounded-sm border-r-[3px] p-2 shadow-md">
      <Link href={link} className="block w-fit no-underline">
        <div className="flex items-center gap-2">
          <div className="relative h-20 min-h-20 w-20 min-w-20 shrink-0">
            {image && (
              <Image
                unoptimized
                fill
                alt={name}
                src={customImageLoader({ src: image.url, width: 100, quality: 80 })}
                style={{ objectFit: 'contain' }}
                placeholder="blur"
                blurDataURL={image.blurData}
              />
            )}
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="leading-none font-medium capitalize">{name}</p>
            <p className="text-muted-foreground text-xs">
              {!noManufacturer && manufacturer} {!noManufacturer && dating && <>&mdash;</>}{' '}
              {dating && dating}
            </p>
          </div>
        </div>
      </Link>
    </Card>
  )
}
