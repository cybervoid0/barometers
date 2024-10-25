'use server'

import React from 'react'
import { Container, Grid, GridCol, Group, Title } from '@mantine/core'
import { IBarometerType } from '@/models/type'
import { IBarometer } from '@/models/barometer'
import {
  barometerRoute,
  barometerTypesApiRoute,
  barometersApiRoute,
  googleStorageImagesFolder,
} from '@/app/constants'
import { BarometerCard } from './components/barometer-card'
import { ShowError } from '@/app/components/show-error'
import { slug } from '@/utils/misc'
import { SortOptions } from './types'
import Sort from './sort'

interface CollectionProps {
  params: {
    type: string
  }
  searchParams: {
    sort?: SortOptions
  }
}
export default async function Collection({ params: { type }, searchParams }: CollectionProps) {
  const sortBy = searchParams.sort ?? SortOptions.name
  const qs = new URLSearchParams({ type, sort: sortBy })
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute}?${qs}`, {
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    return <ShowError message={res.statusText} />
  }

  const barometersOfType: IBarometer[] = await res.json()

  return (
    <Container pb="xl" size="xl">
      <Group h="5rem" align="center" justify="space-between">
        <Title fw={500} order={2} tt="capitalize">
          {type}
        </Title>
        <Sort sortBy={sortBy} />
      </Group>
      <Grid justify="center" gutter="xl">
        {barometersOfType
          ?.filter(({ images }) => Boolean(images?.[0]))
          .map(({ name, _id, images, manufacturer }) => (
            <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={String(_id)}>
              <BarometerCard
                image={googleStorageImagesFolder + images![0]}
                name={name}
                link={barometerRoute + slug(name)}
                manufacturer={manufacturer?.name}
              />
            </GridCol>
          ))}
      </Grid>
    </Container>
  )
}

export async function generateStaticParams() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + barometerTypesApiRoute)
  const barometerTypes: IBarometerType[] = await res.json()

  return barometerTypes.map((type: { name: string }) => ({
    type: type.name.toLowerCase(),
  }))
}
