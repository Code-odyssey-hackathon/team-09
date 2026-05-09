'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '../../components/TranslationContext'

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

const LOCALIZED_PLAN_NAMES = {
  en: {
    free: 'Free Plan',
    starter: 'Starter Plan',
    professional: 'Professional Plan',
  },
  hi: {
    free: 'मुफ्त योजना',
    starter: 'शुरुआती योजना',
    professional: 'पेशेवर योजना',
  },
  kn: {
    free: 'ಉಚಿತ ಯೋಜನೆ',
    starter: 'ಆರಂಭಿಕ ಯೋಜನೆ',
    professional: 'ವೃತ್ತಿಪರ ಯೋಜನೆ',
  },
  ta: {
    free: 'இலவச திட்டம்',
    starter: 'தொடக்க திட்டம்',
    professional: 'தொழில்முறை திட்டம்',
  },
  te: {
    free: 'ఉచిత ప్లాన్',
    starter: 'స్టార్టర్ ప్లాన్',
    professional: 'ప్రొఫెషనల్ ప్లాన్',
  },
  es: {
    free: 'Plan Gratuito',
    starter: 'Plan Inicial',
    professional: 'Plan Profesional',
  },
  fr: {
    free: 'Plan Gratuit',
    starter: 'Plan Débutant',
    professional: 'Plan Professionnel',
  },
}

const LOCALIZED_PLAN_FEATURES = {
  en: {
    '5 image analyses per month': '5 image analyses per month',
    'Basic crop stress detection': 'Basic crop stress detection',
    'Email support': 'Email support',
    'Community access': 'Community access',
    '50 image analyses per month': '50 image analyses per month',
    'Advanced crop stress detection': 'Advanced crop stress detection',
    'Priority email support': 'Priority email support',
    'Basic recommendations': 'Basic recommendations',
    'Export reports': 'Export reports',
    '7-day history': '7-day history',
    'Unlimited image analyses': 'Unlimited image analyses',
    'Priority support': 'Priority support',
    'Detailed recommendations': 'Detailed recommendations',
    '30-day history': '30-day history',
    'API access': 'API access',
    'Bulk processing': 'Bulk processing',
  },
  hi: {
    '5 image analyses per month': 'प्रति माह 5 छवि विश्लेषण',
    'Basic crop stress detection': 'बुनियादी फसल तनाव पहचान',
    'Email support': 'ईमेल समर्थन',
    'Community access': 'सामुदायिक पहुंच',
    '50 image analyses per month': 'प्रति माह 50 छवि विश्लेषण',
    'Advanced crop stress detection': 'उन्नत फसल तनाव पहचान',
    'Priority email support': 'प्राथमिकता ईमेल समर्थन',
    'Basic recommendations': 'बुनियादी सिफारिशें',
    'Export reports': 'रिपोर्ट निर्यात करें',
    '7-day history': '7 दिन का इतिहास',
    'Unlimited image analyses': 'असीमित छवि विश्लेषण',
    'Priority support': 'प्राथमिकता समर्थन',
    'Detailed recommendations': 'विस्तृत सिफारिशें',
    '30-day history': '30 दिन का इतिहास',
    'API access': 'API पहुंच',
    'Bulk processing': 'बल्क प्रसंस्करण',
  },
  kn: {
    '5 image analyses per month': 'ಪ್ರತಿ ತಿಂಗಳು 5 ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗಳು',
    'Basic crop stress detection': 'ಮೂಲ ಬೆಳೆ ಒತ್ತಡ ಪತ್ತೆ',
    'Email support': 'ಇಮೇಲ್ ಬೆಂಬಲ',
    'Community access': 'ಸಮುದಾಯ ಪ್ರವೇಶ',
    '50 image analyses per month': 'ಪ್ರತಿ ತಿಂಗಳು 50 ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗಳು',
    'Advanced crop stress detection': 'ಮುಂದುವರಿದ ಬೆಳೆ ಒತ್ತಡ ಪತ್ತೆ',
    'Priority email support': 'ಆದ್ಯತೆ ಇಮೇಲ್ ಬೆಂಬಲ',
    'Basic recommendations': 'ಮೂಲ ಶಿಫಾರಸುಗಳು',
    'Export reports': 'ವರದಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ',
    '7-day history': '7 ದಿನಗಳ ಇತಿಹಾಸ',
    'Unlimited image analyses': 'ಅಸೀಮಿತ ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗಳು',
    'Priority support': 'ಆದ್ಯತೆ ಬೆಂಬಲ',
    'Detailed recommendations': 'ವಿವರವಾದ ಶಿಫಾರಸುಗಳು',
    '30-day history': '30 ದಿನಗಳ ಇತಿಹಾಸ',
    'API access': 'API ಪ್ರವೇಶ',
    'Bulk processing': 'ಬಲ್ಕ್ ಪ್ರಕ್ರಿಯೆ',
  },
  ta: {
    '5 image analyses per month': 'மாதத்திற்கு 5 பட பகுப்பாய்வு',
    'Basic crop stress detection': 'அடிப்படை பயிர் அழுத்தம் கண்டறிதல்',
    'Email support': 'மின்னஞ்சல் ஆதரவு',
    'Community access': 'சமூக அணுகல்',
    '50 image analyses per month': 'மாதத்திற்கு 50 பட பகுப்பாய்வு',
    'Advanced crop stress detection': 'மேம்பட்ட பயிர் அழுத்தம் கண்டறிதல்',
    'Priority email support': 'முன்னுரிமை மின்னஞ்சல் ஆதரவு',
    'Basic recommendations': 'அடிப்படை பரிந்துரைகள்',
    'Export reports': 'அறிக்கைகளை ஏற்றுமதி செய்யவும்',
    '7-day history': '7 நாள் வரலாறு',
    'Unlimited image analyses': 'வரம்பற்ற பட பகுப்பாய்வு',
    'Priority support': 'முன்னுரிமை ஆதரவு',
    'Detailed recommendations': 'விரிவான பரிந்துரைகள்',
    '30-day history': '30 நாள் வரலாறு',
    'API access': 'API அணுகல்',
    'Bulk processing': 'மொத்த செயலாக்கம்',
  },
  te: {
    '5 image analyses per month': 'నెలకు 5 చిత్ర విశ్లేషణలు',
    'Basic crop stress detection': 'ప్రాథమిక పంట ఒత్తిడి గుర్తింపు',
    'Email support': 'ఈమెయిల్ మద్దతు',
    'Community access': 'సమాజ ప్రవేశం',
    '50 image analyses per month': 'నెలకు 50 చిత్ర విశ్లేషణలు',
    'Advanced crop stress detection': 'అధునాతన పంట ఒత్తిడి గుర్తింపు',
    'Priority email support': 'ప్రాధాన్య ఈమెయిల్ మద్దతు',
    'Basic recommendations': 'ప్రాథమిక సిఫారసులు',
    'Export reports': 'నివేదికలను ఎక్స్‌పోర్ట్ చేయండి',
    '7-day history': '7 రోజుల చరిత్ర',
    'Unlimited image analyses': 'అపరిమిత చిత్ర విశ్లేషణలు',
    'Priority support': 'ప్రాధాన్య మద్దతు',
    'Detailed recommendations': 'వివరణాత్మక సిఫారసులు',
    '30-day history': '30 రోజుల చరిత్ర',
    'API access': 'API ప్రవేశం',
    'Bulk processing': 'బల్క్ ప్రాసెసింగ్',
  },
  es: {
    '5 image analyses per month': '5 análisis de imágenes por mes',
    'Basic crop stress detection': 'Detección básica de estrés en cultivos',
    'Email support': 'Soporte por correo',
    'Community access': 'Acceso a la comunidad',
    '50 image analyses per month': '50 análisis de imágenes por mes',
    'Advanced crop stress detection': 'Detección avanzada de estrés en cultivos',
    'Priority email support': 'Soporte prioritario por correo',
    'Basic recommendations': 'Recomendaciones básicas',
    'Export reports': 'Exportar reportes',
    '7-day history': 'Historial de 7 días',
    'Unlimited image analyses': 'Análisis de imágenes ilimitados',
    'Priority support': 'Soporte prioritario',
    'Detailed recommendations': 'Recomendaciones detalladas',
    '30-day history': 'Historial de 30 días',
    'API access': 'Acceso a la API',
    'Bulk processing': 'Procesamiento en lote',
  },
  fr: {
    '5 image analyses per month': '5 analyses d images par mois',
    'Basic crop stress detection': 'Détection basique du stress des cultures',
    'Email support': 'Assistance par e-mail',
    'Community access': 'Accès à la communauté',
    '50 image analyses per month': '50 analyses d images par mois',
    'Advanced crop stress detection': 'Détection avancée du stress des cultures',
    'Priority email support': 'Assistance prioritaire par e-mail',
    'Basic recommendations': 'Recommandations basiques',
    'Export reports': 'Exporter les rapports',
    '7-day history': 'Historique de 7 jours',
    'Unlimited image analyses': 'Analyses d images illimitées',
    'Priority support': 'Assistance prioritaire',
    'Detailed recommendations': 'Recommandations détaillées',
    '30-day history': 'Historique de 30 jours',
    'API access': 'Accès API',
    'Bulk processing': 'Traitement en masse',
  },
}

function localizePlanName(planId, lang) {
  return LOCALIZED_PLAN_NAMES[lang]?.[planId] || LOCALIZED_PLAN_NAMES.en[planId] || planId
}

function localizePlanFeature(feature, lang) {
  return LOCALIZED_PLAN_FEATURES[lang]?.[feature] || feature
}

export default function PricingPage() {
  const { t, lang } = useTranslation()
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
      alert(t('pricingLoginRequired'))
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
        alert(`${t('pricingSuccess')} ${planName}!`)
        window.location.href = '/app'
      } else {
        alert(data.error || t('pricingError'))
      }
    } catch {
      alert(t('pricingError'))
    } finally {
      setSubscribing(null)
    }
  }

  return (
    <main className="page-shell">
      {/* ── Header ── */}
      <div className="pricing-header">
        <span className="eyebrow">{t('pricingEyebrow')}</span>
        <h1>{t('pricingH1')}</h1>
        <p>{t('pricingDesc')}</p>
      </div>

      {/* ── Plan cards ── */}
      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card${plan.popular ? ' popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">⭐ {t('pricingMostPopular')}</div>
            )}

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
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <span className="feature-check">✓</span>
                  {localizePlanFeature(feature, lang)}
                </li>
              ))}
            </ul>

            <div className="plan-limits">
              <div className="limit-item">
                <span className="limit-label">{t('pricingAnalysesPerMonth')}</span>
                <span className="limit-value">
                  {plan.limits.analysesPerMonth === -1
                    ? t('pricingUnlimited')
                    : plan.limits.analysesPerMonth}
                </span>
              </div>
              <div className="limit-item">
                <span className="limit-label">
                  {lang === 'hi'
                    ? 'समवर्ती अपलोड'
                    : lang === 'kn'
                    ? 'ಸಮಕಾಲಿಕ ಅಪ್‌ಲೋಡ್‌ಗಳು'
                    : lang === 'ta'
                    ? 'ஒரே நேர பதிவேற்றங்கள்'
                    : lang === 'te'
                    ? 'సమకాలిక అప్‌లోడ్‌లు'
                    : lang === 'es'
                    ? 'Cargas simultáneas'
                    : lang === 'fr'
                    ? 'Téléversements simultanés'
                    : 'Concurrent uploads'}
                </span>
                <span className="limit-value">{plan.limits.concurrentUploads}</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">
                  {lang === 'hi'
                    ? 'भंडारण इतिहास'
                    : lang === 'kn'
                    ? 'ಇತಿಹಾಸ ಸಂಗ್ರಹಣೆ'
                    : lang === 'ta'
                    ? 'வரலாறு சேமிப்பு'
                    : lang === 'te'
                    ? 'చరిత్ర నిల్వ'
                    : lang === 'es'
                    ? 'Historial de almacenamiento'
                    : lang === 'fr'
                    ? 'Historique de stockage'
                    : 'History storage'}
                </span>
                <span className="limit-value">
                  {plan.limits.storageDays === -1
                    ? t('pricingUnlimited')
                    : `${plan.limits.storageDays} ${
                        lang === 'hi'
                          ? 'दिन'
                          : lang === 'kn'
                          ? 'ದಿನಗಳು'
                          : lang === 'ta'
                          ? 'நாட்கள்'
                          : lang === 'te'
                          ? 'రోజులు'
                          : lang === 'es'
                          ? 'días'
                          : lang === 'fr'
                          ? 'jours'
                          : 'days'
                      }`}
                </span>
              </div>
            </div>

            <button
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} plan-cta`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing === plan.id}
            >
              {subscribing === plan.id
                ? `${t('pricingCTA')}…`
                : plan.price === 0
                ? t('pricingCTA')
                : `${t('pricingCTA')} — ${currencySymbol(plan.currency)}${formatPrice(
                    plan.price,
                    plan.currency
                  )}`}
            </button>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="pricing-footer">
        <p>
          {lang === 'hi'
            ? 'हमारी मुख्य AI-आधारित फसल तनाव विश्लेषण तकनीक सभी योजनाओं में शामिल है।'
            : lang === 'kn'
            ? 'ನಮ್ಮ ಮುಖ್ಯ AI ಆಧಾರಿತ ಬೆಳೆ ಒತ್ತಡ ವಿಶ್ಲೇಷಣಾ ತಂತ್ರಜ್ಞಾನ ಎಲ್ಲ ಯೋಜನೆಗಳಲ್ಲಿ ಸೇರಿದೆ.'
            : lang === 'ta'
            ? 'எங்கள் முக்கிய AI இயக்கப்படும் பயிர் அழுத்த பகுப்பாய்வு தொழில்நுட்பம் அனைத்து திட்டங்களிலும் உள்ளது.'
            : lang === 'te'
            ? 'మా ప్రధాన AI-ఆధారిత పంట ఒత్తిడి విశ్లేషణ సాంకేతికత అన్ని ప్లాన్లలో ఉంది.'
            : lang === 'es'
            ? 'Nuestra tecnología principal de análisis de estrés de cultivos con IA está incluida en todos los planes.'
            : lang === 'fr'
            ? 'Notre technologie principale d analyse du stress des cultures alimentée par l IA est incluse dans tous les plans.'
            : 'All plans include our core AI-powered crop stress analysis technology.'}
        </p>
        <p>
          {lang === 'hi'
            ? 'क्या योजना चुनने में मदद चाहिए?'
            : lang === 'kn'
            ? 'ಯೋಜನೆ ಆಯ್ಕೆ ಮಾಡಲು ಸಹಾಯ ಬೇಕೆ?'
            : lang === 'ta'
            ? 'திட்டத்தைத் தேர்ந்தெடுக்க உதவி வேண்டுமா?'
            : lang === 'te'
            ? 'ప్లాన్ ఎంచుకోవడంలో సహాయం కావాలా?'
            : lang === 'es'
            ? '¿Necesitas ayuda para elegir un plan?'
            : lang === 'fr'
            ? 'Besoin d aide pour choisir un plan ?'
            : 'Need help picking a plan?'}{' '}
          <Link href="/subscription" className="pricing-link">
            {t('subManagePlans')}
          </Link>
        </p>
      </div>
    </main>
  )
}