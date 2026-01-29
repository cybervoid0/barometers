import 'server-only'

import { getAllBrands } from '@/server/brands/queries'
import { getCountries } from '@/server/counties/queries'
import BrandAddForm from './brand-add-form'

export default async function AddBrand() {
  const [countries, brands] = await Promise.all([getCountries(), getAllBrands()])

  return (
    <section className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new brand</h3>
      <BrandAddForm countries={countries} brands={brands} />
    </section>
  )
}
