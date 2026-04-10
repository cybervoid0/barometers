import 'server-only'

import { createMaterial, deleteMaterial, updateMaterial } from '@/server/materials/actions'
import { getMaterials } from '@/server/materials/queries'
import { ReferenceDataList } from '../_components/reference-data-list'

export default async function MaterialsPage() {
  const materials = await getMaterials()

  return (
    <article className="mx-auto max-w-2xl space-y-6 p-6">
      <h3 className="mt-6 mb-10">Materials</h3>

      <ReferenceDataList
        addLabel="Add new material"
        items={materials}
        onCreate={createMaterial}
        onUpdate={updateMaterial}
        onDelete={deleteMaterial}
      />
    </article>
  )
}
