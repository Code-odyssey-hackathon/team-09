'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Fallback plans matching the supabase-schema.sql seed data
const FALLBACK_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'INR',
    interval: 'month',
    popular: false,
    features: [
      '5 image analyses per month',
      'Basic crop stress detection',
      'Email support',
      'Community access',
    ],
    limits: { analysesPerMonth: 5, concurrentUploads: 1, storageDays: 30 },
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 49900,
    currency: 'INR',
    interval: 'month',
    popular: false,
    features: [
      '50 image analyses per month',
      'Advanced crop stress detection',
      'Priority email support',
      'Basic recommendations',
      'Export reports',
      '7-day history',
    ],
    limits: { analysesPerMonth: 50, concurrentUploads: 2, storageDays: 7 },
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 149900,
    currency: 'INR',
    interval: 'month',
    popular: true,
    features: [
      'Unlimited image analyses',
      'Advanced crop stress detection',
      'Priority support',
      'Detailed recommendations',
      'Export reports',
      '30-day history',
      'API access',
      'Bulk processing',
    ],
    limits: { analysesPerMonth: -1, concurrentUploads: 5, storageDays: 30 },
  },
]

const PLAN_ICONS = {
  free: '🌱',
  starter: '🌿',
  professional: '🌳',
}

export default function PricingPage() {
  const [plans, setPlans] = useState(FALLBACK_PLANS)
  const [loading, setLoading] = useState(false)
  const [subscribing, setSubscribing] = useState(null)

  const formatPrice = (pricePaisa, currency = 'INR') => {
    if (pricePaisa === 0) return '0'
    const value = Number(pricePaisa || 0) / 100
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const currencySymbol = (currency = 'INR') => {
    if (currency === 'INR') return '₹'
    if (currency === 'USD') return '$'
    return currency
  }

  // Attempt to load live plans from the API, silently fall back on failure
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans')
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data.plans) && data.plans.length > 0) {
          // Normalize JSONB arrays/objects that may come as strings from Supabase
          const normalized = data.plans.map((p) => ({
            ...p,
            features: Array.isArray(p.features)
              ? p.features
              : typeof p.features === 'string'
              ? JSON.parse(p.features)
              : [],
            limits:
              p.limits && typeof p.limits === 'object'
                ? p.limits
                : typeof p.limits === 'string'
                ? JSON.parse(p.limits)
                : {},
          }))
          setPlans(normalized)
        }
      } catch {
        // silently keep fallback plans
      }
    }
    fetchPlans()
  }, [])

  const handleSubscribe = async (planId) => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login before subscribing to a plan.')
      window.location.href = '/auth'
      return
    }

    setSubscribing(planId)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId }),
      })
      const data = await response.json()
      if (response.ok) {
        const planName = data.subscription?.plan?.name || 'selected plan'
        alert(`Successfully subscribed to ${planName}!`)
        window.location.href = '/app'
      } else {
        alert(data.error || 'Subscription failed')
      }
    } catch {
      alert('Subscription failed. Please try again.')
    } finally {
      setSubscribing(null)
    }
  }

  return (
    <main className="page-shell">
      {/* ── Header ── */}
      <div className="pricing-header">
        <span className="eyebrow">Pricing</span>
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your crop analysis needs</p>
      </div>

      {/* ── Plan cards ── */}
      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card${plan.popular ? ' popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">⭐ Most Popular</div>
            )}

            <div className="plan-icon">{PLAN_ICONS[plan.id] ?? '🌾'}</div>

            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                {plan.price === 0 ? (
                  <span className="price-free">Free</span>
                ) : (
                  <>
                    <span className="currency">{currencySymbol(plan.currency)}</span>
                    <span className="amount">{formatPrice(plan.price, plan.currency)}</span>
                    <span className="interval">/{plan.interval}</span>
                  </>
                )}
              </div>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="plan-limits">
              <div className="limit-item">
                <span className="limit-label">Analyses / month</span>
                <span className="limit-value">
                  {plan.limits.analysesPerMonth === -1
                    ? 'Unlimited'
                    : plan.limits.analysesPerMonth}
                </span>
              </div>
              <div className="limit-item">
                <span className="limit-label">Concurrent uploads</span>
                <span className="limit-value">{plan.limits.concurrentUploads}</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">History storage</span>
                <span className="limit-value">
                  {plan.limits.storageDays === -1
                    ? 'Unlimited'
                    : `${plan.limits.storageDays} days`}
                </span>
              </div>
            </div>

            <button
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} plan-cta`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing === plan.id}
            >
              {subscribing === plan.id
                ? 'Processing…'
                : plan.price === 0
                ? 'Get Started Free'
                : `Subscribe — ${currencySymbol(plan.currency)}${formatPrice(
                    plan.price,
                    plan.currency
                  )}`}
            </button>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="pricing-footer">
        <p>All plans include our core AI-powered crop stress analysis technology.</p>
        <p>
          Need help picking a plan?{' '}
          <Link href="/subscription" className="pricing-link">
            Manage subscriptions
          </Link>
        </p>
      </div>
    </main>
  )
}