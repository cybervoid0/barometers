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
import {
  IconBuildingFactory2,
  IconCalendarQuestion,
  IconTimeline,
  IconNumber,
  IconTopologyRing2,
  IconDimensions,
  IconTagStarred,
  IconCategory2,
  IconCurrencyEuro,
  IconWood,
} from '@tabler/icons-react'
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
import { InaccuracyReport } from './components/inaccuracy-report'
import { MD } from '@/app/components/md'
// edit components
import { DimensionEdit } from './components/edit-fields/dimensions-edit'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { TextAreaEdit } from './components/edit-fields/textarea-edit'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'
import { DateEdit } from './components/edit-fields/date-edit'
import { EstimatedPriceEdit } from './components/edit-fields/estimated-price-edit'
import { SubcategoryEdit } from './components/edit-fields/subcategory-edit'
import { MaterialsEdit } from './components/edit-fields/materials-edit'

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
              icon={IconBuildingFactory2}
              title="Manufacturer or Retailer"
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
              icon={IconNumber}
              title="Serial Number"
              content={barometer.serial}
              edit={<TextFieldEdit barometer={barometer} property="serial" />}
            />
            <PropertyCard
              adminOnly
              icon={IconTopologyRing2}
              title="Collection ID"
              content={barometer.collectionId}
              edit={<TextFieldEdit barometer={barometer} property="collectionId" />}
            />
            <PropertyCard
              adminOnly
              icon={IconCalendarQuestion}
              title="Year"
              content={dayjs(barometer.date).format('YYYY')}
              edit={<DateEdit barometer={barometer} />}
            />
            <PropertyCard
              icon={IconTimeline}
              title="Dating"
              content={barometer.dateDescription}
              edit={<TextFieldEdit barometer={barometer} property="dateDescription" />}
            />
            <PropertyCard
              icon={IconTagStarred}
              title="Condition"
              content={<Condition condition={barometer.condition} />}
              edit={<ConditionEdit barometer={barometer} />}
            />
            <PropertyCard
              adminOnly={!barometer.subCategory?.name}
              icon={IconCategory2}
              title="Movement (Tube) Type"
              content={
                <Text size="sm" tt="capitalize">
                  {barometer.subCategory?.name}
                </Text>
              }
              edit={<SubcategoryEdit barometer={barometer} />}
            />
            <PropertyCard
              adminOnly
              icon={IconCurrencyEuro}
              title="Estimated Price"
              content={
                barometer.estimatedPrice !== null
                  ? `€${barometer.estimatedPrice.toFixed(2)}`
                  : undefined
              }
              edit={<EstimatedPriceEdit barometer={barometer} />}
            />
            <PropertyCard
              adminOnly={dimensions.length === 0}
              icon={IconDimensions}
              title="Dimensions"
              content={
                <List listStyleType="none">
                  {/* For non-admins show only the first two items */}
                  {dimensions.slice(0, 2).map(({ dim, value }) => (
                    <DimListItem key={dim} name={dim} value={value} />
                  ))}
                  <IsAdmin>
                    {dimensions.slice(2).map(({ dim, value }) => (
                      <DimListItem key={dim} name={dim} value={value} />
                    ))}
                  </IsAdmin>
                </List>
              }
              edit={<DimensionEdit barometer={barometer} />}
            />
            <PropertyCard
              adminOnly={!barometer.materials || barometer.materials.length === 0}
              icon={IconWood}
              title="Materials"
              content={
                <Text size="sm">{barometer.materials.map(item => item.name).join(', ')}</Text>
              }
              edit={<MaterialsEdit barometer={barometer} />}
            />
          </Grid>
          <Group align="center" gap="sm">
            <Title fw={600} order={2} tt="capitalize">
              Description
            </Title>
            <IsAdmin>
              <TextAreaEdit barometer={barometer} property="description" />
            </IsAdmin>
          </Group>

          {barometer.description ? (
            <DescriptionText mt="lg" description={barometer.description} />
          ) : (
            <IsAdmin>
              <Text>Add description</Text>
            </IsAdmin>
          )}

          <Divider
            py="lg"
            labelPosition="center"
            label={<InaccuracyReport barometer={barometer} />}
          />

          <IsAdmin>
            <Group mb="sm" align="center" gap="sm">
              <Title fw={600} order={2} tt="capitalize">
                Provenance
              </Title>
              <IsAdmin>
                <TextAreaEdit barometer={barometer} property="provenance" />
              </IsAdmin>
            </Group>
            {barometer.provenance ? <MD>{barometer.provenance}</MD> : <Text>No text</Text>}
          </IsAdmin>
        </Paper>
      </Box>
    </Container>
  )
}

const DimListItem = ({ name, value }: { name: string; value: string }) => (
  <ListItem>
    <Text size="sm" tt="capitalize" fw={500} component="span">
      {name}:
    </Text>{' '}
    <Text size="sm" component="span">
      {value}
    </Text>
  </ListItem>
)
