import { db } from '../../../lib/supabase.js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const plans = await db.getSubscriptionPlans()

    return NextResponse.json({
      plans,
      message: 'Subscription plans retrieved successfully.'
    })
  } catch (error) {
    console.error('Plans API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve subscription plans.' },
      { status: 500 }
    )
  }
}