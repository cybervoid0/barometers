import { Box, Container, Stack, Title } from '@mantine/core'
import { googleStorageImagesFolder, barometerRoute } from '../constants'
import { SearchItem } from './search-item'
import { SearchField } from '../components/search-field'
import { Pagination } from '../components/pagination'
import { searchBarometers } from '@/utils/fetch'

interface SearchProps {
  searchParams: Record<string, string>
}

export default async function Search({ searchParams }: SearchProps) {
  const { barometers = [], page = 1, totalPages = 0 } = await searchBarometers(searchParams)

  return (
    <Container p={0} size="xs" px={{ base: 'xs' }} my="xl">
      <Stack>
        <Box style={{ flexGrow: 1 }}>
          <Title fz={{ base: 'h3', xs: 'h2' }} mb="lg" fw={500} component="h2" order={2}>
            Search results
          </Title>
          <SearchField />
          <Stack gap="md" p={0}>
            {barometers.map(({ id, name, manufacturer, image, slug, dateDescription }) => (
              <SearchItem
                image={image ? googleStorageImagesFolder + image.url : undefined}
                name={name}
                manufacturer={manufacturer?.name}
                link={barometerRoute + slug}
                key={id}
                dating={dateDescription}
              />
            ))}
          </Stack>
        </Box>
        {totalPages > 1 && <Pagination total={totalPages} value={page} />}
      </Stack>
    </Container>
  )
}
