import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { SearchField } from './components/search-field'
import { NewArrivals } from './components/new-arrivals'
import { FrontRoutes } from '@/utils/routes-front'
import { getCategories } from './services'
import { cn } from '@/lib/utils'

export const dynamic = 'force-static'
const gridStyle = 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3'

export default async function HomePage() {
  const categories = await getCategories()
  return (
    <>
      <HeadingImage />
      <div className="container mx-auto">
        <div className="my-6 grid grid-cols-6 items-center gap-x-4 sm:gap-x-10">
          <NewArrivals className="col-span-3 md:col-span-2 lg:col-span-1" />
          <div className="hidden md:block lg:col-span-3" />
          <SearchField className="col-span-3 md:col-span-3 lg:col-span-2" />
        </div>
        <div className={cn(gridStyle, 'gap-8 sm:gap-10')}>
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
      </div>
    </>
  )
}
