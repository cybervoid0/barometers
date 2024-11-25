import { Container, Stack, Text, Title } from '@mantine/core'
import { IBarometer } from '@/models/barometer'
import { barometersApiRoute, googleStorageImagesFolder, barometerRoute } from '../constants'
import { SearchItem } from './search-item'
import { SearchField } from '../components/search-field'

interface SearchParams extends Record<string, string> {
  q: string
}
interface SearchProps {
  searchParams: SearchParams
}

export default async function Search({ searchParams }: SearchProps) {
  if (!searchParams.q) throw new Error('Search string was not provided')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(`${baseUrl + barometersApiRoute}?${new URLSearchParams(searchParams)}`)
  if (!res.ok) throw new Error(res.statusText)
  const barometers: IBarometer[] = await res.json()
  if (!barometers || !Array.isArray(barometers)) throw new Error('Bad barometers data')

  return (
    <Container size="xs" my="xl">
      <SearchField queryString={searchParams.q} />

      <Title fz={{ base: 'h3', xs: 'h2' }} mb="lg" fw={500} component="h2" order={2}>
        Search results
      </Title>
      {barometers.length > 0 ? (
        <Stack gap="md" p={0}>
          {barometers.map(({ _id, name, manufacturer, images, slug, dating }) => (
            <SearchItem
              image={images ? googleStorageImagesFolder + images.at(0) : undefined}
              name={name}
              manufacturer={manufacturer?.name}
              link={barometerRoute + slug}
              key={_id}
              dating={dating}
            />
          ))}
        </Stack>
      ) : (
        <Text size="lg">No barometer matches your request: {searchParams.q}</Text>
      )}
    </Container>
  )
}
