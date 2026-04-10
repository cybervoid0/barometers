import { createMaterial, deleteMaterial } from '@/server/materials/actions'
import { getMaterials } from '@/server/materials/queries'
import { createMovement, deleteMovement } from '@/server/movements/actions'
import { getMovements } from '@/server/movements/queries'
import { ReferenceDataList } from './reference-data-list'

export default async function ReferenceDataPage() {
  const [materials, movements] = await Promise.all([getMaterials(), getMovements()])

  return (
    <article className="space-y-8 p-6">
      <h1 className="text-xl font-bold">Reference Data</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <ReferenceDataList
          title="Materials"
          items={materials}
          onCreate={createMaterial}
          onDelete={deleteMaterial}
        />
        <ReferenceDataList
          title="Movement Types"
          items={movements}
          onCreate={createMovement}
          onDelete={deleteMovement}
        />
      </div>
    </article>
  )
}
