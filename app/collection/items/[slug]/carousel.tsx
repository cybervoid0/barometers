'use client'

import React from 'react'
import { Box } from '@mantine/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import NextImage from 'next/image'

interface ImageCarouselProps {
  images: string[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  return (
    <Box w="100%" h="40rem">
      <Swiper
        style={{ position: 'relative', width: '100%', height: '100%' }}
        loop
        navigation
        spaceBetween={50}
        modules={[Navigation]}
      >
        {images.map(image => (
          <SwiperSlide key={image}>
            <NextImage fill objectFit="contain" src={image} alt="barometer" />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}
