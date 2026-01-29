import 'server-only'

import { getAllBrands } from '@/server/brands/queries'
import { getCategories } from '@/server/categories/queries'
import { getConditions } from '@/server/conditions/queries'
import { getMaterials } from '@/server/materials/queries'
import { getMovements } from '@/server/movements/queries'
import BarometerForm from './barometer-form'

export default async function AddBarometer() {
  const [conditions, categories, movements, brands, materials] = await Promise.all([
    getConditions(),
    getCategories(),
    getMovements(),
    getAllBrands(),
    getMaterials(),
  ])
  return (
    <section className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new barometer</h3>
      <BarometerForm
        conditions={conditions}
        categories={categories}
        movements={movements}
        brands={brands}
        materials={materials}
      />
    </section>
  )
}
