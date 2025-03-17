import Link from 'next/link'
import dayjs from 'dayjs'
import {
  Container,
  Title,
  Text,
  Box,
  Divider,
  Anchor,
  Grid,
  Paper,
  List,
  ListItem,
  Group,
} from '@mantine/core'
import { brandsRoute } from '@/utils/routes-front'
import { ImageCarousel } from './components/carousel'
import { Condition } from './components/condition'
import { BreadcrumbsComponent } from './components/breadcrumbs'
import { DescriptionText } from '@/app/components/description-text'
import { Dimensions } from '@/app/types'
import { withPrisma } from '@/prisma/prismaClient'
import { getBarometer } from '@/app/api/v2/barometers/[slug]/getters'
import { IsAdmin } from '@/app/components/is-admin'
import { PropertyCard } from './components/property-card/property-card'
import { DeleteBarometer } from './components/delete-barometer'
// edit components
import { DimensionEdit } from './components/edit-fields/dimensions-edit'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { DescriptionEdit } from './components/edit-fields/description-edit'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'
import { DateEdit } from './components/edit-fields/date-edit'
import { EstimatedPriceEdit } from './components/edit-fields/estimated-price-edit'
// icon images
import {
  conditionsImg,
  datingImg,
  dimensionsImg,
  manufacturerImg,
  serialNoImg,
  subcategories,
  price,
} from './components/property-card'
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

export default async function Page({ params: { slug } }: Props) {
  const barometer = await getBarometer(slug)
  const { firstName, name, city } = barometer.manufacturer
  const dimensions = (barometer.dimensions ?? []) as Dimensions
  return (
    <Container size="xl">
      <Box px={{ base: 'none', sm: 'xl' }} pb={{ base: 'xl', sm: '5rem' }}>
        <BreadcrumbsComponent catId={barometer.collectionId} type={barometer.category.name} />
        <ImageCarousel barometer={barometer} />
        <Paper p="lg">
          <Group mb="lg" align="center" justify="space-between" wrap="nowrap">
            <Group align="center" gap="sm">
              <Title fw={600} order={2} tt="capitalize">
                {barometer.name}
              </Title>
              <IsAdmin>
                <TextFieldEdit barometer={barometer} property="name" />
              </IsAdmin>
            </Group>
            <DeleteBarometer barometer={barometer} />
          </Group>
          <Grid justify="center" mb="xl">
            <PropertyCard
              icon={manufacturerImg}
              title="Manufacturer/Retailer"
              content={
                <Anchor
                  underline="always"
                  href={brandsRoute + barometer.manufacturer.slug}
                  component={Link}
                  c="dark.3"
                  fw={400}
                >{`${firstName ? `${firstName} ` : ''}${name}${city ? `, ${city}` : ''}`}</Anchor>
              }
              edit={<ManufacturerEdit barometer={barometer} />}
            />
            <PropertyCard
              icon={serialNoImg}
              title="Serial Number"
              content={barometer.serial}
              edit={<TextFieldEdit barometer={barometer} property="serial" />}
            />
            <PropertyCard
              adminOnly
              icon={serialNoImg}
              title="Collection ID"
              content={barometer.collectionId}
              edit={<TextFieldEdit barometer={barometer} property="collectionId" />}
            />
            <PropertyCard
              adminOnly
              icon={datingImg}
              title="Year"
              content={dayjs(barometer.date).format('YYYY')}
              edit={<DateEdit barometer={barometer} />}
            />
            <PropertyCard
              icon={datingImg}
              title="Dating"
              content={barometer.dateDescription}
              edit={<TextFieldEdit barometer={barometer} property="dateDescription" />}
            />
            <PropertyCard
              adminOnly={dimensions.length === 0}
              icon={dimensionsImg}
              title="Dimensions"
              content={
                <List listStyleType="none">
                  {dimensions.map(dim => (
                    <ListItem key={dim.dim}>
                      <Text size="sm" tt="capitalize" fw={500} component="span">
                        {dim.dim}:
                      </Text>{' '}
                      <Text size="sm" component="span">
                        {dim.value}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              }
              edit={<DimensionEdit barometer={barometer} />}
            />
            <PropertyCard
              icon={conditionsImg}
              title="Condition"
              content={<Condition condition={barometer.condition} />}
              edit={<ConditionEdit barometer={barometer} />}
            />
            <PropertyCard
              adminOnly
              icon={subcategories}
              title="Subcategories"
              content={barometer.subCategory?.name}
            />
            <PropertyCard
              adminOnly
              icon={price}
              title="Estimated Price"
              content={
                barometer.estimatedPrice ? `€${barometer.estimatedPrice.toFixed(2)}` : undefined
              }
              edit={<EstimatedPriceEdit barometer={barometer} />}
            />
          </Grid>

          <Divider labelPosition="center" label={<InaccuracyReport barometer={barometer} />} />
          {barometer.description ? (
            <DescriptionText mt="lg" description={barometer.description} />
          ) : (
            <IsAdmin>
              <Text>Add description</Text>
            </IsAdmin>
          )}
          <IsAdmin>
            <Group justify="flex-end">
              <DescriptionEdit barometer={barometer} />
            </Group>
          </IsAdmin>
        </Paper>
      </Box>
    </Container>
  )
}
