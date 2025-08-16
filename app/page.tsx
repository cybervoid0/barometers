import 'server-only'

import { CategoryCard, SearchField, NewArrivals } from '@/components/elements'
import { FrontRoutes } from '@/constants'
import { getCategories } from '@/services'
import { cn } from '@/utils'

export const dynamic = 'force-static'
const gridStyle = 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3'

export default async function HomePage() {
  const categories = await getCategories()
  return (
    <>
      <div className="my-6 grid grid-cols-6 items-center gap-x-4 sm:gap-x-5">
        <NewArrivals className="col-span-2 md:col-span-2 lg:col-span-1" />
        <div className="hidden md:block lg:col-span-3" />
        <SearchField className="col-span-4 md:col-span-3 lg:col-span-2" />
      </div>
      <div className={cn(gridStyle, 'gap-4 sm:gap-5')}>
        {categories.map(({ id, name, image }, i) => (
          <CategoryCard
            key={id}
            priority={i < 3}
            image={image}
            name={name}
            link={FrontRoutes.Categories + name}
          />
        ))}
      </div>
    </>
  )
}
