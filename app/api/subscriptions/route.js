import { db } from '../../../lib/supabase.js'
import { supabase } from '../../../lib/supabase.js'
import { NextResponse } from 'next/server'

function normalizeSubscription(subscription) {
  if (!subscription) return null

  return {
    ...subscription,
    plan: subscription.subscription_plans || null,
    currentPeriodStart: subscription.current_period_start || null,
    currentPeriodEnd: subscription.current_period_end || null,
    cancelAtPeriodEnd: subscription.status === 'cancelled',
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

    const subscription = await db.getUserSubscription(userId)

    return NextResponse.json({
      subscription: normalizeSubscription(subscription),
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
      subscription: normalizeSubscription(subscription),
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

    const { data: existingSubscription, error: existingError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existingError || !existingSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      )
    }

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: planId,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSubscription.id)
      .select(`
        *,
        subscription_plans (*)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      subscription: normalizeSubscription(updatedSubscription),
      message: 'Subscription updated successfully.'
    })
  } catch (error) {
    console.error('Update subscription error:', error)
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

    const { data: existingSubscription, error: existingError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existingError || !existingSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      )
    }

    const { data: cancelledSubscription, error: cancelError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSubscription.id)
      .select(`
        *,
        subscription_plans (*)
      `)
      .single()

    if (cancelError) throw cancelError

    return NextResponse.json({
      subscription: normalizeSubscription(cancelledSubscription),
      message: 'Subscription cancelled successfully.'
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription.' },
      { status: 500 }
    )
  }
}