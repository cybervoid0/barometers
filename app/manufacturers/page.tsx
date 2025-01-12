import { Container, SimpleGrid, Anchor, Title, Paper, Stack } from '@mantine/core'
import Link from 'next/link'
import { Metadata } from 'next'
import { withPrisma } from '@/prisma/prismaClient'
import { manufacturersRoute } from '../constants'
import { title } from '../metadata'
import sx from './styles.module.scss'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const getManufacturerList = withPrisma(async prisma =>
  prisma.manufacturer.findMany({
    where: {
      NOT: {
        name: 'unsigned',
      },
    },
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
  <Stack gap="xs">
    {items.map(({ id, name, slug }) => (
      <Anchor
        w="fit-content"
        key={id}
        c="dark"
        tt="capitalize"
        href={manufacturersRoute + slug}
        component={Link}
      >
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
      <Title my="xl" component="h2">
        Manufacturers
      </Title>
      <Paper shadow="lg" px="xl" py="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} className={sx.grid}>
          <Column items={firstColumn} />
          <Column items={secondColumn} />
        </SimpleGrid>
      </Paper>
    </Container>
  )
}
