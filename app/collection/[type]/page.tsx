'use server'

import React from 'react'
import { Container, Flex, Grid, GridCol, Title } from '@mantine/core'
import { IBarometerType } from '@/models/type'
import { IBarometer } from '@/models/barometer'
import { barometerTypesApiRoute, barometersApiRoute } from '../../constants'
import { BarometerCard } from './barometer-card'
import { ShowError } from '@/app/components/show-error'

interface CollectionProps {
  params: {
    type: string
  }
}
export default async function Collection({ params: { type } }: CollectionProps) {
  const res = await fetch(`${process.env.NEXTAUTH_URL + barometersApiRoute}?type=${type}`, {
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    return <ShowError message={res.statusText} />
  }

  const barometersOfType: IBarometer[] = await res.json() // Парсим JSON данные из ответа

  return (
    <Container size="xl">
      <Flex h="5rem" align="center">
        <Title fw={500} order={2} tt="capitalize">
          {type}
        </Title>
      </Flex>
      <Grid gutter="xl">
        {barometersOfType
          ?.filter(({ images }) => Boolean(images?.[0]))
          .map(({ name, _id, images }) => (
            <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={String(_id)}>
              <BarometerCard image={images![0]} name={name} />
            </GridCol>
          ))}
      </Grid>
    </Container>
  )
}

export async function generateStaticParams() {
  const res = await fetch(process.env.NEXTAUTH_URL + barometerTypesApiRoute)
  const barometerTypes: IBarometerType[] = await res.json()

  return barometerTypes.map((type: { name: string }) => ({
    type: type.name.toLowerCase(), // Генерируем параметры на основе типов
  }))
}
