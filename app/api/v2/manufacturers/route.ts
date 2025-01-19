import { NextResponse, NextRequest } from 'next/server'
import { Manufacturer } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import traverse from 'traverse'
import { withPrisma } from '@/prisma/prismaClient'
import { getManufacturers } from './getters'
import { cleanObject, getBrandSlug, trimTrailingSlash } from '@/utils/misc'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { brandsRoute } from '@/utils/routes-front'

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

//! Protect this function
/**
 * Create a new Manufacturer
 */
export const POST = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const manufData: Manufacturer = await req.json().then(cleanObject)

    const { id, slug } = await prisma.manufacturer.create({
      data: {
        ...manufData,
        slug: getBrandSlug(manufData.name, manufData.firstName),
      },
    })

    revalidatePath(trimTrailingSlash(brandsRoute))
    revalidatePath(brandsRoute + slug)
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
    const { successors, ...manufData } = await req.json().then(data =>
      // replace empty strings with NULLs
      traverse.map(data, function map(node) {
        if (node === '') this.update(null)
      }),
    )
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id: manufData.id } })
    if (!manufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }
    // update slug if name was changed
    const slug = manufData.name
      ? getBrandSlug(manufData.name, manufData.firstName)
      : manufacturer.slug
    const updatedManufacturer = await prisma.manufacturer.update({
      where: { id: manufacturer.id },
      data: {
        ...manufData,
        ...(successors
          ? {
              successors: {
                set: successors,
              },
            }
          : {}),
        slug,
      },
    })

    revalidatePath(trimTrailingSlash(brandsRoute))
    revalidatePath(brandsRoute + slug)
    return NextResponse.json(updatedManufacturer, { status: 200 })
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
