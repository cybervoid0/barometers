import { Box } from '@mantine/core'
import NextImage from 'next/image'
import { FC } from 'react'
import './animations.css'
import customImageLoader from '@/utils/image-loader'

export const HeadingImage: FC = () => {
  return (
    <div className="relative mx-auto h-[50vh] w-full max-w-[1288px] overflow-hidden xs:h-40">
      <NextImage
        unoptimized
        priority
        alt="Barograph"
        src={customImageLoader({ src: '/shared/landing-header.png', width: 1000, quality: 80 })}
        fill
        className="z-[1] animate-[heading-fade-in_1s_ease-in-out,heading-scale-down_2s_ease-out] bg-gradient-to-b from-gray-200 to-gray-100 object-cover object-[right_55%_bottom_50%]"
      />
      <Box className="absolute left-0 top-0 z-[2] flex h-full w-full animate-[heading-slide-up_1.8s_ease-out,heading-fade-in-content_1.8s_ease-out] items-end pb-12 pl-8 xs:items-center xs:pb-0 sm:pl-12">
        <div>
          <h2 className="inline bg-primary px-1 text-[1.375rem] font-normal uppercase leading-relaxed tracking-wider text-white">
            Industrial Era Barometer Collection
          </h2>
        </div>
      </Box>
    </div>
  )
}
