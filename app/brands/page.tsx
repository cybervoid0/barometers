import { Container, SimpleGrid, Title, Paper, Text, Box } from '@mantine/core'
import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'
import { IconCircleArrowUp } from '@tabler/icons-react'
import { withPrisma } from '@/prisma/prismaClient'
import { FrontRoutes } from '@/utils/routes-front'
import { title } from '../metadata'
import { DynamicOptions } from '../types'

export const dynamic: DynamicOptions = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const getBrandsByCountry = withPrisma(async prisma => {
  return prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      manufacturers: {
        some: {},
      },
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
          icon: true,
        },
      },
    },
  })
})

const BrandsOfCountry = ({
  country,
}: {
  country: Awaited<ReturnType<typeof getBrandsByCountry>>[number]
}) => {
  const width = 32
  return (
    <div className="mb-5 mr-4">
      <Title order={3} className="!mb-5 border-b border-solid border-neutral-400 px-5 py-[0.1rem]">
        {country.name}
      </Title>

      <div className="flex flex-col gap-4">
        {country.manufacturers.map(({ id, firstName, name, slug, icon }) => {
          const base64 = icon ? Buffer.from(icon).toString('base64') : null
          const image = base64 ? `data:image/png;base64,${base64}` : null
          return (
            <Link className="w-fit" key={id} href={FrontRoutes.Brands + slug}>
              <div className="flex flex-nowrap items-center gap-3">
                {image ? (
                  <Image
                    unoptimized
                    width={width}
                    height={width}
                    alt={name}
                    loading="lazy"
                    src={image}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <IconCircleArrowUp size={32} />
                )}
                <p className="w-fit font-medium capitalize">
                  {name + (firstName ? `, ${firstName}` : '')}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

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
          className="sm:[&>div:nth-child(2n)]:border-r-0 sm:[&>div]:border-r sm:[&>div]:border-neutral-400"
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
