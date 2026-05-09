'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../../components/TranslationContext'
import Link from 'next/link'

export default function PricingPage() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      const data = await response.json()
      if (data.plans) {
        setPlans(data.plans)
      }
    } catch (err) {
      setError('Failed to load pricing plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId) => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login before subscribing to a plan.')
      window.location.href = '/auth'
      return
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId })
      })

      const data = await response.json()
      if (response.ok) {
        const planName = data.subscription?.plan?.name || 'selected plan'
        alert(`Successfully subscribed to ${planName}!`)
        // Redirect to dashboard or app
        window.location.href = '/app'
      } else {
        alert(data.error || 'Subscription failed')
      }
    } catch (err) {
      alert('Subscription failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="loading">Loading pricing plans...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page-shell">
        <div className="error">{error}</div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your crop analysis needs</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}

            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="currency">{currencySymbol(plan.currency)}</span>
                <span className="amount">{formatPrice(plan.price, plan.currency)}</span>
                <span className="interval">/{plan.interval}</span>
              </div>
            </div>

            <div className="plan-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="plan-limits">
              <div className="limit-item">
                <span className="limit-label">Analyses per month:</span>
                <span className="limit-value">
                  {plan.limits.analysesPerMonth === -1 ? 'Unlimited' : plan.limits.analysesPerMonth}
                </span>
              </div>
              <div className="limit-item">
                <span className="limit-label">Concurrent uploads:</span>
                <span className="limit-value">{plan.limits.concurrentUploads}</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">History storage:</span>
                <span className="limit-value">
                  {plan.limits.storageDays === -1 ? 'Unlimited' : `${plan.limits.storageDays} days`}
                </span>
              </div>
            </div>

            <button
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSubscribe(plan.id)}
            >
              {plan.price === 0
                ? 'Get Started Free'
                : `Subscribe for ${currencySymbol(plan.currency)}${formatPrice(plan.price, plan.currency)}`}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>All plans include our core AI-powered crop stress analysis technology.</p>
        <p>Need help picking a plan? <Link href="/subscription">Manage subscriptions</Link></p>
      </div>
    </main>
  )
}