import Link from 'next/link'
import { Image } from '@/components/elements'
import { foundation, Route } from '@/constants'
import './animations.css'

export const Hero = () => {
  return (
    <div className="xs:h-40 relative h-[50vh] w-full overflow-hidden">
      <Image
        width={1920}
        height={606}
        priority
        fetchPriority="high"
        alt={foundation.tradeName}
        src="/shared/landing-header.png"
        className="z-1 w-full h-full animate-[heading-fade-in_1s_ease-in-out,heading-scale-down_2s_ease-out] object-cover object-[right_55%_bottom_50%]"
      />
      <div className="xs:items-center xs:pb-0 absolute top-0 left-0 z-2 flex h-full w-full animate-[heading-slide-up_1.8s_ease-out,heading-fade-in-content_1.8s_ease-out] items-end pb-12 pl-8 sm:pl-12">
        <div>
          <Link href={Route.Foundation} className="no-underline">
            <h2 className="bg-primary text-background inline px-1 text-[1.375rem] leading-relaxed font-medium tracking-wider uppercase">
              Art of weather instruments foundation
            </h2>
          </Link>
        </div>
      </div>
    </div>
  )
}
