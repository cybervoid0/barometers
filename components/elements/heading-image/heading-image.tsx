import NextImage from 'next/image'
import './animations.css'
import Link from 'next/link'
import { FrontRoutes } from '@/constants'
import { customImageLoader } from '@/utils'

export const HeadingImage = () => {
  return (
    <div className="xs:h-40 relative h-[50vh] w-full overflow-hidden">
      <NextImage
        unoptimized
        priority
        alt="Barograph"
        src={customImageLoader({ src: '/shared/landing-header.png', width: 1000, quality: 80 })}
        fill
        className="z-1 animate-[heading-fade-in_1s_ease-in-out,heading-scale-down_2s_ease-out] object-cover object-[right_55%_bottom_50%]"
      />
      <div className="xs:items-center xs:pb-0 absolute top-0 left-0 z-2 flex h-full w-full animate-[heading-slide-up_1.8s_ease-out,heading-fade-in-content_1.8s_ease-out] items-end pb-12 pl-8 sm:pl-12">
        <div>
          <Link href={FrontRoutes.Foundation} className="no-underline">
            <h2 className="bg-primary text-background inline px-1 text-[1.375rem] leading-relaxed font-medium tracking-wider uppercase">
              Art of weather instruments foundation
            </h2>
          </Link>
        </div>
      </div>
    </div>
  )
}
