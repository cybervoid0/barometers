import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { SearchField } from './components/search-field'
import { NewArrivals } from './components/new-arrivals'
import { FrontRoutes } from '@/utils/routes-front'
import { getCategories } from './services'

export const dynamic = 'force-static'

export default async function HomePage() {
  const categories = await getCategories()
  return (
    <>
      <HeadingImage />
      <div className="container mx-auto px-2 xs:px-0">
        <div className="flex flex-nowrap items-center gap-2">
          <NewArrivals />
          <SearchField
            ml="auto"
            w={{ base: '100%', xs: 'calc(50% - 1.25rem)', lg: 'calc(33% - 1.25rem)' }}
          />
        </div>
        <div className="grid grid-cols-1 gap-8 xs:grid-cols-2 sm:gap-10 lg:grid-cols-3">
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
