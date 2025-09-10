import 'server-only'

import { Pagination } from '@/components/ui/pagination'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import { FrontRoutes } from '@/constants/routes-front'
import { searchBarometers } from '@/lib/barometers/search'
import { SearchInfo } from './search-info'
import { SearchItem } from './search-item'

interface SearchProps {
  searchParams: Record<string, string>
}

export default async function Search({ searchParams }: SearchProps) {
  const query = searchParams.q ?? ''
  const pageSize = Math.max(parseInt(searchParams.size, 10) || DEFAULT_PAGE_SIZE, 0)
  const pageNo = Math.max(parseInt(searchParams.page, 10) || 1, 1)
  const {
    barometers = [],
    page = 1,
    totalPages = 0,
  } = await searchBarometers(query, pageNo, pageSize)

  return (
    <article className="mx-auto mt-6 max-w-lg">
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
    </article>
  )
}
