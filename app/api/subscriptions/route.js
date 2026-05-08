import { db } from '../../../lib/supabase.js'
import { supabase } from '../../../lib/supabase.js'
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

    const subscription = await db.getUserSubscription(userId)

    return NextResponse.json({
      subscription: subscription || null,
      message: subscription ? 'Subscription retrieved successfully.' : 'No active subscription found.'
    })
  } catch (error) {
    console.error('Subscriptions API error:', error)
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
    const existingSubscription = await db.getUserSubscription(userId)
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription.' },
        { status: 400 }
      )
    }

    // Create subscription in database
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select(`
        *,
        subscription_plans (*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      subscription,
      message: 'Subscription created successfully.'
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription.' },
      { status: 500 }
    )
  }
}
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