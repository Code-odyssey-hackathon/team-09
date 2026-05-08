import { db } from '../../../lib/supabase.js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      )
    }

    const usage = await db.getUserUsage(userId)

    return NextResponse.json({
      usage,
      message: 'Usage data retrieved successfully.'
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve usage data.' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const { userId } = data

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      )
    }

    const usage = await db.incrementUsage(userId)

    return NextResponse.json({
      usage,
      message: 'Usage incremented successfully.'
    })
  } catch (error) {
    console.error('Increment usage error:', error)
    return NextResponse.json(
      { error: 'Failed to increment usage.' },
      { status: 500 }
    )
  }
}