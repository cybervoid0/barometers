import { type Metadata } from 'next'
import { Anchor, Container, Grid, GridCol, Title } from '@mantine/core'
import Link from 'next/link'
import { Fragment } from 'react'
import { getManufacturer } from '@/app/api/v2/manufacturers/[slug]/getters'
import { withPrisma } from '@/prisma/prismaClient'
import { title } from '@/app/metadata'
import { BarometerCardWithIcon } from '@/app/components/barometer-card'
import { FrontRoutes } from '@/utils/routes-front'
import { MD } from '@/app/components/md'
import sx from '../styles.module.scss'

interface Props {
  params: {
    slug: string
  }
}

export const dynamic = 'force-static'

const getBarometersByManufacturer = withPrisma(async (prisma, slug: string) =>
  prisma.barometer.findMany({
    where: { manufacturer: { slug } },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      images: {
        where: {
          order: 0,
        },
      },
    },
    orderBy: { name: 'asc' },
  }),
)

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const manufacturer = await getManufacturer(slug)
  return {
    title: `${title} - Manufacturer: ${manufacturer.name}`,
  }
}

export const generateStaticParams = withPrisma(async prisma =>
  prisma.manufacturer.findMany({
    select: { slug: true },
  }),
)

export default async function Manufacturer({ params: { slug } }: Props) {
  const manufacturer = await getManufacturer(slug)
  const barometers = await getBarometersByManufacturer(slug)
  return (
    <Container size="xl">
      <Title tt="capitalize" mt="xl" mb="sm" component="h2">
        {manufacturer.firstName ?? ''} {manufacturer.name}
      </Title>

      <Connections label="Successor" brands={manufacturer.successors} />
      <Connections label="Predecessor" brands={manufacturer.predecessors} />

      <MD className={sx.description}>{manufacturer.description}</MD>

      <Grid justify="center" gutter="xl">
        {barometers.map(({ name, id, images, slug: barometerSlug, category }) => (
          <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={id}>
            <BarometerCardWithIcon
              barometerName={name}
              barometerLink={FrontRoutes.Barometer + barometerSlug}
              categoryLink={FrontRoutes.Categories + category.name}
              categoryName={category.name}
              image={images.at(0)!}
            />
          </GridCol>
        ))}
      </Grid>
    </Container>
  )
}

/**
 * The Connections component displays a list of related manufacturers (e.g., successors or predecessors) with a label.
 * If the list is empty, the component renders nothing.
 */
const Connections = ({
  brands,
  label,
}: {
  label: string
  brands: Awaited<ReturnType<typeof getManufacturer>>['successors']
}) =>
  brands.length > 0 && (
    <>
      <Title fz="1.2rem" fw={500} display="inline" order={3}>
        {`${label}${brands.length > 1 ? 's' : ''}: `}
      </Title>
      {brands.map(({ id, name, firstName, slug }, i, arr) => (
        <Fragment key={id}>
          <Anchor underline="always" href={FrontRoutes.Brands + slug} component={Link}>
            {firstName} {name}
          </Anchor>
          {i < arr.length - 1 && `, `}
        </Fragment>
      ))}
    </>
  )
