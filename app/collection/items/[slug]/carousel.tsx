'use client'

import React from 'react'
import { Box } from '@mantine/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Zoom } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/zoom'
import NextImage from 'next/image'

interface ImageCarouselProps {
  images: string[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  return (
    <Box w="100%" h="40rem">
      <Swiper
        style={{ position: 'relative', width: '100%', height: '100%' }}
        loop={images.length > 1}
        zoom
        navigation
        spaceBetween={50}
        modules={[Navigation, Zoom]}
      >
        {images.map(image => (
          <SwiperSlide key={image}>
            <Box pos="relative" className="swiper-zoom-container">
              <NextImage fill src={image} alt="barometer" style={{ objectFit: 'contain' }} />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}
