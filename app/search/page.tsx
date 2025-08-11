import { FrontRoutes } from '@/utils/routes-front'
import { SearchItem } from './search-item'
import { searchBarometers } from '@/utils/fetch'
import { SearchInfo } from './search-info'
import { Pagination } from '@/components/ui/pagination'

interface SearchProps {
  searchParams: Record<string, string>
}

export default async function Search({ searchParams }: SearchProps) {
  const { barometers = [], page = 1, totalPages = 0 } = await searchBarometers(searchParams)

  return (
    <div className="mx-auto mt-6 max-w-lg">
      <div className="flex flex-col space-y-6">
        <div className="grow">
          <h2 className="mb-10">Search the entire collection</h2>
          <SearchInfo queryString={searchParams.q} isEmptyResult={barometers.length === 0} />
          <div className="mt-4 flex flex-col space-y-4">
            {barometers.map(({ id, name, manufacturer, image, slug, dateDescription }) => (
              <SearchItem
                image={image}
                name={name}
                manufacturer={
                  (manufacturer.firstName ? `${manufacturer.firstName} ` : '') + manufacturer.name
                }
                link={FrontRoutes.Barometer + slug}
                key={id}
                dating={dateDescription}
              />
            ))}
          </div>
        </div>
        {totalPages > 1 && <Pagination total={totalPages} value={+page} />}
      </div>
    </div>
  )
}
