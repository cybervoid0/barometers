'use server'

import React from 'react'
import { Container, Title } from '@mantine/core'
import { IBarometer } from '@/models/barometer'
import { barometersApiRoute, googleStorageImagesFolder } from '@/app/constants'
import { ShowError } from '@/app/components/show-error'
import { ImageCarousel } from './carousel'

interface BarometerItemProps {
  params: {
    slug: string
  }
}

export default async function BarometerItem({ params: { slug } }: BarometerItemProps) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute}/${slug}`, {
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    return <ShowError message={res.statusText} />
  }

  const { name, images }: IBarometer = await res.json()

  return (
    <Container pt="lg" size="xl">
      <ImageCarousel images={images?.map(image => googleStorageImagesFolder + image) ?? []} />
      <Title my="md" tt="capitalize">
        {name}
      </Title>
    </Container>
  )
}

export async function generateStaticParams() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute)
  const barometers: IBarometer[] = await res.json()

  return barometers.map(({ slug }) => ({
    slug,
  }))
}
