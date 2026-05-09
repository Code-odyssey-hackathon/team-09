'use client'

import Link from 'next/link'
import { jsPDF } from 'jspdf'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation, TRANSLATIONS } from '../../components/TranslationContext'

const STAGE_KEYS = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting']

const DEFAULT_PROFILE = {
  crop: '',
  stage: 'Seedling',
  irrigation: '',
  notes: '',
}

const BASE_RECOMMENDATIONS = {
  'Healthy': 'Maintain current irrigation schedule. Monitor weekly for early changes. Keep leaves dry overnight.',
  'Drought Stress': 'Check soil moisture at root depth. Irrigate early morning or late evening. Add mulch to reduce evaporation.',
  'Nutrient Deficiency': 'Run a soil or leaf test. Apply balanced fertilizer after testing. Inspect for uneven growth patterns.',
  'Pest Attack': 'Inspect underside of leaves. Remove heavily infested foliage. Consider targeted bio-control.',
  'Fungal Disease': 'Remove infected leaves safely. Improve airflow between plants. Apply approved fungicide if needed.',
}

const LOCALIZED_REPORT_TEXT = {
  hi: {
    stress: {
      'Healthy': 'स्वस्थ',
      'Drought Stress': 'सूखा तनाव',
      'Nutrient Deficiency': 'पोषक तत्वों की कमी',
      'Pest Attack': 'कीट प्रकोप',
      'Fungal Disease': 'फफूंद रोग',
    },
    recommendations: {
      'Healthy': 'वर्तमान सिंचाई कार्यक्रम बनाए रखें। शुरुआती बदलावों के लिए साप्ताहिक निगरानी करें। रात में पत्तियों को सूखा रखें।',
      'Drought Stress': 'जड़ क्षेत्र की मिट्टी की नमी जांचें। सुबह जल्दी या शाम को सिंचाई करें। वाष्पीकरण कम करने के लिए मल्च डालें।',
      'Nutrient Deficiency': 'मिट्टी या पत्ती परीक्षण कराएं। परीक्षण के बाद संतुलित उर्वरक दें। असमान वृद्धि पैटर्न जांचें।',
      'Pest Attack': 'पत्तियों के नीचे की सतह जांचें। अधिक प्रभावित पत्तियां हटाएं। लक्षित जैव-नियंत्रण पर विचार करें।',
      'Fungal Disease': 'संक्रमित पत्तियां सुरक्षित रूप से हटाएं। पौधों के बीच वायु प्रवाह बढ़ाएं। जरूरत होने पर अनुमोदित फफूंदनाशी का उपयोग करें।',
    },
    noAlert: 'आपके क्षेत्र में कोई अत्यधिक मौसम स्थिति नहीं मिली।',
  },
  kn: {
    stress: {
      'Healthy': 'ಆರೋಗ್ಯಕರ',
      'Drought Stress': 'ಬರ ಒತ್ತಡ',
      'Nutrient Deficiency': 'ಪೋಷಕಾಂಶ ಕೊರತೆ',
      'Pest Attack': 'ಕೀಟ ದಾಳಿ',
      'Fungal Disease': 'ಹುಳುಬುರುಡೆ ರೋಗ',
    },
    recommendations: {
      'Healthy': 'ಪ್ರಸ್ತುತ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಮುಂದುವರಿಸಿ. ಆರಂಭಿಕ ಬದಲಾವಣೆಗಳಿಗೆ ವಾರಂವಾರ ಗಮನಿಸಿ. ರಾತ್ರಿ ಎಲೆಗಳು ಒಣವಾಗಿರಲಿ.',
      'Drought Stress': 'ಬೇರು ಭಾಗದ ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ. ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ನೀರಾವರಿ ಮಾಡಿ. ಆವಿಯಾಗುವಿಕೆ ಕಡಿಸಲು ಮಲ್ಚ್ ಬಳಸಿ.',
      'Nutrient Deficiency': 'ಮಣ್ಣು ಅಥವಾ ಎಲೆ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ. ಪರೀಕ್ಷೆಯ ನಂತರ ಸಮತೋಲನ ಗೊಬ್ಬರ ನೀಡಿ. ಅಸಮ ಬೆಳವಣಿಗೆ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      'Pest Attack': 'ಎಲೆಗಳ ಕೆಳಭಾಗ ಪರಿಶೀಲಿಸಿ. ಹೆಚ್ಚು ಹಾನಿಗೊಳಗಾದ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ. ಗುರಿನಿರ್ದಿಷ್ಟ ಜೈವ ನಿಯಂತ್ರಣ ಪರಿಗಣಿಸಿ.',
      'Fungal Disease': 'ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ತೆಗೆದುಹಾಕಿ. ಸಸಿಗಳ ನಡುವೆ ಗಾಳಿ ಹರಿವನ್ನು ಹೆಚ್ಚಿಸಿ. ಅಗತ್ಯವಿದ್ದರೆ ಅನುಮೋದಿತ ಹುಳುಬುರುಡೆನಾಶಕ ಬಳಸಿ.',
    },
    noAlert: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಕಂಡುಬಂದಿಲ್ಲ.',
  },
  ta: {
    stress: {
      'Healthy': 'ஆரோக்கியம்',
      'Drought Stress': 'வறட்சி அழுத்தம்',
      'Nutrient Deficiency': 'ஊட்டச்சத்து குறைபாடு',
      'Pest Attack': 'பூச்சி தாக்குதல்',
      'Fungal Disease': 'பூஞ்சை நோய்',
    },
    recommendations: {
      'Healthy': 'தற்போதைய பாசன அட்டவணையை தொடரவும். ஆரம்ப மாற்றங்களை வாரந்தோறும் கண்காணிக்கவும். இரவில் இலைகள் உலர வைத்திருக்கவும்.',
      'Drought Stress': 'வேர் பகுதி மண் ஈரத்தை சரிபார்க்கவும். அதிகாலை அல்லது மாலை பாசனம் செய்யவும். ஆவியாகுதல் குறைக்க மல்ச் பயன்படுத்தவும்.',
      'Nutrient Deficiency': 'மண் அல்லது இலை பரிசோதனை செய்யவும். பரிசோதனைக்குப் பிறகு சமநிலை உரம் பயன்படுத்தவும். ஒழுங்கற்ற வளர்ச்சி அறிகுறிகளை பார்க்கவும்.',
      'Pest Attack': 'இலைகளின் அடிப்பகுதியை பார்க்கவும். அதிக பாதிக்கப்பட்ட இலைகளை அகற்றவும். குறிவைத்த உயிரியல் கட்டுப்பாட்டை பரிசீலிக்கவும்.',
      'Fungal Disease': 'தொற்றிய இலைகளை பாதுகாப்பாக அகற்றவும். தாவரங்களுக்கு இடையே காற்றோட்டத்தை அதிகரிக்கவும். தேவையெனில் அனுமதிக்கப்பட்ட பூஞ்சைநாசினி பயன்படுத்தவும்.',
    },
    noAlert: 'உங்கள் பகுதியில் கடுமையான வானிலை எச்சரிக்கை இல்லை.',
  },
  te: {
    stress: {
      'Healthy': 'ఆరోగ్యంగా ఉంది',
      'Drought Stress': 'ఎండ ఒత్తిడి',
      'Nutrient Deficiency': 'పోషక లోపం',
      'Pest Attack': 'పీడక దాడి',
      'Fungal Disease': 'ఫంగస్ వ్యాధి',
    },
    recommendations: {
      'Healthy': 'ప్రస్తుత నీటి పారుదల షెడ్యూల్ కొనసాగించండి. ప్రారంభ మార్పుల కోసం వారానికి ఒకసారి గమనించండి. రాత్రి ఆకులు ఎండగా ఉండేలా చూడండి.',
      'Drought Stress': 'వేరుల లోతులో మట్టి తేమను తనిఖీ చేయండి. తెల్లవారుజామున లేదా సాయంత్రం నీరు ఇవ్వండి. ఆవిరి తగ్గించేందుకు మల్చింగ్ చేయండి.',
      'Nutrient Deficiency': 'మట్టి లేదా ఆకుల పరీక్ష చేయండి. పరీక్ష తర్వాత సమతుల్య ఎరువు వాడండి. అసమాన వృద్ధి లక్షణాలను పరిశీలించండి.',
      'Pest Attack': 'ఆకుల క్రింది భాగాన్ని పరిశీలించండి. ఎక్కువగా ప్రభావితమైన ఆకులను తొలగించండి. లక్ష్యిత బయో నియంత్రణను పరిగణించండి.',
      'Fungal Disease': 'సోకిన ఆకులను సురక్షితంగా తొలగించండి. మొక్కల మధ్య గాలి ప్రవాహం మెరుగుపరచండి. అవసరమైతే అనుమతించిన ఫంగిసైడ్ వాడండి.',
    },
    noAlert: 'మీ ప్రాంతంలో తీవ్రమైన వాతావరణ హెచ్చరికలు లేవు.',
  },
  es: {
    stress: {
      'Healthy': 'Saludable',
      'Drought Stress': 'Estrés por sequía',
      'Nutrient Deficiency': 'Deficiencia de nutrientes',
      'Pest Attack': 'Ataque de plagas',
      'Fungal Disease': 'Enfermedad fúngica',
    },
    recommendations: {
      'Healthy': 'Mantenga el riego actual. Supervise semanalmente cambios tempranos. Mantenga las hojas secas durante la noche.',
      'Drought Stress': 'Revise la humedad del suelo en la zona de raíces. Riegue temprano por la mañana o al atardecer. Añada mantillo para reducir evaporación.',
      'Nutrient Deficiency': 'Realice un análisis de suelo o de hoja. Aplique fertilizante balanceado después del análisis. Revise patrones de crecimiento desiguales.',
      'Pest Attack': 'Inspeccione el envés de las hojas. Retire el follaje muy infestado. Considere un biocontrol dirigido.',
      'Fungal Disease': 'Retire hojas infectadas de forma segura. Mejore la ventilación entre plantas. Aplique fungicida aprobado si es necesario.',
    },
    noAlert: 'No se detectaron condiciones meteorológicas extremas en su zona.',
  },
  fr: {
    stress: {
      'Healthy': 'Sain',
      'Drought Stress': 'Stress hydrique',
      'Nutrient Deficiency': 'Carence nutritive',
      'Pest Attack': 'Attaque de ravageurs',
      'Fungal Disease': 'Maladie fongique',
    },
    recommendations: {
      'Healthy': 'Maintenez le calendrier d irrigation actuel. Surveillez chaque semaine les premiers changements. Gardez les feuilles sèches pendant la nuit.',
      'Drought Stress': 'Vérifiez l humidité du sol à la profondeur des racines. Irriguez tôt le matin ou en soirée. Ajoutez du paillage pour réduire l évaporation.',
      'Nutrient Deficiency': 'Faites une analyse du sol ou des feuilles. Appliquez un engrais équilibré après l analyse. Vérifiez les schémas de croissance irréguliers.',
      'Pest Attack': 'Inspectez le dessous des feuilles. Retirez le feuillage fortement infesté. Envisagez un biocontrôle ciblé.',
      'Fungal Disease': 'Retirez les feuilles infectées en toute sécurité. Améliorez la circulation d air entre les plantes. Appliquez un fongicide approuvé si nécessaire.',
    },
    noAlert: 'Aucune condition météo extrême détectée dans votre zone.',
  },
}

const PROFILE_KEY = 'csw-profile-v1'
const HISTORY_KEY = 'csw-history-v1'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function normalizeAspect(width, height) {
  if (!width || !height) return '-'
  const ratio = width / height
  return ratio.toFixed(2)
}

function computeQuality(file, width, height) {
  if (!file || !width || !height) return 0
  let score = 0
  score += file.size <= 1_500_000 ? 35 : 18
  score += width >= 800 && height >= 800 ? 35 : 18
  const aspect = Math.max(width / height, height / width)
  score += aspect <= 3.0 ? 30 : 12
  return Math.min(100, Math.max(10, Math.round(score)))
}

function localizeStressType(stressType, lang) {
  const map = LOCALIZED_REPORT_TEXT[lang]?.stress
  return map?.[stressType] || stressType || 'Unknown'
}

function localizeRecommendation(stressType, recommendation, lang) {
  const map = LOCALIZED_REPORT_TEXT[lang]?.recommendations
  if (!map) return recommendation || ''

  if (stressType && map[stressType]) return map[stressType]

  const matchedStressType = Object.entries(BASE_RECOMMENDATIONS)
    .find(([, value]) => value === recommendation)?.[0]
  return matchedStressType ? map[matchedStressType] || recommendation : recommendation || ''
}


// Sky-condition phrases the API may return (lowercase keys match API output)
const KNOWN_SKY_CONDITIONS = [
  'clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds',
  'light rain', 'moderate rain', 'heavy intensity rain', 'thunderstorm',
  'snow', 'mist', 'fog', 'haze', 'smoke', 'drizzle',
]

// Risk phrases the API may return (lowercase keys)
const KNOWN_RISK_PHRASES = [
  'no immediate climate risk to crops',
  'high temperature stress risk',
  'frost risk detected',
  'heavy rain may cause waterlogging',
  'drought conditions likely',
  'strong wind risk',
]

/**
 * Parse a dynamic weather alert string of the form:
 *   "Current conditions in {city}: {sky}, {temp}°C, {hum}% humidity — {risk}."
 * Returns null if parsing fails (unknown format).
 */
function parseWeatherAlert(alert) {
  // Match: anything after "Current conditions in " up to ":"
  const headerMatch = alert.match(/^Current conditions in (.+?):\s*(.+)$/)
  if (!headerMatch) return null

  const city = headerMatch[1].trim()
  const rest = headerMatch[2].trim()

  // rest expected: "{sky}, {temp}°C, {hum}% humidity — {risk}."
  const bodyMatch = rest.match(/^(.+?),\s*([\d.]+)°C,\s*([\d.]+)%\s*humidity\s*[—–-]\s*(.+?)\.?$/)
  if (!bodyMatch) return null

  return {
    city,
    sky: bodyMatch[1].trim().toLowerCase(),
    temp: bodyMatch[2],
    hum: bodyMatch[3],
    risk: bodyMatch[4].trim().toLowerCase(),
  }
}

function localizeClimateAlert(climateAlert, lang) {
  if (!climateAlert) return ''

  // Hardcoded "no alert" string from API
  if (climateAlert === 'No extreme weather conditions detected in your area.') {
    return LOCALIZED_REPORT_TEXT[lang]?.noAlert || climateAlert
  }

  // Try to parse the structured weather sentence
  const parsed = parseWeatherAlert(climateAlert)
  if (!parsed) return climateAlert   // unknown format — return raw

  const langData = TRANSLATIONS[lang] ?? TRANSLATIONS['en']

  // Look up sky condition translation (case-insensitive key search)
  const skyKey = KNOWN_SKY_CONDITIONS.find((k) => parsed.sky.includes(k)) ?? parsed.sky
  const localSky = langData.weatherSky?.[skyKey] ?? parsed.sky

  // Look up risk phrase translation
  const riskKey = KNOWN_RISK_PHRASES.find((k) => parsed.risk.includes(k)) ?? parsed.risk
  const localRisk = langData.weatherRisk?.[riskKey] ?? parsed.risk

  // Apply the sentence template
  const template = langData.weatherTemplate
    ?? 'Current conditions in {city}: {sky}, {temp}°C, {hum}% humidity — {risk}.'

  return template
    .replace('{city}', parsed.city)
    .replace('{sky}', localSky)
    .replace('{temp}', parsed.temp)
    .replace('{hum}', parsed.hum)
    .replace('{risk}', localRisk)
}


export default function CropAppPage() {
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const resultRef = useRef(null)
  const { t, lang } = useTranslation()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewBase64, setPreviewBase64] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [meta, setMeta] = useState({ resolution: '-', size: '-', aspect: '-', score: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [ttsState, setTtsState] = useState('idle')
  const [ttsError, setTtsError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedProfile = window.localStorage.getItem(PROFILE_KEY)
    const storedHistory = window.localStorage.getItem(HISTORY_KEY)

    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile))
      } catch {
        setProfile(DEFAULT_PROFILE)
      }
    }

    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory))
      } catch {
        setHistory([])
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    }
  }, [profile])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const qualityLabel = useMemo(() => {
    if (meta.score >= 80) return t('appQualityExcellent')
    if (meta.score >= 55) return t('appQualityGood')
    if (meta.score >= 30) return t('appQualityFair')
    return t('appQualityPoor')
  }, [meta.score, t])

  const localizedStressType = useMemo(() => {
    if (!report) return ''
    return localizeStressType(report.stress_type, lang)
  }, [report, lang])

  const localizedRecommendation = useMemo(() => {
    if (!report) return ''
    return localizeRecommendation(report.stress_type, report.recommendation, lang)
  }, [report, lang])

  const localizedClimateAlert = useMemo(() => {
    if (!report) return ''
    return localizeClimateAlert(report.climate_alert, lang)
  }, [report, lang])

  const handleFile = (nextFile) => {
    setError('')
    if (!nextFile) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(nextFile.type)) {
      setError(t('appUploadError'))
      return
    }

    const objectUrl = URL.createObjectURL(nextFile)
    setFile(nextFile)
    setPreviewUrl(objectUrl)
    setReport(null)

    // Convert to base64 for history persistence
    const reader = new FileReader()
    reader.onload = (e) => setPreviewBase64(e.target.result)
    reader.readAsDataURL(nextFile)

    const image = new Image()
    image.onload = () => {
      const score = computeQuality(nextFile, image.width, image.height)
      setMeta({
        resolution: `${image.width}×${image.height}`,
        size: formatSize(nextFile.size),
        aspect: normalizeAspect(image.width, image.height),
        score,
      })
    }
    image.src = objectUrl
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files.length > 0) {
      handleFile(event.dataTransfer.files[0])
    }
  }

  const handleSelect = () => {
    inputRef.current?.click()
  }

  const resetFile = () => {
    setFile(null)
    setPreviewUrl('')
    setPreviewBase64('')
    setMeta({ resolution: '-', size: '-', aspect: '-', score: 0 })
    setReport(null)
    setError('')
  }

  const saveProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const addHistoryEntry = (entry) => {
    setHistory((current) => [entry, ...current].slice(0, 8))
  }

  const deleteHistoryItem = (itemId) => {
    setHistory((current) => current.filter(item => item.id !== itemId))
  }

  const runAnalysis = async () => {
    if (!file) {
      setError(t('appNoFileError'))
      return
    }
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Include user ID for subscription checking
      const userId = localStorage.getItem('userId') || 'anonymous'
      formData.append('userId', userId)

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed. Please try again.')
      }

      setReport(data)
      addHistoryEntry({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        stress_type: data.stress_type || 'Unknown',
        confidence: data.confidence || 0,
        severity: data.severity || 0,
        recommendation: data.recommendation || '',
        imageBase64: previewBase64 || null,
      })
      // Scroll to results after a short tick so the section has rendered
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('appAPIError'))
    } finally {
      setLoading(false)
    }
  }

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speakRecommendation = useCallback(async (text) => {
    if (!text) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setTtsState('loading')
    setTtsError('')
    try {
      const browserLocale = typeof navigator !== 'undefined' ? navigator.language : ''
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, locale: browserLocale }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `TTS failed (${res.status})`)
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onplay  = () => setTtsState('playing')
      audio.onended = () => { setTtsState('done'); URL.revokeObjectURL(url) }
      audio.onerror = () => { setTtsState('error'); setTtsError(t('appPlaybackError')); URL.revokeObjectURL(url) }
      audio.play()
    } catch (err) {
      setTtsState('error')
      setTtsError(err instanceof Error ? err.message : t('appTTSError'))
    }
  }, [t, lang])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setTtsState('idle')
    }
  }, [])

  // Auto-play TTS whenever a new report arrives (uses active language)
  useEffect(() => {
    if (!report) return
    const fullText = [
      `${t('appPrediction')}: ${localizedStressType}.`,
      `${t('appConfidence')}: ${Math.round((report.confidence || 0) * 100)}%.`,
      `${t('appRecommendation')}: ${localizedRecommendation}`,
      localizedClimateAlert && localizedClimateAlert !== t('appNoAlert')
        ? `${t('appClimateMessage')}: ${localizedClimateAlert}`
        : '',
    ].filter(Boolean).join(' ')
    speakRecommendation(fullText)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, lang])

  // Clean up on unmount
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause() }, [])
  // ─────────────────────────────────────────────────────────────────────────

  const downloadReport = () => {
    if (!report) return

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 40
    const lineHeight = 18
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = margin

    doc.setFontSize(20)
    doc.text('Crop Stress Analysis Report', margin, y)
    y += 26

    doc.setFontSize(10)
    doc.setTextColor('#444')
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
    y += 20
    doc.setTextColor('#000')

    const addField = (label, value) => {
      const text = `${label}: ${value}`
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
      doc.text(lines, margin, y)
      y += lines.length * lineHeight
      if (y > 740) {
        doc.addPage()
        y = margin
      }
    }

    if (previewBase64 && previewBase64.startsWith('data:image/')) {
      const imageTypeMatch = previewBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,/i)
      const imageType = imageTypeMatch ? imageTypeMatch[1].toUpperCase() : 'PNG'
      const imgWidth = 180
      const imgHeight = 180
      doc.addImage(previewBase64, imageType, pageWidth - imgWidth - margin, margin + 10, imgWidth, imgHeight)
    }

    doc.setFontSize(14)
    doc.text('Profile & Image Details', margin, y)
    y += 20
    doc.setFontSize(11)

    addField('Crop', profile.crop || 'Not provided')
    addField('Stage', profile.stage || 'Not provided')
    addField('Irrigation', profile.irrigation || 'Not provided')
    addField('Notes', profile.notes || 'Not provided')
    y += 8

    doc.setFontSize(14)
    doc.text('Analysis Result', margin, y)
    y += 22
    doc.setFontSize(11)

    addField('Prediction', report.stress_type || 'Unknown')
    addField('Confidence', report.confidence != null ? `${Math.round(report.confidence * 100)}%` : 'N/A')
    addField('Severity', report.severity != null ? report.severity : 'N/A')
    addField('Recommendation', report.recommendation || 'N/A')
    addField('Climate alert', report.climate_alert || 'No alert detected')
    addField('Model version', report.model_version || 'N/A')
    addField('Processing time', report.processing_time_ms != null ? `${report.processing_time_ms} ms` : 'N/A')

    doc.save('crop-report.pdf')
  }

  const copyReport = async () => {
    if (!report) return
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
  }

  return (
    <main className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">{t('appEyebrow')}</p>
          <h1>{t('appH1')}</h1>
        </div>
        <Link href="/auth" className="btn btn-outline">
          {t('appDemoLogin')}
        </Link>
      </div>

      <section className="app-grid">
        <article className="card upload-card">
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={handleSelect}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp"
              hidden
              onChange={(event) => {
                const next = event.target.files?.[0]
                if (next) handleFile(next)
              }}
            />
            <div>
              <p className="drop-title">{t('appDropTitle')}</p>
              <p className="drop-sub">{t('appDropSub')}</p>
            </div>
          </div>

          {previewUrl && (
            <div className="preview-panel">
              <img className="preview-img" src={previewUrl} alt="Leaf / plant / tree / crop preview" />
              <div className="preview-actions">
                <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}>
                  {loading ? t('appAnalysing') : t('appAnalyze')}
                </button>
                <button className="btn btn-ghost" onClick={resetFile} type="button">
                  {t('appClear')}
                </button>
              </div>
            </div>
          )}

          <div className="panel-grid">
            <div className="field">
              <label className="label">{t('appCropType')}</label>
              <select
                value={profile.crop}
                onChange={(event) => saveProfileField('crop', event.target.value)}
                className="input"
              >
                <option value="">{t('appSelectCrop')}</option>
                <option>Tomato</option>
                <option>Potato</option>
                <option>Corn</option>
                <option>Wheat</option>
                <option>Rice</option>
                <option>Cotton</option>
                <option>Soybean</option>
              </select>
            </div>
            <div className="field">
              <label className="label">{t('appStage')}</label>
              <div className="toggle-group">
                {STAGE_KEYS.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    className={`toggle ${profile.stage === stage ? 'active' : ''}`}
                    onClick={() => saveProfileField('stage', stage)}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label">{t('appIrrigation')}</label>
              <select
                value={profile.irrigation}
                onChange={(event) => saveProfileField('irrigation', event.target.value)}
                className="input"
              >
                <option value="">{t('appSelectSchedule')}</option>
                <option>{t('appRainfed')}</option>
                <option>{t('appWeekly')}</option>
                <option>{t('appTwiceWeekly')}</option>
                <option>{t('appDaily')}</option>
                <option>{t('appDrip')}</option>
              </select>
            </div>
            <div className="field">
              <label className="label">{t('appFieldNotes')}</label>
              <textarea
                value={profile.notes}
                onChange={(event) => saveProfileField('notes', event.target.value)}
                className="input textarea"
                placeholder={t('appFieldNotesPlaceholder')}
              />
            </div>
          </div>
        </article>

        <article className="card status-card">
          <div>
            <p className="section-title">{t('appImageQuality')}</p>
            <h2>{t('appPhotoReadiness')}</h2>
          </div>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">{t('appResolution')}</span>
              <span>{meta.resolution}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{t('appFileSize')}</span>
              <span>{meta.size}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{t('appAspect')}</span>
              <span>{meta.aspect}</span>
            </div>
          </div>
          <div className="quality-panel">
            <div className="quality-bar">
              <div className="quality-fill" style={{ width: `${meta.score}%` }} />
            </div>
            <div className="quality-summary">
              <span>{meta.score}%</span>
              <span>{qualityLabel}</span>
            </div>
          </div>
          <ul className="quality-notes">
            <li>{t('appQualityNote1')}</li>
            <li>{t('appQualityNote2')}</li>
            <li>{t('appQualityNote3')}</li>
          </ul>
        </article>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {report && (
        <section className="result-section" ref={resultRef}>
          <div className="result-header">
            <div>
              <p className="section-title">{t('appPrediction')}</p>
              <h2>{localizedStressType || 'Unknown'}</h2>
            </div>
            <span className="badge">{t('appSeverity')} {report.severity ?? '—'}</span>
          </div>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">{t('appConfidence')}</p>
              <strong>{Math.round((report.confidence || 0) * 100)}%</strong>
            </div>
            <div className="result-card">
              <p className="result-label">{t('appRecommendation')}</p>
              <p>{localizedRecommendation}</p>
            </div>
            <div className="result-card">
              <p className="result-label">{t('appClimateMessage')}</p>
              <p>{localizedClimateAlert || t('appNoAlert')}</p>
            </div>
          </div>
          <div className="action-row">
            {/* ── TTS speaker button ─────────────────────────── */}
            <button
              id="tts-speak-btn"
              className={`btn btn-tts ${
                ttsState === 'loading' ? 'btn-tts--loading' :
                ttsState === 'playing' ? 'btn-tts--playing' : ''
              }`}
              type="button"
              title={ttsState === 'playing' ? t('appStopAudio') : t('appHearRec')}
              onClick={() =>
                ttsState === 'playing'
                  ? stopAudio()
                  : speakRecommendation([
                      `${t('appPrediction')}: ${localizedStressType}.`,
                      `${t('appConfidence')}: ${Math.round((report.confidence || 0) * 100)}%.`,
                      `${t('appRecommendation')}: ${localizedRecommendation}`,
                      localizedClimateAlert && localizedClimateAlert !== t('appNoAlert')
                        ? `${t('appClimateMessage')}: ${localizedClimateAlert}` : '',
                    ].filter(Boolean).join(' '))
              }
              disabled={ttsState === 'loading'}
            >
              {ttsState === 'loading' && (
                <span className="tts-spin" aria-hidden="true" />
              )}
              {ttsState === 'playing' ? (
                <>
                  <span className="tts-wave" aria-hidden="true">
                    <span /><span /><span /><span />
                  </span>
                  {t('appStopAudio')}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  {ttsState === 'done' ? t('appReplayAudio') : t('appHearRec')}
                </>
              )}
            </button>
            {ttsError && (
              <span className="tts-error" role="alert">{ttsError}</span>
            )}
            {/* ──────────────────────────────────────────────── */}
            <button className="btn btn-primary" type="button" onClick={copyReport}>
              {t('appCopyReport')}
            </button>
            <button className="btn btn-outline" type="button" onClick={downloadReport}>
              {t('appDownloadPDF')}
            </button>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="history-panel">
          <div className="history-header">
            <div>
              <p className="section-title">{t('appAnalysisHistory')}</p>
              <h2>{t('appRecentSessions')}</h2>
            </div>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setHistory([])}
            >
              {t('appClearHistory')}
            </button>
          </div>
          <div className="history-list">
            {history.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-row">
                  <div className="history-content">
                    {item.imageBase64 ? (
                      <img
                        className="history-thumb"
                        src={item.imageBase64}
                        alt={localizeStressType(item.stress_type, lang)}
                      />
                    ) : (
                      <span className="history-leaf">🌿</span>
                    )}
                    <div>
                      <p className="history-title">{localizeStressType(item.stress_type, lang)}</p>
                      <p className="history-meta">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="history-actions">
                    <span className="badge">{Math.round(item.confidence * 100)}%</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteHistoryItem(item.id)}
                      title="Delete this analysis"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p>{localizeRecommendation(item.stress_type, item.recommendation, lang)}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
