import { Container, Grid, GridCol, Stack, Title } from '@mantine/core'
import { barometerRoute, googleStorageImagesFolder } from '@/app/constants'
import { BarometerCard } from './components/barometer-card'
import { slug } from '@/utils/misc'
import { SortValue } from './types'
import Sort from './sort'
import { fetchBarometers, fetchTypes } from '@/utils/fetch'
import { DescriptionText } from '@/app/components/description-text'

interface CollectionProps {
  params: {
    type: string
  }
  searchParams: {
    sort?: SortValue
  }
}
export default async function Collection({ params: { type }, searchParams }: CollectionProps) {
  const sortBy = searchParams.sort ?? 'date'
  const barometersOfType = await fetchBarometers(new URLSearchParams({ type, sort: sortBy }))
  // selected barometer type details
  const { description } = await fetchTypes(new URLSearchParams({ type }))
  return (
    <Container py="xl" size="xl">
      <Stack gap="xs">
        <Title mb="sm" fw={500} order={2} tt="capitalize">
          {type}
        </Title>
        {description && <DescriptionText size="sm" description={description} />}
        <Sort sortBy={sortBy} style={{ alignSelf: 'flex-end' }} />
        <Grid justify="center" gutter="xl">
          {barometersOfType.map(({ name, _id, images, manufacturer }) => (
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
      </Stack>
    </Container>
  )
}

export async function generateStaticParams() {
  const barometerTypes = await fetchTypes()
  return barometerTypes.map(({ name }) => ({
    type: name.toLowerCase(),
  }))
}
