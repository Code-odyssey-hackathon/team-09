import { NextResponse } from 'next/server'

// Mock user subscriptions storage (in production, this would be a database)
const USER_SUBSCRIPTIONS = new Map()

// Mock subscription data structure
function createSubscription(userId, planId) {
  const plan = require('./plans/route.js').BUSINESS_PLANS.find(p => p.id === planId)
  if (!plan) throw new Error('Plan not found')

  return {
    id: `sub-${Math.random().toString(36).substring(2, 14)}`,
    userId,
    planId,
    status: 'active',
    currentPeriodStart: Math.floor(Date.now() / 1000),
    currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    cancelAtPeriodEnd: false,
    createdAt: Math.floor(Date.now() / 1000),
    plan: plan
  }
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

    const subscription = USER_SUBSCRIPTIONS.get(userId)

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No active subscription found.'
      })
    }

    return NextResponse.json({
      subscription,
      message: 'Subscription retrieved successfully.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve subscription.' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const { userId, planId } = data

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and Plan ID are required.' },
        { status: 400 }
      )
    }

    // Check if user already has a subscription
    if (USER_SUBSCRIPTIONS.has(userId)) {
      return NextResponse.json(
        { error: 'User already has an active subscription.' },
        { status: 400 }
      )
    }

    const subscription = createSubscription(userId, planId)
    USER_SUBSCRIPTIONS.set(userId, subscription)

    return NextResponse.json({
      subscription,
      message: 'Subscription created successfully.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription.' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()
    const { userId, planId } = data

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and Plan ID are required.' },
        { status: 400 }
      )
    }

    const existingSubscription = USER_SUBSCRIPTIONS.get(userId)
    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      )
    }

    const newSubscription = createSubscription(userId, planId)
    USER_SUBSCRIPTIONS.set(userId, newSubscription)

    return NextResponse.json({
      subscription: newSubscription,
      message: 'Subscription updated successfully.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      )
    }

    const subscription = USER_SUBSCRIPTIONS.get(userId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      )
    }

    // Mark for cancellation at period end
    subscription.cancelAtPeriodEnd = true

    return NextResponse.json({
      subscription,
      message: 'Subscription will be cancelled at the end of the current period.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel subscription.' },
      { status: 500 }
    )
  }
}