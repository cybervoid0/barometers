import { NextRequest, NextResponse } from 'next/server'
import { type PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'

interface Params {
  params: {
    name: string
  }
}

async function getCategory(prisma: PrismaClient, name: string) {
  return prisma.category.findFirstOrThrow({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      order: true,
      label: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  })
}

export type CategoryDTO = Awaited<ReturnType<typeof getCategory>>

/**
 * Get Category details
 */
export async function GET(_req: NextRequest, { params: { name } }: Params) {
  const prisma = getPrismaClient()
  try {
    const category = await getCategory(prisma, name)
    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error retrieving category details' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
