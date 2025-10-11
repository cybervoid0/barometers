'use client'

import { Navigation, Pagination, Zoom } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Image, IsAdmin } from '@/components/elements'
import type { BarometerDTO } from '@/server/barometers/queries'
import { ImagesEdit } from './edit-fields/images-edit'
import 'swiper/css'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './swiper-styles.css'

interface ImageCarouselProps {
  barometer: NonNullable<BarometerDTO>
}

export function ImageCarousel({ barometer }: ImageCarouselProps) {
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
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
            return `<span class="${className}">${index + 1}</span>`
          },
        }}
      >
        {barometer.images.map((image, i) => (
          <SwiperSlide key={image.id}>
            <div className="swiper-zoom-container">
              <Image
                width={1500}
                height={1500}
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
                src={image.url}
                alt={barometer.name}
                placeholder="blur"
                blurDataURL={image.blurData ?? undefined}
                style={{
                  objectFit: 'contain',
                }}
                className="w-full h-full"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
