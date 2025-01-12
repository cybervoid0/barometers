import { Container, SimpleGrid, Anchor, Title, Paper, Stack, Text } from '@mantine/core'
import Link from 'next/link'
import { Metadata } from 'next'
import { withPrisma } from '@/prisma/prismaClient'
import { brandsRoute } from '@/utils/routes-front'
import { title } from '../metadata'
import sx from './styles.module.scss'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const getManufacturerList = withPrisma(async prisma =>
  prisma.manufacturer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  }),
)

const Column = ({ items }: { items: Awaited<ReturnType<typeof getManufacturerList>> }) => (
  <Stack gap="md">
    {items.map(({ id, name, slug }) => (
      <Anchor key={id} href={brandsRoute + slug} component={Link} className={sx.brand}>
        {name}
      </Anchor>
    ))}
  </Stack>
)

export default async function Manufacturers() {
  const manufacturers = await getManufacturerList()

  const halfwayIndex = Math.floor(manufacturers.length / 2)
  const firstColumn = manufacturers.slice(0, halfwayIndex)
  const secondColumn = manufacturers.slice(halfwayIndex)
  return (
    <Container>
      <Title mt="xl" mb="sm" component="h2">
        Manufacturers
      </Title>
      <Text mb="1.6rem" style={{ textIndent: '2rem' }}>
        Discover the master craftsmen and renowned manufacturers behind these exceptional
        barometers, each reflecting timeless artistry and precision. Here is a curated list of
        barometer makers, along with detailed descriptions and iconic works by each master from the
        collection, representing the finest traditions of craftsmanship.
      </Text>
      <Paper shadow="lg" px="xl" py="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} className={sx.grid}>
          <Column items={firstColumn} />
          <Column items={secondColumn} />
        </SimpleGrid>
      </Paper>
    </Container>
  )
}
