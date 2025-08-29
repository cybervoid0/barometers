import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { FrontRoutes } from '@/constants/routes-front'
import { withPrisma } from '@/prisma/prismaClient'
import { trimTrailingSlash } from '@/utils'
import { revalidateCategory } from '../revalidate'
import { deleteImagesFromStorage } from './deleteFromStorage'
import { getBarometer } from './getters'

interface Props {
  params: {
    slug: string
  }
}

/**
 * Get Barometer details by slug
 */
export async function GET(_req: NextRequest, { params: { slug } }: Props) {
  try {
    const barometer = await getBarometer(slug)
    return NextResponse.json(barometer, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
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
export const DELETE = withPrisma(async (prisma, _req: NextRequest, { params: { slug } }: Props) => {
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
    const args = {
      where: { barometers: { some: { id: barometer.id } } },
    }
    // save deleting images info
    const imagesBeforeDbUpdate = await prisma.image.findMany(args)
    await prisma.$transaction(async tx => {
      await tx.image.deleteMany(args)
      await tx.barometer.delete({
        where: {
          id: barometer.id,
        },
      })
    })
    await deleteImagesFromStorage(imagesBeforeDbUpdate)
    revalidatePath(FrontRoutes.Barometer + barometer.slug)
    revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals))
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
})
