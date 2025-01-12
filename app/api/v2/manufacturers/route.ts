import { NextResponse, NextRequest } from 'next/server'
import { Manufacturer } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { withPrisma } from '@/prisma/prismaClient'
import { getManufacturers } from './getters'
import { slug as slugify } from '@/utils/misc'
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
    const manufData: Manufacturer = await req.json()

    const { id, slug } = await prisma.manufacturer.create({
      data: {
        ...manufData,
        slug: slugify(manufData.name),
      },
    })

    try {
      console.log('revalidate on create new', brandsRoute, brandsRoute + slug)
      revalidatePath(brandsRoute)
      revalidatePath(brandsRoute + slug)
    } catch (error) {
      console.log('Error revalidating on create new', brandsRoute, brandsRoute + slug)
    }
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
    const manufData = await req.json()
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id: manufData.id } })
    if (!manufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }
    // update slug if name was changed
    const slug = manufData.name ? slugify(manufData.name) : manufacturer.slug
    const updatedManufacturer = await prisma.manufacturer.update({
      where: { id: manufacturer.id },
      data: {
        ...manufData,
        slug,
      },
    })
    try {
      console.log('revalidate on update', brandsRoute, brandsRoute + slug)
      revalidatePath(brandsRoute)
      revalidatePath(brandsRoute + slug)
    } catch (error) {
      console.log('Error revalidating on update', brandsRoute, brandsRoute + slug)
    }
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
