import { Manufacturer } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import traverse from 'traverse'
import { FrontRoutes } from '@/constants/routes-front'
import { withPrisma } from '@/prisma/prismaClient'
import { cleanObject, getBrandSlug, trimTrailingSlash } from '@/utils'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { getManufacturers } from './getters'

interface ManufacturerDTO extends Omit<Manufacturer, 'icon'> {
  successors?: { id: string }[]
  countries?: { id: number }[]
  images?: { id: string; url: string; blurData: string }[]
  icon?: string | null
}
/**
 * Retrieve a list of all Manufacturers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const size = Math.max(Number(searchParams.get('size') ?? DEFAULT_PAGE_SIZE), 0)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const manufacturers = await getManufacturers(page, size)
    return NextResponse.json(manufacturers, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting manufacturers' },
      { status: 500 },
    )
  }
}

/**
 * Create a new Manufacturer
 */
export const POST = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const { successors, countries, images, icon, ...manufData }: ManufacturerDTO = await req
      .json()
      .then(cleanObject)

    // Convert base64 to Buffer
    const iconBuffer =
      icon && typeof icon === 'string'
        ? Buffer.from(icon.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        : null

    const { id, slug } = await prisma.manufacturer.create({
      data: {
        ...manufData,
        ...(iconBuffer
          ? {
              icon: iconBuffer,
            }
          : {}),
        slug: getBrandSlug(manufData.name, manufData.firstName),
        ...(successors
          ? {
              successors: {
                connect: successors,
              },
            }
          : {}),
        ...(countries
          ? {
              countries: {
                connect: countries,
              },
            }
          : {}),
        ...(images
          ? {
              images: {
                create: images,
              },
            }
          : {}),
      },
    })

    revalidatePath(trimTrailingSlash(FrontRoutes.Brands))
    revalidatePath(FrontRoutes.Brands + slug)
    await revalidateSuccessors(successors)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Cannot add new manufacturer' },
      { status: 500 },
    )
  }
})

/**
 * Update manufacturer
 */
export const PUT = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const { successors, countries, images, icon, ...manufData }: ManufacturerDTO = await req
      .json()
      .then(data =>
        // replace empty strings with NULLs
        traverse.map(data, function map(node) {
          if (node === '') this.update(null)
        }),
      )

    // Convert base64 to Buffer
    const iconBuffer =
      icon && typeof icon === 'string'
        ? Buffer.from(icon.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        : null
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id: manufData.id } })
    if (!manufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }
    // update slug if name was changed
    const slug = manufData.name
      ? getBrandSlug(manufData.name, manufData.firstName)
      : manufacturer.slug
    await prisma.$transaction(async tx => {
      await Promise.all([
        // delete old images if the new ones are provided
        images
          ? tx.image.deleteMany({ where: { barometers: { some: { id: manufacturer.id } } } })
          : Promise.resolve(),
        await tx.manufacturer.update({
          where: { id: manufacturer.id },
          data: {
            ...manufData,
            ...(iconBuffer
              ? {
                  icon: iconBuffer,
                }
              : {}),
            ...(successors
              ? {
                  successors: {
                    set: successors,
                  },
                }
              : {}),
            ...(countries
              ? {
                  countries: {
                    set: countries,
                  },
                }
              : {}),
            images: images
              ? {
                  deleteMany: {},
                  create: images,
                }
              : {},
            slug,
          },
        }),
      ])
    })

    revalidatePath(trimTrailingSlash(FrontRoutes.Brands))
    revalidatePath(FrontRoutes.Brands + slug)
    await revalidateSuccessors(successors)
    return NextResponse.json({ slug }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Cannot update manufacturer',
      },
      { status: 500 },
    )
  }
})

const revalidateSuccessors = withPrisma(async (prisma, successorIds?: { id: string }[]) => {
  if (typeof successorIds === 'undefined' || successorIds.length === 0) return
  const inArray = successorIds.map(({ id }) => id)
  const slugs = await prisma.manufacturer.findMany({
    where: { id: { in: inArray } },
    select: { slug: true },
  })
  slugs.forEach(({ slug }) => {
    revalidatePath(FrontRoutes.Brands + slug)
  })
})
