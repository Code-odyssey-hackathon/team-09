import { NextResponse } from 'next/server'

// Mock business plans data
const BUSINESS_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: [
      '5 image analyses per month',
      'Basic crop stress detection',
      'Email support',
      'Community access'
    ],
    limits: {
      analysesPerMonth: 5,
      concurrentUploads: 1,
      storageDays: 30
    }
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 499,
    currency: 'INR',
    interval: 'month',
    features: [
      '50 image analyses per month',
      'Advanced crop stress detection',
      'Priority email support',
      'Basic recommendations',
      'Export reports',
      '7-day history'
    ],
    limits: {
      analysesPerMonth: 50,
      concurrentUploads: 2,
      storageDays: 7
    },
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 1499,
    currency: 'INR',
    interval: 'month',
    features: [
      'Unlimited image analyses',
      'Advanced AI recommendations',
      'Priority phone & email support',
      'Custom reports',
      'API access',
      '30-day history',
      'Team collaboration'
    ],
    limits: {
      analysesPerMonth: -1, // unlimited
      concurrentUploads: 5,
      storageDays: 30
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 4999,
    currency: 'INR',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics',
      'SLA guarantee',
      'Unlimited storage',
      'White-label options'
    ],
    limits: {
      analysesPerMonth: -1, // unlimited
      concurrentUploads: 10,
      storageDays: -1 // unlimited
    },
    popular: false
  }
]

export async function GET() {
  try {
    return NextResponse.json({
      plans: BUSINESS_PLANS,
      message: 'Business plans retrieved successfully.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve business plans.' },
      { status: 500 }
    )
  }
}