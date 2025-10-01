'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { Route } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import type { ActionResult } from '@/types'
import { slug as slugify, trimTrailingSlash } from '@/utils'
import { revalidateCategory } from '@/utils/revalidate'
import { deleteImages } from '../images/actions'

const createBarometer = withPrisma(
  async (
    prisma,
    data: Prisma.BarometerUncheckedCreateInput,
  ): Promise<ActionResult<{ id: string }>> => {
    try {
      const { id, categoryId } = await prisma.barometer.create({
        data,
      })
      await revalidateCategory(prisma, categoryId)
      revalidatePath(trimTrailingSlash(Route.NewArrivals)) // regenerate new arrivals page
      return { success: true, data: { id } }
    } catch (error) {
      // Handle unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          success: false,
          error: `Barometer with name "${data.name}" and cat.no. "${data.collectionId}" already exists`,
        }
      }

      console.error('Error creating barometer:', error)
      return { success: false, error: 'Failed to create barometer. Please try again.' }
    }
  },
)

const updateBarometer = withPrisma(
  async (
    prisma,
    data: Prisma.BarometerUncheckedUpdateInput,
  ): Promise<ActionResult<{ slug: string; name: string }>> => {
    try {
      const oldBarometer = await prisma.barometer.findUniqueOrThrow({
        where: { id: data.id as string },
      })
      // create new slug if name changed
      const slug = data.name ? slugify(data.name as string) : oldBarometer.slug
      await prisma.barometer.update({
        where: { id: data.id as string },
        data: {
          ...data,
          slug,
        },
      })
      revalidatePath(Route.Barometer + slug)
      await revalidateCategory(prisma, (data.categoryId as string) ?? oldBarometer.categoryId)
      const name = (data.name as string) ?? oldBarometer.name
      return { success: true, data: { slug, name } }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          success: false,
          error: 'This value is already used in another barometer',
        }
      }
      console.error('Error updating barometer:', error)
      return { success: false, error: 'Failed to update barometer. Please try again.' }
    }
  },
)

const deleteBarometer = withPrisma(
  async (prisma, slug: string): Promise<ActionResult<{ id: string }>> => {
    try {
      const barometer = await prisma.barometer.findFirstOrThrow({
        where: {
          slug: {
            equals: slug,
            mode: 'insensitive',
          },
        },
      })

      const args = {
        where: { barometers: { some: { id: barometer.id } } },
      }
      // save deleting images info
      const imagesBeforeDbUpdate = (
        await prisma.image.findMany({
          ...args,
          select: {
            url: true,
          },
        })
      ).map(({ url }) => url)
      await prisma.$transaction(async tx => {
        await tx.image.deleteMany(args)
        await tx.barometer.delete({
          where: {
            id: barometer.id,
          },
        })
      })
      await deleteImages(imagesBeforeDbUpdate)
      revalidatePath(Route.Barometer + barometer.slug)
      revalidatePath(trimTrailingSlash(Route.NewArrivals))
      await revalidateCategory(prisma, barometer.categoryId)
      return { success: true, data: { id: barometer.id } }
    } catch (error) {
      console.error('Error deleting barometer:', error)
      return { success: false, error: 'Failed to delete barometer. Please try again.' }
    }
  },
)

export { createBarometer, updateBarometer, deleteBarometer }
