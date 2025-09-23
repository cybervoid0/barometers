'use server'

import type { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { withPrisma } from '@/prisma/prismaClient'
import { getBrandSlug, getIconBuffer } from '@/utils'

const createBrand = withPrisma(
  async (
    prisma,
    data: Omit<Prisma.ManufacturerCreateInput, 'slug' | 'icon'> & { icon: string | null },
  ) => {
    const { icon, ...createData } = data
    const slug = getBrandSlug(createData.name, createData.firstName)

    // Convert icon string to Buffer if provided
    const iconBuffer = getIconBuffer(icon)

    const { id, name } = await prisma.manufacturer.create({
      data: {
        ...createData,
        slug,
        icon: iconBuffer,
      },
    })
    revalidateTag('brands')
    return { id, name }
  },
)

const updateBrand = withPrisma(
  async (prisma, data: Prisma.ManufacturerUpdateInput & { id: string; icon?: string | null }) => {
    const { id, icon, ...updateData } = data
    const oldBrand = await prisma.manufacturer.findUniqueOrThrow({
      where: { id },
    })
    const slug = updateData.name
      ? getBrandSlug(updateData.name as string, updateData.firstName as string | undefined)
      : oldBrand.slug

    // Convert icon string to Buffer if provided
    const iconBuffer = getIconBuffer(icon)

    await prisma.manufacturer.update({
      where: { id },
      data: {
        ...updateData,
        slug,
        icon: iconBuffer,
      },
    })

    revalidateTag('brands')
    const name = (updateData.name as string) ?? oldBrand.name
    return { slug, name }
  },
)

const deleteBrand = withPrisma(async (prisma, slug: string) => {
  const manufacturer = await prisma.manufacturer.findUniqueOrThrow({ where: { slug } })
  await prisma.manufacturer.delete({
    where: {
      id: manufacturer.id,
    },
  })
  revalidateTag('brands')
})

export { createBrand, updateBrand, deleteBrand }
