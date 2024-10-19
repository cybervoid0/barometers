'use client'

import React from 'react'
import { Image } from '@mantine/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Zoom, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/zoom'
import 'swiper/css/pagination'
import NextImage from 'next/image'
import './styles.css'

interface ImageCarouselProps {
  images: string[]
  name: string
}

export function ImageCarousel({ images, name }: ImageCarouselProps) {
  return (
    <Swiper
      loop={images.length > 1}
      zoom
      navigation
      modules={[Navigation, Zoom, Pagination]}
      pagination={{
        clickable: true,
        renderBullet(index, className) {
          return `<span class="${className}">${index + 1}</span>`
        },
      }}
    >
      {images.map((image, index) => (
        <SwiperSlide key={image}>
          <Image
            priority={index === 0}
            quality={50}
            width={200}
            height={200}
            src={image}
            alt={name}
            component={NextImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
