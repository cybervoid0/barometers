import { Container, SimpleGrid, Anchor, Title, Paper, Stack, Text, Group } from '@mantine/core'
import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'
import { WiBarometer } from 'react-icons/wi'
import { withPrisma } from '@/prisma/prismaClient'
import { brandsRoute } from '@/utils/routes-front'
import { title } from '../metadata'
import sx from './styles.module.scss'
import { googleStorageImagesFolder } from '@/utils/constants'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const getManufacturerList = withPrisma(async prisma => {
  const brands = await prisma.manufacturer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      barometers: {
        select: {
          images: {
            where: {
              order: 0,
            },
            select: {
              url: true,
              blurData: true,
            },
            take: 1,
          },
        },
        take: 1,
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
  return brands.map(({ barometers, ...brand }) => ({
    ...brand,
    image: barometers.at(0)?.images.at(0),
  }))
})

const Column = ({ items }: { items: Awaited<ReturnType<typeof getManufacturerList>> }) => (
  <Stack gap="md">
    {items.map(({ id, name, slug, image }) => (
      <Anchor c="dark" key={id} href={brandsRoute + slug} component={Link}>
        <Group gap="xs" wrap="nowrap">
          {image ? (
            <Image
              height={32}
              width={32}
              alt={name}
              src={googleStorageImagesFolder + image.url}
              blurDataURL={image.blurData}
              style={{ objectFit: 'contain' }}
              sizes="32px"
            />
          ) : (
            <WiBarometer size={32} />
          )}
          <Text className={sx.brand}>{name}</Text>
        </Group>
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
      <Paper shadow="lg" px={{ base: 'md', xs: 'xl' }} py={{ base: 'md', xs: 'xl' }}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} className={sx.grid}>
          <Column items={firstColumn} />
          <Column items={secondColumn} />
        </SimpleGrid>
      </Paper>
    </Container>
  )
}
