import { Box, Container, Stack, Title } from '@mantine/core'
import { barometersSearchRoute, googleStorageImagesFolder, barometerRoute } from '../constants'
import { SearchItem } from './search-item'
import { SearchField } from '../components/search-field'
import { PaginationDTO } from '../api/types'
import { Pagination } from '../components/pagination'

interface SearchProps {
  searchParams: Record<string, string>
}

export default async function Search({ searchParams }: SearchProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const url = `${baseUrl + barometersSearchRoute}?${new URLSearchParams(searchParams)}`
  const res = await fetch(url, { cache: 'no-cache' })
  const { barometers = [], page = 1, totalPages = 0 }: PaginationDTO = await res.json()

  return (
    <Container p={0} size="xs" px={{ base: 'xs' }} my="xl">
      <Stack>
        <Box style={{ flexGrow: 1 }}>
          <Title fz={{ base: 'h3', xs: 'h2' }} mb="lg" fw={500} component="h2" order={2}>
            Search results
          </Title>
          <SearchField />
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
        </Box>
        {totalPages > 1 && <Pagination total={totalPages} value={page} />}
      </Stack>
    </Container>
  )
}
