'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import type { ActionResult } from '@/types'
import { getIconBuffer } from '@/utils'

type CreateArgs = Omit<Prisma.ManufacturerCreateInput, 'icon'> & { icon: string | null }

const createBrand = withPrisma(
  async (prisma, data: CreateArgs): Promise<ActionResult<{ id: string; name: string }>> => {
    const { icon, ...createData } = data

    // Convert icon string to Buffer if provided
    const iconBuffer = getIconBuffer(icon)

    try {
      const { id, name } = await prisma.manufacturer.create({
        data: {
          ...createData,
          icon: iconBuffer,
        },
      })
      updateTag(Tag.brands)
      return { success: true, data: { id, name } }
    } catch (error) {
      // Handle unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { success: false, error: `Brand with name "${createData.name}" already exists` }
      }

      console.error('Error creating brand:', error)
      return { success: false, error: 'Failed to create brand. Please try again.' }
    }
  },
)

const updateBrand = withPrisma(
  async (
    prisma,
    data: Prisma.ManufacturerUpdateInput & { id: string; icon?: string | null },
  ): Promise<ActionResult<{ slug: string; name: string }>> => {
    const { id, icon, ...updateData } = data

    try {
      // Convert icon string to Buffer if provided
      const iconBuffer = getIconBuffer(icon)

      const { slug, name } = await prisma.manufacturer.update({
        where: { id },
        data: {
          ...updateData,
          icon: iconBuffer,
        },
      })

      updateTag(Tag.brands)
      return { success: true, data: { slug, name } }
    } catch (error) {
      console.error('Error updating brand:', error)
      return { success: false, error: 'Failed to update brand. Please try again.' }
    }
  },
)

const deleteBrand = withPrisma(async (prisma, slug: string) => {
  const manufacturer = await prisma.manufacturer.findUniqueOrThrow({ where: { slug } })
  await prisma.manufacturer.delete({
    where: {
      id: manufacturer.id,
    },
  })
  updateTag(Tag.brands)
})

export { createBrand, updateBrand, deleteBrand }
