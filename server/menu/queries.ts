import 'server-only'

import { AccessRole } from '@prisma/client'
import { Route } from '@/constants'
import { getCategories } from '@/server/categories/queries'
import type { MenuItem } from '@/types'

export async function getMenuData(): Promise<MenuItem[]> {
  const categories = await getCategories()
  return [
    {
      id: 0,
      label: 'Home',
      link: Route.Home,
    },
    {
      id: 1,
      label: 'Foundation',
      link: Route.Foundation,
      children: [
        {
          id: 6,
          label: 'About Us',
          link: Route.Foundation,
        },
        {
          id: 7,
          label: 'Donate',
          link: Route.Donate,
        },
      ],
    },
    {
      id: 2,
      label: 'Collection',
      link: '/collection',
      children: categories.map(cat => ({
        id: cat.id,
        link: Route.Categories + cat.name.toLocaleLowerCase(),
        label: cat.label,
      })),
    },
    {
      id: 3,
      label: 'Brands',
      link: Route.Brands,
    },
    {
      id: 4,
      label: 'About',
      link: Route.About,
    },
    {
      id: 5,
      label: 'Admin',
      link: Route.Admin,
      visibleFor: AccessRole.ADMIN,
    },
  ]
}
