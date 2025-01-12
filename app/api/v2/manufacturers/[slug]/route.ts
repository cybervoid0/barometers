import { NextResponse, NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { withPrisma } from '@/prisma/prismaClient'
import { getManufacturer } from './getters'
import { brandsRoute } from '@/utils/routes-front'
import { trimTrailingSlash } from '@/utils/misc'

interface Props {
  params: {
    slug: string
  }
}

/**
 * Query a specific manufacturer by slug
 */
export async function GET(req: NextRequest, { params: { slug } }: Props) {
  try {
    const manufacturer = await getManufacturer(slug)
    return NextResponse.json(manufacturer, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error querying manufacturer' },
      { status: 500 },
    )
  }
}

// !нужно как-то защитить от общего доступа к этой функции

/**
 * Delete manufacturer by ID
 */

export const DELETE = withPrisma(async (prisma, req: NextRequest, { params: { slug } }: Props) => {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({ where: { slug } })
    if (!manufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }
    await prisma.manufacturer.delete({
      where: {
        id: manufacturer.id,
      },
    })

    revalidatePath(trimTrailingSlash(brandsRoute))
    revalidatePath(brandsRoute + slug)
    return NextResponse.json({ message: 'Manufacturer deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Cannot delete manufacturer',
      },
      { status: 500 },
    )
  }
})
