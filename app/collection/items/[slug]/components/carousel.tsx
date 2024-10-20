'use client'

import React from 'react'
import { Box, Image } from '@mantine/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Zoom, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import NextImage from 'next/image'
import './styles.css'

interface ImageCarouselProps {
  images: string[]
  name: string
}

export function ImageCarousel({ images, name }: ImageCarouselProps) {
  return (
    <Box style={{ overflow: 'hidden' }}>
      <Swiper
        zoom
        loop={images.length > 1}
        navigation
        modules={[Zoom, Navigation, Pagination]}
        pagination={{
          clickable: true,
          renderBullet(index, className) {
            return `<span class="${className}">${index + 1}</span>`
          },
        }}
      >
        {images.map(image => (
          <SwiperSlide key={image}>
            <Box className="swiper-zoom-container">
              <Image
                priority
                quality={60}
                width={200}
                height={200}
                src={image}
                alt={name}
                component={NextImage}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}
