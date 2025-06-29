'use client'

import { Box, Image } from '@mantine/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Zoom, Navigation, Pagination } from 'swiper/modules'
import NextImage from 'next/image'
import clsx from 'clsx'
import { ImagesEdit } from './edit-fields/images-edit'
import { type BarometerDTO } from '@/app/types'
import { IsAdmin } from '@/app/components/is-admin'
import 'swiper/css'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './swiper-styles.css'
import customImageLoader from '@/utils/image-loader'

interface ImageCarouselProps {
  barometer: BarometerDTO
}

export function ImageCarousel({ barometer }: ImageCarouselProps) {
  return (
    <Box style={{ overflow: 'hidden', position: 'relative' }}>
      <IsAdmin>
        <ImagesEdit barometer={barometer} />
      </IsAdmin>
      <Swiper
        zoom
        loop={barometer.images.length > 1}
        navigation
        modules={[Zoom, Navigation, Pagination]}
        pagination={{
          clickable: true,
          renderBullet(index, className) {
            return `<span class="${clsx(className)}">${index + 1}</span>`
          },
        }}
      >
        {barometer.images.map((image, i) => (
          <SwiperSlide key={image.id}>
            <Box className="swiper-zoom-container relative">
              <Image
                unoptimized
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
                fill
                src={customImageLoader({
                  src: image.url,
                  quality: 90,
                  width: 1500,
                })}
                alt={barometer.name}
                component={NextImage}
                placeholder="blur"
                blurDataURL={image.blurData}
                style={{
                  objectFit: 'contain',
                }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}
