import { NextResponse } from 'next/server'

// Mock usage tracking (in production, this would be a database)
const USER_USAGE = new Map()

function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}`
}

function getUserUsage(userId) {
  const monthKey = getCurrentMonthKey()
  const userKey = `${userId}-${monthKey}`

  if (!USER_USAGE.has(userKey)) {
    USER_USAGE.set(userKey, {
      userId,
      month: monthKey,
      analysesCount: 0,
      lastAnalysisAt: null
    })
  }

  return USER_USAGE.get(userKey)
}

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

    const usage = getUserUsage(userId)

    return NextResponse.json({
      usage,
      message: 'Usage data retrieved successfully.'
    })
  } catch (error) {
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

    const usage = getUserUsage(userId)
    usage.analysesCount += 1
    usage.lastAnalysisAt = Math.floor(Date.now() / 1000)

    return NextResponse.json({
      usage,
      message: 'Usage recorded successfully.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record usage.' },
      { status: 500 }
    )
  }
}