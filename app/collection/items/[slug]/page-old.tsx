import { Container, Title, Text, Box, Divider, Tooltip, Stack, Anchor } from '@mantine/core'
import dayjs from 'dayjs'
import Link from 'next/link'
import { brandsRoute } from '@/utils/routes-front'
import { ImageCarousel } from './components/carousel'
import { Condition } from './components/condition'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { DescriptionEdit } from './components/edit-fields/description-edit'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'
import { BreadcrumbsComponent } from './components/breadcrumbs'
import sx from './styles.module.scss'
import DimensionEdit from './components/edit-fields/dimensions-edit'
import { DescriptionText } from '@/app/components/description-text'
import { Dimensions } from '@/app/types'
import { withPrisma } from '@/prisma/prismaClient'
import { getBarometer } from '@/app/api/v2/barometers/[slug]/getters'
import { IsAdmin } from '@/app/components/is-admin'
import { DateEdit } from './components/edit-fields/date-edit'
import { DeleteBarometer } from './components/delete-barometer'
import InaccuracyReport from './components/inaccuracy-report'

export const dynamic = 'force-static'

interface Props {
  params: {
    slug: string
  }
}

/**
 * This function fetches all barometers from the API and maps their slugs
 * to be used as static parameters for Next.js static generation.
 */
export const generateStaticParams = withPrisma(prisma =>
  prisma.barometer.findMany({ select: { slug: true } }),
)

export default async function BarometerItem({ params: { slug } }: Props) {
  const barometer = await getBarometer(slug)

  const dimensions = barometer.dimensions as Dimensions
  return (
    <Container size="xl">
      <Box px={{ base: 'none', sm: 'xl' }} pb={{ base: 'xl', sm: '5rem' }}>
        <BreadcrumbsComponent catId={barometer.collectionId} type={barometer.category.name} />
        <ImageCarousel barometer={barometer} />
        <Box mb="md">
          <Title
            className={sx.title}
          >{`${barometer.name.split(' ').slice(0, -1).join(' ')} `}</Title>
          <Title className={sx.title} style={{ whiteSpace: 'nowrap' }}>
            {barometer.name.split(' ').at(-1)}
            <IsAdmin>
              <TextFieldEdit barometer={barometer} property="name" size={22} />
            </IsAdmin>
          </Title>
          <Tooltip label="Collection ID">
            <Text className={sx.collectionId}>{barometer.collectionId}</Text>
          </Tooltip>
        </Box>

        <IsAdmin>
          <DeleteBarometer mb="sm" size="compact-md" barometer={barometer} />
        </IsAdmin>

        <Stack gap={0}>
          <Box style={{ flexGrow: 1 }}>
            {barometer.manufacturer && (
              <Box>
                <Title className={sx.heading} order={3}>
                  Manufacturer/Retailer:&nbsp;
                </Title>
                <Anchor
                  underline="always"
                  href={brandsRoute + barometer.manufacturer.slug}
                  component={Link}
                  c="dark.3"
                  fw={400}
                >
                  {(() => {
                    const { firstName, name, city } = barometer.manufacturer
                    return `${firstName ? `${firstName} ` : ''}${name}${city ? `, ${city}` : ''}`
                  })()}
                </Anchor>
                <IsAdmin>
                  <ManufacturerEdit barometer={barometer} />
                </IsAdmin>
              </Box>
            )}

            <IsAdmin>
              <Title className={sx.heading} order={3}>
                Year:&nbsp;
              </Title>
              <Text c="dark.3" fw={400} display="inline">
                {dayjs(barometer.date).format('YYYY')}
                <DateEdit barometer={barometer} />
              </Text>
            </IsAdmin>

            <Box>
              <Title className={sx.heading} order={3}>
                Dating:&nbsp;
              </Title>
              <Text c="dark.3" fw={400} display="inline">
                {barometer.dateDescription}
                <IsAdmin>
                  <TextFieldEdit barometer={barometer} property="dateDescription" />
                </IsAdmin>
              </Text>
            </Box>

            {dimensions && dimensions.length > 0 && (
              <Box>
                <Title className={sx.heading} fw={500} order={3}>
                  Dimensions:{' '}
                  {dimensions.map((dimension, index, arr) => (
                    <Text c="dark.3" display="inline" key={index}>
                      {dimension.dim} {dimension.value}
                      {index < arr.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                  <IsAdmin>
                    <DimensionEdit barometer={barometer} />
                  </IsAdmin>
                </Title>
              </Box>
            )}

            <Condition
              condition={barometer.condition}
              editButton={
                <IsAdmin>
                  <ConditionEdit barometer={barometer} />
                </IsAdmin>
              }
            />
          </Box>

          <InaccuracyReport size="compact-md" barometer={barometer} className={sx.inaccuracy} />
        </Stack>

        <Divider
          mx="lg"
          my="lg"
          labelPosition="right"
          label={
            <IsAdmin>
              <DescriptionEdit barometer={barometer} />
            </IsAdmin>
          }
        />
        {barometer.description ? (
          <DescriptionText description={barometer.description} />
        ) : (
          <IsAdmin>
            <Text>Add description</Text>
          </IsAdmin>
        )}
      </Box>
    </Container>
  )
}
