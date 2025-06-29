import { Box, Title, Container } from '@mantine/core'
import NextImage from 'next/image'
import { FC } from 'react'
import customImageLoader from '@/utils/image-loader'

export const HeadingImage: FC = () => {
  return (
    <Container className="relative h-[50vh] !max-w-[80.5rem] overflow-hidden xs:h-40">
      <NextImage
        unoptimized
        priority
        alt="Barograph"
        src={customImageLoader({ src: '/shared/landing-header.png', width: 1000, quality: 80 })}
        fill
        className="z-10 animate-[fade-in_1s_ease-in-out,scale-down_2s_ease-out] bg-gradient-to-b from-[#e2e2e2] to-[#efefef] object-cover object-[right_55%_bottom_50%]"
      />
      <Box className="absolute inset-0 z-20 flex h-full w-full animate-[slide-up_1.8s_ease-out,fade-in-content_1.8s_ease-out] items-end pb-12 pl-8 xs:items-center xs:pb-0 sm:pl-12">
        <Box>
          <Title
            component="h2"
            order={3}
            className="inline bg-[var(--mantine-color-primary)] px-[0.3rem] pr-[0.13rem] !font-normal uppercase leading-normal tracking-[0.2rem] text-white"
          >
            Industrial Era Barometer Collection
          </Title>
        </Box>
      </Box>
    </Container>
  )
}
