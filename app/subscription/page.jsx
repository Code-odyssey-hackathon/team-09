'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../../components/TranslationContext'
import Link from 'next/link'

export default function SubscriptionPage() {
  const { t, lang } = useTranslation()
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

  const localizePlanName = (planName = '') => {
    const value = String(planName).toLowerCase()
    if (value.includes('free')) {
      return lang === 'hi'
        ? 'मुफ्त योजना'
        : lang === 'kn'
        ? 'ಉಚಿತ ಯೋಜನೆ'
        : lang === 'ta'
        ? 'இலவச திட்டம்'
        : lang === 'te'
        ? 'ఉచిత ప్లాన్'
        : lang === 'es'
        ? 'Plan Gratuito'
        : lang === 'fr'
        ? 'Plan Gratuit'
        : 'Free Plan'
    }
    if (value.includes('starter')) {
      return lang === 'hi'
        ? 'शुरुआती योजना'
        : lang === 'kn'
        ? 'ಆರಂಭಿಕ ಯೋಜನೆ'
        : lang === 'ta'
        ? 'தொடக்க திட்டம்'
        : lang === 'te'
        ? 'స్టార్టర్ ప్లాన్'
        : lang === 'es'
        ? 'Plan Inicial'
        : lang === 'fr'
        ? 'Plan Débutant'
        : 'Starter Plan'
    }
    if (value.includes('professional')) {
      return lang === 'hi'
        ? 'पेशेवर योजना'
        : lang === 'kn'
        ? 'ವೃತ್ತಿಪರ ಯೋಜನೆ'
        : lang === 'ta'
        ? 'தொழில்முறை திட்டம்'
        : lang === 'te'
        ? 'ప్రొఫెషనల్ ప్లాన్'
        : lang === 'es'
        ? 'Plan Profesional'
        : lang === 'fr'
        ? 'Plan Professionnel'
        : 'Professional Plan'
    }
    return planName
  }

  const localizePlanFeature = (feature = '') => {
    const map = {
      free: {
        '5 image analyses per month': {
          hi: 'प्रति माह 5 छवि विश्लेषण',
          kn: 'ಪ್ರತಿ ತಿಂಗಳು 5 ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗಳು',
          ta: 'மாதத்திற்கு 5 பட பகுப்பாய்வு',
          te: 'నెలకు 5 చిత్ర విశ్లేషణలు',
          es: '5 análisis de imágenes por mes',
          fr: '5 analyses d images par mois',
        },
        'Basic crop stress detection': {
          hi: 'बुनियादी फसल तनाव पहचान',
          kn: 'ಮೂಲ ಬೆಳೆ ಒತ್ತಡ ಪತ್ತೆ',
          ta: 'அடிப்படை பயிர் அழுத்தம் கண்டறிதல்',
          te: 'ప్రాథమిక పంట ఒత్తిడి గుర్తింపు',
          es: 'Detección básica de estrés en cultivos',
          fr: 'Détection basique du stress des cultures',
        },
        'Email support': {
          hi: 'ईमेल समर्थन',
          kn: 'ಇಮೇಲ್ ಬೆಂಬಲ',
          ta: 'மின்னஞ்சல் ஆதரவு',
          te: 'ఈమెయిల్ మద్దతు',
          es: 'Soporte por correo',
          fr: 'Assistance par e-mail',
        },
        'Community access': {
          hi: 'सामुदायिक पहुंच',
          kn: 'ಸಮುದಾಯ ಪ್ರವೇಶ',
          ta: 'சமூக அணுகல்',
          te: 'సమాజ ప్రవేశం',
          es: 'Acceso a la comunidad',
          fr: 'Accès à la communauté',
        },
      },
    }

    for (const planMap of Object.values(map)) {
      if (planMap[feature]?.[lang]) return planMap[feature][lang]
    }

    const generic = {
      '50 image analyses per month': {
        hi: 'प्रति माह 50 छवि विश्लेषण',
        kn: 'ಪ್ರತಿ ತಿಂಗಳು 50 ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗಳು',
        ta: 'மாதத்திற்கு 50 பட பகுப்பாய்வு',
        te: 'నెలకు 50 చిత్ర విశ్లేషణలు',
        es: '50 análisis de imágenes por mes',
        fr: '50 analyses d images par mois',
      },
      'Advanced crop stress detection': {
        hi: 'उन्नत फसल तनाव पहचान',
        kn: 'ಮುಂದುವರಿದ ಬೆಳೆ ಒತ್ತಡ ಪತ್ತೆ',
        ta: 'மேம்பட்ட பயிர் அழுத்தம் கண்டறிதல்',
        te: 'అధునాతన పంట ఒత్తిడి గుర్తింపు',
        es: 'Detección avanzada de estrés en cultivos',
        fr: 'Détection avancée du stress des cultures',
      },
      'Priority email support': {
        hi: 'प्राथमिकता ईमेल समर्थन',
        kn: 'ಆದ್ಯತೆ ಇಮೇಲ್ ಬೆಂಬಲ',
        ta: 'முன்னுரிமை மின்னஞ்சல் ஆதரவு',
        te: 'ప్రాధాన్య ఈమెయిల్ మద్దతు',
        es: 'Soporte prioritario por correo',
        fr: 'Assistance prioritaire par e-mail',
      },
      'Basic recommendations': {
        hi: 'बुनियादी सिफारिशें',
        kn: 'ಮೂಲ ಶಿಫಾರಸುಗಳು',
        ta: 'அடிப்படை பரிந்துரைகள்',
        te: 'ప్రాథమిక సిఫారసులు',
        es: 'Recomendaciones básicas',
        fr: 'Recommandations basiques',
      },
      'Export reports': {
        hi: 'रिपोर्ट निर्यात करें',
        kn: 'ವರದಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ',
        ta: 'அறிக்கைகளை ஏற்றுமதி செய்யவும்',
        te: 'నివేదికలను ఎక్స్‌పోర్ట్ చేయండి',
        es: 'Exportar reportes',
        fr: 'Exporter les rapports',
      },
      '7-day history': {
        hi: '7 दिन का इतिहास',
        kn: '7 ದಿನಗಳ ಇತಿಹಾಸ',
        ta: '7 நாள் வரலாறு',
        te: '7 రోజుల చరిత్ర',
        es: 'Historial de 7 días',
        fr: 'Historique de 7 jours',
      },
      'Unlimited image analyses': {
        hi: 'असीमित छवि विश्लेषण',
        kn: 'ಅಸೀಮಿತ ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗಳು',
        ta: 'வரம்பற்ற பட பகுப்பாய்வு',
        te: 'అపరిమిత చిత్ర విశ్లేషణలు',
        es: 'Análisis de imágenes ilimitados',
        fr: 'Analyses d images illimitées',
      },
      'Priority support': {
        hi: 'प्राथमिकता समर्थन',
        kn: 'ಆದ್ಯತೆ ಬೆಂಬಲ',
        ta: 'முன்னுரிமை ஆதரவு',
        te: 'ప్రాధాన్య మద్దతు',
        es: 'Soporte prioritario',
        fr: 'Assistance prioritaire',
      },
      'Detailed recommendations': {
        hi: 'विस्तृत सिफारिशें',
        kn: 'ವಿವರವಾದ ಶಿಫಾರಸುಗಳು',
        ta: 'விரிவான பரிந்துரைகள்',
        te: 'వివరణాత్మక సిఫారసులు',
        es: 'Recomendaciones detalladas',
        fr: 'Recommandations détaillées',
      },
      '30-day history': {
        hi: '30 दिन का इतिहास',
        kn: '30 ದಿನಗಳ ಇತಿಹಾಸ',
        ta: '30 நாள் வரலாறு',
        te: '30 రోజుల చరిత్ర',
        es: 'Historial de 30 días',
        fr: 'Historique de 30 jours',
      },
      'API access': {
        hi: 'API पहुंच',
        kn: 'API ಪ್ರವೇಶ',
        ta: 'API அணுகல்',
        te: 'API ప్రవేశం',
        es: 'Acceso a la API',
        fr: 'Accès API',
      },
      'Bulk processing': {
        hi: 'बल्क प्रसंस्करण',
        kn: 'ಬಲ್ಕ್ ಪ್ರಕ್ರಿಯೆ',
        ta: 'மொத்த செயலாக்கம்',
        te: 'బల్క్ ప్రాసెసింగ్',
        es: 'Procesamiento en lote',
        fr: 'Traitement en masse',
      },
    }

    return generic[feature]?.[lang] || feature
  }

  const localizeStatus = (status = '') => {
    const normalized = String(status).toLowerCase()
    if (normalized === 'active') {
      return lang === 'hi'
        ? 'सक्रिय'
        : lang === 'kn'
        ? 'ಸಕ್ರಿಯ'
        : lang === 'ta'
        ? 'செயலில்'
        : lang === 'te'
        ? 'క్రియాశీలం'
        : lang === 'es'
        ? 'Activo'
        : lang === 'fr'
        ? 'Actif'
        : 'active'
    }
    if (normalized === 'cancelled') {
      return lang === 'hi'
        ? 'रद्द किया गया'
        : lang === 'kn'
        ? 'ರದ್ದು ಮಾಡಲಾಗಿದೆ'
        : lang === 'ta'
        ? 'ரத்து செய்யப்பட்டது'
        : lang === 'te'
        ? 'రద్దు చేయబడింది'
        : lang === 'es'
        ? 'Cancelado'
        : lang === 'fr'
        ? 'Annulé'
        : 'cancelled'
    }
    return status
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setError(lang === 'hi'
        ? 'सदस्यता विवरण देखने के लिए कृपया लॉगिन करें।'
        : lang === 'kn'
        ? 'ಸದಸ್ಯತ್ವ ವಿವರಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.'
        : lang === 'ta'
        ? 'சந்தா விவரங்களைப் பார்க்க தயவுசெய்து உள்நுழைக.'
        : lang === 'te'
        ? 'సభ్యత్వ వివరాలను చూడడానికి దయచేసి సైన్ ఇన్ చేయండి.'
        : lang === 'es'
        ? 'Por favor inicia sesión para ver los detalles de suscripción.'
        : lang === 'fr'
        ? 'Veuillez vous connecter pour voir les détails de l abonnement.'
        : 'Please login to view subscription details.')
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
      setError(lang === 'hi'
        ? 'सदस्यता डेटा लोड करने में विफल'
        : lang === 'kn'
        ? 'ಸದಸ್ಯತ್ವ ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ'
        : lang === 'ta'
        ? 'சந்தா தரவை ஏற்ற முடியவில்லை'
        : lang === 'te'
        ? 'సభ్యత్వ డేటా లోడ్ చేయడం విఫలమైంది'
        : lang === 'es'
        ? 'Error al cargar los datos de suscripción'
        : lang === 'fr'
        ? 'Impossible de charger les données d abonnement'
        : 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert(lang === 'hi'
        ? 'अपनी योजना अपग्रेड करने के लिए कृपया लॉगिन करें।'
        : lang === 'kn'
        ? 'ನಿಮ್ಮ ಯೋಜನೆಯನ್ನು ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.'
        : lang === 'ta'
        ? 'உங்கள் திட்டத்தை மேம்படுத்த தயவுசெய்து உள்நுழைக.'
        : lang === 'te'
        ? 'మీ ప్లాన్‌ను అప్‌గ్రేడ్ చేయడానికి దయచేసి సైన్ ఇన్ చేయండి.'
        : lang === 'es'
        ? 'Por favor inicia sesión para mejorar tu plan.'
        : lang === 'fr'
        ? 'Veuillez vous connecter pour mettre à niveau votre plan.'
        : 'Please login to upgrade your plan.')
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
        alert(`${t('subUpgradeSuccess')} ${localizePlanName(planName)}!`)
        fetchData() // Refresh data
      } else {
        alert(data.error || (lang === 'hi'
          ? 'अपग्रेड विफल'
          : lang === 'kn'
          ? 'ಅಪ್‌ಗ್ರೇಡ್ ವಿಫಲವಾಗಿದೆ'
          : lang === 'ta'
          ? 'மேம்படுத்தல் தோல்வியுற்றது'
          : lang === 'te'
          ? 'అప్‌గ్రేడ్ విఫలమైంది'
          : lang === 'es'
          ? 'La mejora falló'
          : lang === 'fr'
          ? 'La mise à niveau a échoué'
          : 'Upgrade failed'))
      }
    } catch (err) {
      alert(lang === 'hi'
        ? 'अपग्रेड विफल। कृपया पुनः प्रयास करें।'
        : lang === 'kn'
        ? 'ಅಪ್‌ಗ್ರೇಡ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
        : lang === 'ta'
        ? 'மேம்படுத்தல் தோல்வியுற்றது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
        : lang === 'te'
        ? 'అప్‌గ్రేడ్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
        : lang === 'es'
        ? 'La mejora falló. Inténtalo de nuevo.'
        : lang === 'fr'
        ? 'La mise à niveau a échoué. Veuillez réessayer.'
        : 'Upgrade failed. Please try again.')
    }
  }

  const handleCancel = async () => {
    if (!confirm(t('subCancelConfirm'))) {
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert(lang === 'hi'
        ? 'अपनी सदस्यता प्रबंधित करने के लिए कृपया लॉगिन करें।'
        : lang === 'kn'
        ? 'ನಿಮ್ಮ ಸದಸ್ಯತ್ವವನ್ನು ನಿರ್ವಹಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.'
        : lang === 'ta'
        ? 'உங்கள் சந்தாவை நிர்வகிக்க தயவுசெய்து உள்நுழைக.'
        : lang === 'te'
        ? 'మీ సభ్యత్వాన్ని నిర్వహించడానికి దయచేసి సైన్ ఇన్ చేయండి.'
        : lang === 'es'
        ? 'Por favor inicia sesión para gestionar tu suscripción.'
        : lang === 'fr'
        ? 'Veuillez vous connecter pour gérer votre abonnement.'
        : 'Please login to manage your subscription.')
      window.location.href = '/auth'
      return
    }

    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (response.ok) {
        alert(t('subCancelSuccess'))
        fetchData() // Refresh data
      } else {
        alert(data.error || (lang === 'hi'
          ? 'रद्दीकरण विफल'
          : lang === 'kn'
          ? 'ರದ್ದು ಮಾಡುವುದು ವಿಫಲವಾಗಿದೆ'
          : lang === 'ta'
          ? 'ரத்து தோல்வியுற்றது'
          : lang === 'te'
          ? 'రద్దు విఫలమైంది'
          : lang === 'es'
          ? 'La cancelación falló'
          : lang === 'fr'
          ? 'L annulation a échoué'
          : 'Cancellation failed'))
      }
    } catch (err) {
      alert(lang === 'hi'
        ? 'रद्दीकरण विफल। कृपया पुनः प्रयास करें।'
        : lang === 'kn'
        ? 'ರದ್ದು ಮಾಡುವುದು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
        : lang === 'ta'
        ? 'ரத்து தோல்வியுற்றது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
        : lang === 'te'
        ? 'రద్దు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
        : lang === 'es'
        ? 'La cancelación falló. Inténtalo de nuevo.'
        : lang === 'fr'
        ? 'L annulation a échoué. Veuillez réessayer.'
        : 'Cancellation failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="loading">{t('subLoadingDetails')}</div>
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
        <h1>{t('subManagement')}</h1>
        <p>{t('subMonitor')}</p>
      </div>

      {hasValidSubscription ? (
        <div className="subscription-details">
          <div className="current-plan-card">
            <h2>{t('subCurrentPlan')}</h2>
            <div className="plan-info">
              <h3>{localizePlanName(currentPlan.name)}</h3>
              <div className="plan-price">
                <span className="currency">{currencySymbol(currentPlan.currency)}</span>
                <span className="amount">{formatPrice(currentPlan.price, currentPlan.currency)}</span>
                <span className="interval">/{currentPlan.interval}</span>
              </div>
              <div className="plan-status">
                <span className={`status-badge ${subscription.status}`}>
                  {localizeStatus(subscription.status)}
                </span>
                {cancelAtPeriodEnd && currentPeriodEnd && (
                  <span className="cancel-notice">
                    {lang === 'hi'
                      ? `यह ${new Date(currentPeriodEnd).toLocaleDateString()} को रद्द हो जाएगा`
                      : lang === 'kn'
                      ? `${new Date(currentPeriodEnd).toLocaleDateString()} ರಂದು ರದ್ದಾಗುತ್ತದೆ`
                      : lang === 'ta'
                      ? `${new Date(currentPeriodEnd).toLocaleDateString()} அன்று ரத்து செய்யப்படும்`
                      : lang === 'te'
                      ? `${new Date(currentPeriodEnd).toLocaleDateString()} న రద్దు అవుతుంది`
                      : lang === 'es'
                      ? `Se cancelará el ${new Date(currentPeriodEnd).toLocaleDateString()}`
                      : lang === 'fr'
                      ? `S annulera le ${new Date(currentPeriodEnd).toLocaleDateString()}`
                      : `Will cancel on ${new Date(currentPeriodEnd).toLocaleDateString()}`}
                  </span>
                )}
              </div>
            </div>

            <div className="usage-section">
              <h4>{t('subUsageDetails')}</h4>
              <div className="usage-bar">
                <div
                  className="usage-fill"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                ></div>
              </div>
              <div className="usage-text">
                {analysesCount} / {currentPlan.limits.analysesPerMonth === -1 ? '∞' : currentPlan.limits.analysesPerMonth} {t('subUsageAnalyses')}
                ({usagePercent.toFixed(1)}%)
              </div>
            </div>

            <div className="plan-actions">
              {!cancelAtPeriodEnd && (
                <button className="btn btn-outline" onClick={handleCancel}>
                  {t('subCancelSub')}
                </button>
              )}
            </div>
          </div>

          <div className="upgrade-section">
            <h2>{t('subManagePlans')}</h2>
            <div className="plans-grid">
              {plans.filter(plan => plan.id !== currentPlan.id).map((plan) => (
                <div key={plan.id} className="plan-card upgrade-card">
                  <h3>{localizePlanName(plan.name)}</h3>
                  <div className="plan-price">
                    <span className="currency">{currencySymbol(plan.currency)}</span>
                    <span className="amount">{formatPrice(plan.price, plan.currency)}</span>
                    <span className="interval">/{t('pricingPerMonth')}</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{localizePlanFeature(feature)}</li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {t('subUpgradePlan')} {localizePlanName(plan.name)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-subscription">
          <h2>{t('subNoActive')}</h2>
          <p>
            {lang === 'hi'
              ? 'आप वर्तमान में सीमित सुविधाओं वाली मुफ्त योजना का उपयोग कर रहे हैं।'
              : lang === 'kn'
              ? 'ನೀವು ಪ್ರಸ್ತುತ ಸೀಮಿತ ವೈಶಿಷ್ಟ್ಯಗಳೊಂದಿಗೆ ಉಚಿತ ಯೋಜನೆಯನ್ನು ಬಳಸುತ್ತಿದ್ದೀರಿ.'
              : lang === 'ta'
              ? 'நீங்கள் தற்போது வரையறுக்கப்பட்ட அம்சங்களுடன் இலவச திட்டத்தைப் பயன்படுத்துகிறீர்கள்.'
              : lang === 'te'
              ? 'మీరు ప్రస్తుతం పరిమిత ఫీచర్లతో ఉచిత ప్లాన్‌ను ఉపయోగిస్తున్నారు.'
              : lang === 'es'
              ? 'Actualmente estás usando el plan gratuito con funciones limitadas.'
              : lang === 'fr'
              ? 'Vous utilisez actuellement le plan gratuit avec des fonctionnalités limitées.'
              : 'You are currently using the free plan with limited features.'}
          </p>
          <Link href="/pricing" className="btn btn-primary">
            {lang === 'hi'
              ? 'योजनाएँ देखें और सदस्यता लें'
              : lang === 'kn'
              ? 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಸದಸ್ಯರಾಗಿರಿ'
              : lang === 'ta'
              ? 'திட்டங்களைப் பார்க்கவும் மற்றும் சந்தா செய்யவும்'
              : lang === 'te'
              ? 'ప్లాన్లను చూడండి మరియు సభ్యత్వం పొందండి'
              : lang === 'es'
              ? 'Ver planes y suscribirse'
              : lang === 'fr'
              ? 'Voir les plans et s abonner'
              : 'View Plans & Subscribe'}
          </Link>
        </div>
      )}
    </main>
  )
}