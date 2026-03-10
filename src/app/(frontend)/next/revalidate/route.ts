import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const path = searchParams.get('path')

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error: 'REVALIDATE_SECRET is not configured.',
      },
      { status: 500 },
    )
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized.',
      },
      { status: 401 },
    )
  }

  if (!path || !path.startsWith('/')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid path. Provide a relative path like "/portfolio-strategy".',
      },
      { status: 400 },
    )
  }

  revalidatePath(path)

  return NextResponse.json({
    success: true,
    revalidated: true,
    path,
    now: Date.now(),
  })
}
