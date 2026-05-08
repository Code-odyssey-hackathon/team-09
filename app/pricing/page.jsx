'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../../components/TranslationContext'
import Link from 'next/link'

export default function PricingPage() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    // In a real app, this would redirect to payment processing
    // For now, we'll simulate subscription creation
    const userId = localStorage.getItem('userId') || 'demo-user'

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId })
      })

      const data = await response.json()
      if (response.ok) {
        alert(`Successfully subscribed to ${data.subscription.plan.name}!`)
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
                <span className="currency">{plan.currency}</span>
                <span className="amount">{plan.price}</span>
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
              {plan.price === 0 ? 'Get Started Free' : `Subscribe for ₹${plan.price}`}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>All plans include our core AI-powered crop stress analysis technology.</p>
        <p>Need a custom enterprise solution? <Link href="/contact">Contact us</Link></p>
      </div>
    </main>
  )
}