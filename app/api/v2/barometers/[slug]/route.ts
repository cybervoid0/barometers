import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getBarometer } from './getters'
import { withPrisma } from '@/prisma/prismaClient'
import { NotFoundError } from '@/app/errors'
import { revalidateCategory } from '../revalidate'
import { barometerRoute, newArrivals } from '@/app/constants'
import { deleteImagesFromGoogleStorage } from './deleteFromStorage'

interface Params {
  params: {
    slug: string
  }
}

/**
 * Get Barometer details by slug
 */
export async function GET(_req: NextRequest, { params: { slug } }: Params) {
  try {
    const barometer = await getBarometer(slug)
    return NextResponse.json(barometer, { status: 200 })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error retrieving barometer' },
      { status: 500 },
    )
  }
}

/**
 * Delete Barometer by slug
 */
/* eslint-disable prettier/prettier */
export const DELETE = withPrisma(
  async (prisma, _req: NextRequest, { params: { slug } }: Params) => {
    try {
      const barometer = await prisma.barometer.findFirst({
        where: {
          slug: {
            equals: slug,
            mode: 'insensitive',
          },
        },
      })

      if (!barometer) {
        return NextResponse.json({ message: 'Barometer not found' }, { status: 404 })
      }
      await deleteImagesFromGoogleStorage(prisma, barometer.id)
      await prisma.$transaction(async tx => {
        await tx.image.deleteMany({
          where: { barometers: { some: { id: barometer.id } } },
        })
        await tx.barometer.delete({
          where: {
            id: barometer.id,
          },
        })
      })

      revalidatePath(barometerRoute + barometer.slug)
      revalidatePath(newArrivals)
      await revalidateCategory(prisma, barometer.categoryId)

      return NextResponse.json({ message: 'Barometer deleted successfully' }, { status: 200 })
    } catch (error) {
      return NextResponse.json(
        {
          message: error instanceof Error ? error.message : 'Error deleting barometer',
        },
        { status: 500 },
      )
    }
  },
)
