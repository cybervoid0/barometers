import { Container, SimpleGrid, Anchor, Title, Paper, Stack, Text, Group, Box } from '@mantine/core'
import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'
import { IconCircleArrowUp } from '@tabler/icons-react'
import { withPrisma } from '@/prisma/prismaClient'
import { FrontRoutes } from '@/utils/routes-front'
import { title } from '../metadata'
import { googleStorageImagesFolder } from '@/utils/constants'
import { DynamicOptions } from '../types'

export const dynamic: DynamicOptions = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const getBrandsByCountry = withPrisma(async prisma => {
  const brandsByCountry = await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      manufacturers: {
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          firstName: true,
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
      },
    },
  })
  return brandsByCountry.map(country => ({
    ...country,
    manufacturers: country.manufacturers.map(({ barometers, ...brand }) => ({
      ...brand,
      image: barometers.at(0)?.images.at(0),
    })),
  }))
})

const BrandsOfCountry = ({
  country,
}: {
  country: Awaited<ReturnType<typeof getBrandsByCountry>>[number]
}) => (
  <Box mb="lg" mr="md">
    <Title order={3} className="!mb-5 border-b border-solid border-neutral-400 px-5 py-[0.1rem]">
      {country.name}
    </Title>

    <Stack gap="md">
      {country.manufacturers.map(({ id, firstName, name, slug, image }) => (
        <Anchor w="fit-content" key={id} href={FrontRoutes.Brands + slug} component={Link}>
          <Group gap="xs" wrap="nowrap">
            {image ? (
              <Image
                height={32}
                width={32}
                alt={name}
                src={googleStorageImagesFolder + image.url}
                blurDataURL={image.blurData}
                className="h-8 w-8 object-contain"
                sizes="32px"
              />
            ) : (
              <IconCircleArrowUp size={32} />
            )}
            <Text fw={500} className="w-fit capitalize">
              {name + (firstName ? `, ${firstName}` : '')}
            </Text>
          </Group>
        </Anchor>
      ))}
    </Stack>
  </Box>
)

export default async function Manufacturers() {
  const countries = await getBrandsByCountry()
  const firstColStates = ['France', 'Great Britain']
  const firstColumn = countries.filter(({ name }) => firstColStates.includes(name))
  const secondColumn = countries.filter(({ name }) => !firstColStates.includes(name))
  return (
    <Container>
      <Title mt="xl" mb="sm" component="h2">
        Manufacturers
      </Title>
      <Text mb="1.6rem" style={{ textIndent: '2rem' }}>
        Discover the master craftsmen, renowned manufacturers and distinguished sellers behind these
        exceptional barometers, each reflecting timeless artistry and precision. Here is a curated
        list of barometer makers, along with detailed descriptions and iconic works by each master
        from the collection, representing the finest traditions of craftsmanship.
      </Text>
      <Paper shadow="lg" px={{ base: 'md', xs: 'xl' }} py={{ base: 'md', xs: 'xl' }}>
        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          className="sm:[&>div:nth-child(even)]:border-r-0 sm:[&>div]:border-r sm:[&>div]:border-neutral-400"
        >
          <Box>
            {firstColumn.map(country => (
              <BrandsOfCountry key={country.id} country={country} />
            ))}
          </Box>
          <Box>
            {secondColumn.map(country => (
              <BrandsOfCountry key={country.id} country={country} />
            ))}
          </Box>
        </SimpleGrid>
      </Paper>
    </Container>
  )
}
