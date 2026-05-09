'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../../components/TranslationContext'
import Link from 'next/link'

export default function SubscriptionPage() {
  const { t } = useTranslation()
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
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
    fetchData()
  }, [])

  const fetchData = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setError('Please login to view subscription details.')
      setLoading(false)
      return
    }

    try {
      // Fetch subscription
      const subResponse = await fetch(`/api/subscriptions?userId=${userId}`)
      const subData = await subResponse.json()
      setSubscription(subData.subscription)

      // Fetch usage
      const usageResponse = await fetch(`/api/usage?userId=${userId}`)
      const usageData = await usageResponse.json()
      setUsage(usageData.usage)

      // Fetch plans
      const plansResponse = await fetch('/api/plans')
      const plansData = await plansResponse.json()
      setPlans(plansData.plans)
    } catch (err) {
      setError('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login to upgrade your plan.')
      window.location.href = '/auth'
      return
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId })
      })

      const data = await response.json()
      if (response.ok) {
        const planName = data.subscription?.plan?.name || 'selected plan'
        alert(`Successfully upgraded to ${planName}!`)
        fetchData() // Refresh data
      } else {
        alert(data.error || 'Upgrade failed')
      }
    } catch (err) {
      alert('Upgrade failed. Please try again.')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login to manage your subscription.')
      window.location.href = '/auth'
      return
    }

    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (response.ok) {
        alert('Subscription cancelled successfully.')
        fetchData() // Refresh data
      } else {
        alert(data.error || 'Cancellation failed')
      }
    } catch (err) {
      alert('Cancellation failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="loading">Loading subscription details...</div>
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

  const currentPlan = subscription?.plan || subscription?.subscription_plans
  const analysesCount = usage?.analysesCount ?? usage?.analyses_count ?? 0
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd || subscription?.status === 'cancelled'
  const currentPeriodEnd = subscription?.currentPeriodEnd || subscription?.current_period_end
  const hasValidSubscription = Boolean(subscription && currentPlan)
  const usagePercent = usage && currentPlan ?
    (currentPlan.limits.analysesPerMonth === -1 ? 0 : (analysesCount / currentPlan.limits.analysesPerMonth) * 100) : 0

  return (
    <main className="page-shell">
      <div className="subscription-header">
        <h1>Subscription Management</h1>
        <p>Manage your plan and monitor your usage</p>
      </div>

      {hasValidSubscription ? (
        <div className="subscription-details">
          <div className="current-plan-card">
            <h2>Current Plan</h2>
            <div className="plan-info">
              <h3>{currentPlan.name}</h3>
              <div className="plan-price">
                <span className="currency">{currencySymbol(currentPlan.currency)}</span>
                <span className="amount">{formatPrice(currentPlan.price, currentPlan.currency)}</span>
                <span className="interval">/{currentPlan.interval}</span>
              </div>
              <div className="plan-status">
                <span className={`status-badge ${subscription.status}`}>
                  {subscription.status}
                </span>
                {cancelAtPeriodEnd && currentPeriodEnd && (
                  <span className="cancel-notice">
                    Will cancel on {new Date(currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="usage-section">
              <h4>Monthly Usage</h4>
              <div className="usage-bar">
                <div
                  className="usage-fill"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                ></div>
              </div>
              <div className="usage-text">
                {analysesCount} / {currentPlan.limits.analysesPerMonth === -1 ? '∞' : currentPlan.limits.analysesPerMonth} analyses
                ({usagePercent.toFixed(1)}%)
              </div>
            </div>

            <div className="plan-actions">
              {!cancelAtPeriodEnd && (
                <button className="btn btn-outline" onClick={handleCancel}>
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          <div className="upgrade-section">
            <h2>Available Plans</h2>
            <div className="plans-grid">
              {plans.filter(plan => plan.id !== currentPlan.id).map((plan) => (
                <div key={plan.id} className="plan-card upgrade-card">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">{currencySymbol(plan.currency)}</span>
                    <span className="amount">{formatPrice(plan.price, plan.currency)}</span>
                    <span className="interval">/{plan.interval}</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    Upgrade to {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-subscription">
          <h2>No Active Subscription</h2>
          <p>You are currently using the free plan with limited features.</p>
          <Link href="/pricing" className="btn btn-primary">
            View Plans & Subscribe
          </Link>
        </div>
      )}
    </main>
  )
}