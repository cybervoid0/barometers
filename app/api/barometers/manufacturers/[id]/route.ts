import { NextResponse, NextRequest } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import Manufacturer from '@/models/manufacturer'

interface Parameters {
  params: {
    id: string
  }
}

export async function DELETE(req: NextRequest, { params: { id } }: Parameters) {
  await connectMongoose()
  try {
    const deletedManufacturer = await Manufacturer.findByIdAndDelete(id)
    if (!deletedManufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Manufacturer deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Cannot delete manufacturer',
      },
      { status: 500 },
    )
  }
}
