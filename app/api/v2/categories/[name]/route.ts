import { NextRequest, NextResponse } from 'next/server'
import { getCategory } from './getters'

interface Props {
  params: Promise<{
    name: string
  }>
}

/**
 * Get Category details
 */
export async function GET(_req: NextRequest, props: Props) {
  const params = await props.params
  const { name } = params

  try {
    const category = await getCategory(name)
    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error retrieving category details' },
      { status: 500 },
    )
  }
}
