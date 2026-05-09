'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '../../components/TranslationContext'

const FALLBACK_PLANS = [
  {
    id: 'free', name: 'Free Plan', price: 0, currency: 'INR', interval: 'month', popular: false,
    features: ['5 image analyses per month', 'Basic crop stress detection', 'Email support', 'Community access'],
    limits: { analysesPerMonth: 5, concurrentUploads: 1, storageDays: 30 },
  },
  {
    id: 'starter', name: 'Starter Plan', price: 49900, currency: 'INR', interval: 'month', popular: false,
    features: ['50 image analyses per month', 'Advanced crop stress detection', 'Priority email support', 'Basic recommendations', 'Export reports', '7-day history'],
    limits: { analysesPerMonth: 50, concurrentUploads: 2, storageDays: 7 },
  },
  {
    id: 'professional', name: 'Professional Plan', price: 149900, currency: 'INR', interval: 'month', popular: true,
    features: ['Unlimited image analyses', 'Advanced crop stress detection', 'Priority support', 'Detailed recommendations', 'Export reports', '30-day history', 'API access', 'Bulk processing'],
    limits: { analysesPerMonth: -1, concurrentUploads: 5, storageDays: 30 },
  },
]

const PLAN_ICONS = { free: '🌱', starter: '🌿', professional: '🌳' }

const PLAN_NAMES = {
  en: { free: 'Free Plan', starter: 'Starter Plan', professional: 'Professional Plan' },
  hi: { free: 'मुफ्त योजना', starter: 'शुरुआती योजना', professional: 'पेशेवर योजना' },
  kn: { free: 'ಉಚಿತ ಯೋಜನೆ', starter: 'ಆರಂಭಿಕ ಯೋಜನೆ', professional: 'ವೃತ್ತಿಪರ ಯೋಜನೆ' },
  ta: { free: 'இலவச திட்டம்', starter: 'தொடக்க திட்டம்', professional: 'தொழில்முறை திட்டம்' },
  te: { free: 'ఉచిత ప్లాన్', starter: 'స్టార్టర్ ప్లాన్', professional: 'ప్రొఫెషనల్ ప్లాన్' },
  es: { free: 'Plan Gratuito', starter: 'Plan Inicial', professional: 'Plan Profesional' },
  fr: { free: 'Plan Gratuit', starter: 'Plan Débutant', professional: 'Plan Professionnel' },
}

const FEATURE_MAP = {
  en: {
    '5 image analyses per month': '5 analyses/month', 'Basic crop stress detection': 'Basic stress detection',
    'Email support': 'Email support', 'Community access': 'Community access',
    '50 image analyses per month': '50 analyses/month', 'Advanced crop stress detection': 'Advanced stress detection',
    'Priority email support': 'Priority email support', 'Basic recommendations': 'Basic recommendations',
    'Export reports': 'Export reports', '7-day history': '7-day history',
    'Unlimited image analyses': 'Unlimited analyses', 'Priority support': 'Priority support',
    'Detailed recommendations': 'Detailed recommendations', '30-day history': '30-day history',
    'API access': 'API access', 'Bulk processing': 'Bulk processing',
  },
  hi: {
    '5 image analyses per month': '5 विश्लेषण/माह', 'Basic crop stress detection': 'बुनियादी पहचान',
    'Email support': 'ईमेल सहायता', 'Community access': 'समुदाय पहुंच',
    '50 image analyses per month': '50 विश्लेषण/माह', 'Advanced crop stress detection': 'उन्नत पहचान',
    'Priority email support': 'प्राथमिकता ईमेल', 'Basic recommendations': 'बुनियादी सिफारिशें',
    'Export reports': 'रिपोर्ट निर्यात', '7-day history': '7-दिन का इतिहास',
    'Unlimited image analyses': 'असीमित विश्लेषण', 'Priority support': 'प्राथमिकता सहायता',
    'Detailed recommendations': 'विस्तृत सिफारिशें', '30-day history': '30-दिन का इतिहास',
    'API access': 'API पहुंच', 'Bulk processing': 'बल्क प्रसंस्करण',
  },
  es: {
    '5 image analyses per month': '5 análisis/mes', 'Basic crop stress detection': 'Detección básica',
    'Email support': 'Soporte por email', 'Community access': 'Acceso comunidad',
    '50 image analyses per month': '50 análisis/mes', 'Advanced crop stress detection': 'Detección avanzada',
    'Priority email support': 'Email prioritario', 'Basic recommendations': 'Recomendaciones básicas',
    'Export reports': 'Exportar reportes', '7-day history': 'Historial 7 días',
    'Unlimited image analyses': 'Análisis ilimitados', 'Priority support': 'Soporte prioritario',
    'Detailed recommendations': 'Recomendaciones detalladas', '30-day history': 'Historial 30 días',
    'API access': 'Acceso API', 'Bulk processing': 'Procesamiento masivo',
  },
  fr: {
    '5 image analyses per month': '5 analyses/mois', 'Basic crop stress detection': 'Détection basique',
    'Email support': 'Support par email', 'Community access': 'Accès communauté',
    '50 image analyses per month': '50 analyses/mois', 'Advanced crop stress detection': 'Détection avancée',
    'Priority email support': 'Email prioritaire', 'Basic recommendations': 'Recommandations basiques',
    'Export reports': 'Exporter rapports', '7-day history': 'Historique 7 jours',
    'Unlimited image analyses': 'Analyses illimitées', 'Priority support': 'Support prioritaire',
    'Detailed recommendations': 'Recommandations détaillées', '30-day history': 'Historique 30 jours',
    'API access': 'Accès API', 'Bulk processing': 'Traitement en masse',
  },
}

function localizePlanName(id, lang) {
  return PLAN_NAMES[lang]?.[id] ?? PLAN_NAMES.en[id] ?? id
}
function localizePlanFeature(feature, lang) {
  return FEATURE_MAP[lang]?.[feature] ?? FEATURE_MAP.en[feature] ?? feature
}
function currencySymbol(c) { return c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c }
function formatPrice(p, c) { return c === 'INR' ? (p / 100).toFixed(0) : (p / 100).toFixed(2) }

export default function PricingPage() {
  const { t, lang } = useTranslation()
  const [plans, setPlans]           = useState(FALLBACK_PLANS)
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage]           = useState(null)
  const [subscribing, setSubscribing] = useState(null)
  const [subLoading, setSubLoading] = useState(true)

  // Load plans
  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(d => { if (d.plans?.length) setPlans(d.plans) }).catch(() => {})
  }, [])

  // Load current subscription + usage
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) { setSubLoading(false); return }
    Promise.all([
      fetch(`/api/subscriptions?userId=${userId}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/usage?userId=${userId}`).then(r => r.json()).catch(() => ({})),
    ]).then(([subData, usageData]) => {
      setSubscription(subData.subscription || null)
      setUsage(usageData.usage || usageData || null)
    }).finally(() => setSubLoading(false))
  }, [])

  async function handleSubscribe(planId) {
    const userId = localStorage.getItem('userId')
    if (!userId) { alert(t('pricingLoginRequired')); return }
    setSubscribing(planId)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(`${t('pricingSuccess')} ${localizePlanName(planId, lang)}!`)
        window.location.reload()
      } else {
        alert(data.error || t('pricingError'))
      }
    } catch { alert(t('pricingError')) }
    finally { setSubscribing(null) }
  }

  async function handleCancel() {
    if (!confirm(t('subCancelConfirm'))) return
    const userId = localStorage.getItem('userId')
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) { alert(t('subCancelSuccess')); window.location.reload() }
      else alert('Cancellation failed. Please try again.')
    } catch { alert('Cancellation failed. Please try again.') }
  }

  const currentPlan      = subscription?.plan || subscription?.subscription_plans
  const analysesCount    = usage?.analysesCount ?? usage?.analyses_count ?? 0
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd || subscription?.status === 'cancelled'
  const currentPeriodEnd = subscription?.currentPeriodEnd || subscription?.current_period_end
  const hasActiveSub     = Boolean(subscription && currentPlan)
  const usagePercent     = hasActiveSub
    ? (currentPlan.limits.analysesPerMonth === -1 ? 0 : (analysesCount / currentPlan.limits.analysesPerMonth) * 100)
    : 0

  return (
    <main className="page-shell">

      {/* ── Header ── */}
      <div className="pricing-header">
        <span className="eyebrow">{t('pricingEyebrow')}</span>
        <h1>{t('pricingH1')}</h1>
        <p>{t('pricingDesc')}</p>
      </div>

      {/* ── Current plan banner (logged-in users) ── */}
      {!subLoading && hasActiveSub && (
        <div className="current-plan-banner">
          <div className="cpb-left">
            <span className="cpb-icon">{PLAN_ICONS[currentPlan.id ?? 'free']}</span>
            <div>
              <p className="cpb-label">{t('subCurrentPlan')}</p>
              <h2 className="cpb-name">{localizePlanName(currentPlan.id ?? currentPlan.name, lang)}</h2>
            </div>
          </div>

          <div className="cpb-usage">
            <p className="cpb-label">{t('subUsageDetails')}</p>
            <div className="usage-bar">
              <div className="usage-fill" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
            <p className="usage-text">
              {analysesCount} / {currentPlan.limits.analysesPerMonth === -1 ? '∞' : currentPlan.limits.analysesPerMonth} {t('subUsageAnalyses')}
            </p>
          </div>

          <div className="cpb-actions">
            {cancelAtPeriodEnd && currentPeriodEnd && (
              <span className="cancel-notice">
                {`Cancels ${new Date(currentPeriodEnd).toLocaleDateString()}`}
              </span>
            )}
            {!cancelAtPeriodEnd && (
              <button className="btn btn-outline btn-sm" onClick={handleCancel}>
                {t('subCancelSub')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="pricing-grid">
        {plans.map((plan) => {
          const isActive = hasActiveSub && (currentPlan?.id === plan.id || currentPlan?.name === plan.name)
          return (
            <div key={plan.id} className={`pricing-card${plan.popular ? ' popular' : ''}${isActive ? ' active-plan' : ''}`}>
              {plan.popular && <div className="popular-badge">⭐ {t('pricingMostPopular')}</div>}
              {isActive && <div className="active-badge">✓ {lang === 'hi' ? 'वर्तमान योजना' : lang === 'es' ? 'Plan actual' : lang === 'fr' ? 'Plan actuel' : 'Current Plan'}</div>}

              <div className="plan-icon">{PLAN_ICONS[plan.id] ?? '🌾'}</div>

              <div className="plan-header">
                <h3>{localizePlanName(plan.id, lang)}</h3>
                <div className="plan-price">
                  {plan.price === 0 ? (
                    <span className="price-free">{t('pricingFreePlan')}</span>
                  ) : (
                    <>
                      <span className="currency">{currencySymbol(plan.currency)}</span>
                      <span className="amount">{formatPrice(plan.price, plan.currency)}</span>
                      <span className="interval">/{t('pricingPerMonth')}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}><span className="feature-check">✓</span>{localizePlanFeature(f, lang)}</li>
                ))}
              </ul>

              <div className="plan-limits">
                <div className="limit-item">
                  <span className="limit-label">{t('pricingAnalysesPerMonth')}</span>
                  <span className="limit-value">
                    {plan.limits.analysesPerMonth === -1 ? t('pricingUnlimited') : plan.limits.analysesPerMonth}
                  </span>
                </div>
              </div>

              <button
                className={`btn ${isActive ? 'btn-ghost' : plan.popular ? 'btn-primary' : 'btn-outline'} plan-cta`}
                onClick={() => !isActive && handleSubscribe(plan.id)}
                disabled={subscribing === plan.id || isActive}
              >
                {isActive
                  ? (lang === 'hi' ? 'सक्रिय' : lang === 'es' ? 'Activo' : lang === 'fr' ? 'Actif' : 'Active')
                  : subscribing === plan.id
                  ? `${t('pricingCTA')}…`
                  : plan.price === 0
                  ? t('pricingCTA')
                  : `${t('pricingCTA')} — ${currencySymbol(plan.currency)}${formatPrice(plan.price, plan.currency)}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Footer note ── */}
      <div className="pricing-footer">
        <p>
          {lang === 'hi' ? 'सभी योजनाओं में हमारी मुख्य AI फसल विश्लेषण तकनीक शामिल है।'
            : lang === 'es' ? 'Todos los planes incluyen nuestra tecnología principal de análisis IA.'
            : lang === 'fr' ? 'Tous les plans incluent notre technologie principale d\'analyse IA.'
            : 'All plans include our core AI-powered crop stress analysis technology.'}
        </p>
        <Link href="/app" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
          {lang === 'hi' ? 'डैशबोर्ड पर जाएं' : lang === 'es' ? 'Ir al Dashboard' : lang === 'fr' ? 'Aller au Dashboard' : 'Go to Dashboard'}
        </Link>
      </div>
    </main>
  )
}