import { NextResponse, NextRequest } from 'next/server'
import { withPrisma } from '@/prisma/prismaClient'
import { getManufacturer } from './getters'
import { slug } from '@/utils/misc'

interface Parameters {
  params: {
    id: string
  }
}

/**
 * Query a specific manufacturer by ID
 */
export async function GET(req: NextRequest, { params: { id } }: Parameters) {
  try {
    const manufacturer = await getManufacturer(id)
    return NextResponse.json(manufacturer, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error querying manufacturer' },
      { status: 500 },
    )
  }
}

/**
 * Update manufacturer with a specified ID
 */
export const PUT = withPrisma(async (prisma, req: NextRequest, { params: { id } }: Parameters) => {
  try {
    const manufData = await req.json()
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id } })
    if (!manufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }

    const updatedManufacturer = await prisma.manufacturer.update({
      where: { id },
      data: {
        ...manufData,
        slug: manufData.name ? slug(manufData.name) : manufacturer.slug,
      },
    })

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

// !нужно как-то защитить от общего доступа к этой функции

/**
 * Delete manufacturer by ID
 */

export const DELETE = withPrisma(
  async (prisma, req: NextRequest, { params: { id } }: Parameters) => {
    try {
      const manufacturer = await prisma.manufacturer.findUnique({ where: { id } })
      if (!manufacturer) {
        return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
      }
      await prisma.manufacturer.delete({
        where: {
          id,
        },
      })
      return NextResponse.json({ message: 'Manufacturer deleted successfully' }, { status: 200 })
    } catch (error) {
      return NextResponse.json(
        {
          message: error instanceof Error ? error.message : 'Cannot delete manufacturer',
        },
        { status: 500 },
      )
    }
  },
)
