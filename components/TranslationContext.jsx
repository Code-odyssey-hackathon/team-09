'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

const TRANSLATIONS = {
  en: {
    // Nav
    navBrand: 'AI Crop Stress Whisperer',
    navHome: 'Home',
    navApp: 'App',
    navLogin: 'Login',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',

    // Home page
    homeEyebrow: 'AI Crop Stress Whisperer',
    homeH1: 'Instant crop stress diagnosis with a leaf photo',
    homeDesc:
      'Upload a leaf image, get a model confidence score, tailored recommendations, and a simple action plan for better field decisions.',
    homeLaunch: 'Launch the App',
    homeLoginDemo: 'Login Demo',
    homeCardLabel: 'Live demo experience',
    homeCardH2: 'Photo-based plant stress analysis',
    homeCardDesc:
      'A modern Next.js interface backed by Vercel Python serverless functions. Upload, analyse, and review field diagnostics instantly.',
    homePillML: 'Live ML API',
    homePillUpload: 'Image upload',
    homePillPlan: 'Action plan',
    homeFeature1Title: 'Dynamic experience',
    homeFeature1Desc:
      'The site now uses Next.js and React for dynamic pages with a real API backend. Every route renders on-demand and supports fast client-side interactions.',
    homeFeature2Title: 'Python serverless API',
    homeFeature2Desc:
      'Existing Vercel Python functions remain intact and continue to serve the crop prediction and auth endpoints.',
    homeFeature3Title: 'Mobile-friendly layout',
    homeFeature3Desc:
      'Responsive components and accessible forms ensure the app works well across phones, tablets, and desktop browsers.',

    // App page
    appEyebrow: 'Crop diagnosis',
    appH1: 'Analyze photos and receive instant recommendations.',
    appDemoLogin: 'Demo login',
    appDropTitle: 'Drop a leaf image or click to browse',
    appDropSub: 'JPEG, PNG, WebP, BMP supported',
    appAnalysing: 'Analysing…',
    appAnalyze: 'Analyze photo',
    appClear: 'Clear',
    appCropType: 'Crop type',
    appSelectCrop: 'Select crop',
    appStage: 'Stage',
    appIrrigation: 'Irrigation',
    appSelectSchedule: 'Select schedule',
    appRainfed: 'Rainfed',
    appWeekly: 'Weekly',
    appTwiceWeekly: '2-3x weekly',
    appDaily: 'Daily',
    appDrip: 'Drip',
    appFieldNotes: 'Field notes',
    appFieldNotesPlaceholder: 'Heatwave last week, new fertilizer applied, etc.',
    appImageQuality: 'Image quality',
    appPhotoReadiness: 'Photo readiness',
    appResolution: 'Resolution',
    appFileSize: 'File size',
    appAspect: 'Aspect',
    appQualityNote1: 'Use a close-up photo of a single leaf.',
    appQualityNote2: 'Avoid glare and shadows for best prediction accuracy.',
    appQualityNote3: 'Upload bright, centered images for reliable results.',
    appQualityExcellent: 'Excellent',
    appQualityGood: 'Good',
    appQualityFair: 'Fair',
    appQualityPoor: 'Poor',
    appPrediction: 'Prediction',
    appSeverity: 'Severity',
    appConfidence: 'Confidence',
    appRecommendation: 'Recommendation',
    appClimateMessage: 'Climate message',
    appNoAlert: 'No alert detected.',
    appHearRec: 'Hear recommendation',
    appReplayAudio: 'Replay audio',
    appStopAudio: 'Stop audio',
    appCopyReport: 'Copy report',
    appDownloadJSON: 'Download JSON',
    appAnalysisHistory: 'Analysis history',
    appRecentSessions: 'Recent sessions',
    appClearHistory: 'Clear history',
    appUploadError: 'Upload a JPEG, PNG, WebP, or BMP image.',
    appNoFileError: 'Please upload an image before analysing.',
    appAPIError: 'Unable to reach the API.',
    appTTSError: 'Audio generation failed.',
    appPlaybackError: 'Playback failed.',

    // Auth page
    authEyebrow: 'Demo authentication',
    authH1: 'Secure access with a demo auth API.',
    authDesc:
      'This login form sends credentials to the Python serverless endpoint and returns a mock access token for the demo experience.',
    authUseApp: 'Use the app',
    authLoginTitle: 'Login',
    authEmail: 'Email address',
    authPassword: 'Password',
    authEmailPlaceholder: 'you@example.com',
    authPasswordPlaceholder: 'At least 8 characters',
    authSigningIn: 'Signing in…',
    authSignIn: 'Sign in',
    authLoginFailed: 'Login failed.',
    authAPIError: 'Unable to reach the login API.',
  },

  hi: {
    navBrand: 'AI फसल तनाव विश्लेषक',
    navHome: 'होम',
    navApp: 'ऐप',
    navLogin: 'लॉगिन',
    switchToDark: 'डार्क मोड में जाएं',
    switchToLight: 'लाइट मोड में जाएं',

    homeEyebrow: 'AI फसल तनाव विश्लेषक',
    homeH1: 'पत्ती की फोटो से तत्काल फसल तनाव निदान',
    homeDesc:
      'पत्ती की छवि अपलोड करें, मॉडल कॉन्फिडेंस स्कोर, अनुकूलित सिफारिशें और बेहतर खेत निर्णयों के लिए एक सरल कार्य योजना प्राप्त करें।',
    homeLaunch: 'ऐप लॉन्च करें',
    homeLoginDemo: 'लॉगिन डेमो',
    homeCardLabel: 'लाइव डेमो अनुभव',
    homeCardH2: 'फोटो-आधारित पौधे तनाव विश्लेषण',
    homeCardDesc:
      'Vercel Python सर्वरलेस फ़ंक्शन द्वारा समर्थित एक आधुनिक Next.js इंटरफ़ेस। तुरंत अपलोड, विश्लेषण और खेत निदान देखें।',
    homePillML: 'लाइव ML API',
    homePillUpload: 'छवि अपलोड',
    homePillPlan: 'कार्य योजना',
    homeFeature1Title: 'डायनामिक अनुभव',
    homeFeature1Desc:
      'साइट अब Next.js और React का उपयोग करती है। प्रत्येक रूट ऑन-डिमांड रेंडर होता है और तेज़ इंटरैक्शन का समर्थन करता है।',
    homeFeature2Title: 'Python सर्वरलेस API',
    homeFeature2Desc:
      'मौजूदा Vercel Python फ़ंक्शन बरकरार हैं और फसल भविष्यवाणी और auth एंडपॉइंट की सेवा जारी रखते हैं।',
    homeFeature3Title: 'मोबाइल-अनुकूल लेआउट',
    homeFeature3Desc:
      'रिस्पॉन्सिव घटक और सुलभ फ़ॉर्म फ़ोन, टैबलेट और डेस्कटॉप ब्राउज़र पर सुचारू रूप से काम करते हैं।',

    appEyebrow: 'फसल निदान',
    appH1: 'फोटो का विश्लेषण करें और तत्काल सिफारिशें प्राप्त करें।',
    appDemoLogin: 'डेमो लॉगिन',
    appDropTitle: 'पत्ती की छवि यहाँ छोड़ें या ब्राउज़ करने के लिए क्लिक करें',
    appDropSub: 'JPEG, PNG, WebP, BMP समर्थित',
    appAnalysing: 'विश्लेषण हो रहा है…',
    appAnalyze: 'फोटो का विश्लेषण करें',
    appClear: 'साफ़ करें',
    appCropType: 'फसल का प्रकार',
    appSelectCrop: 'फसल चुनें',
    appStage: 'चरण',
    appIrrigation: 'सिंचाई',
    appSelectSchedule: 'शेड्यूल चुनें',
    appRainfed: 'वर्षाधारित',
    appWeekly: 'साप्ताहिक',
    appTwiceWeekly: 'सप्ताह में 2-3 बार',
    appDaily: 'दैनिक',
    appDrip: 'ड्रिप',
    appFieldNotes: 'खेत नोट्स',
    appFieldNotesPlaceholder: 'पिछले सप्ताह लू, नई खाद डाली, आदि।',
    appImageQuality: 'छवि गुणवत्ता',
    appPhotoReadiness: 'फोटो तैयारी',
    appResolution: 'रिज़ॉल्यूशन',
    appFileSize: 'फ़ाइल आकार',
    appAspect: 'अनुपात',
    appQualityNote1: 'एक पत्ती का क्लोज़-अप फोटो उपयोग करें।',
    appQualityNote2: 'सर्वोत्तम परिणाम के लिए चमक और छाया से बचें।',
    appQualityNote3: 'विश्वसनीय परिणामों के लिए उज्ज्वल, केंद्रित छवियां अपलोड करें।',
    appQualityExcellent: 'उत्कृष्ट',
    appQualityGood: 'अच्छा',
    appQualityFair: 'ठीक',
    appQualityPoor: 'खराब',
    appPrediction: 'भविष्यवाणी',
    appSeverity: 'गंभीरता',
    appConfidence: 'विश्वास',
    appRecommendation: 'सिफारिश',
    appClimateMessage: 'जलवायु संदेश',
    appNoAlert: 'कोई अलर्ट नहीं मिला।',
    appHearRec: 'सिफारिश सुनें',
    appReplayAudio: 'ऑडियो दोहराएं',
    appStopAudio: 'ऑडियो रोकें',
    appCopyReport: 'रिपोर्ट कॉपी करें',
    appDownloadJSON: 'JSON डाउनलोड करें',
    appAnalysisHistory: 'विश्लेषण इतिहास',
    appRecentSessions: 'हाल के सत्र',
    appClearHistory: 'इतिहास साफ़ करें',
    appUploadError: 'JPEG, PNG, WebP, या BMP छवि अपलोड करें।',
    appNoFileError: 'विश्लेषण से पहले एक छवि अपलोड करें।',
    appAPIError: 'API तक पहुंचने में असमर्थ।',
    appTTSError: 'ऑडियो जनरेशन विफल।',
    appPlaybackError: 'प्लेबैक विफल।',

    authEyebrow: 'डेमो प्रमाणीकरण',
    authH1: 'डेमो auth API के साथ सुरक्षित पहुँच।',
    authDesc:
      'यह लॉगिन फ़ॉर्म Python सर्वरलेस एंडपॉइंट पर क्रेडेंशियल भेजता है और डेमो अनुभव के लिए एक मॉक एक्सेस टोकन लौटाता है।',
    authUseApp: 'ऐप उपयोग करें',
    authLoginTitle: 'लॉगिन',
    authEmail: 'ईमेल पता',
    authPassword: 'पासवर्ड',
    authEmailPlaceholder: 'you@example.com',
    authPasswordPlaceholder: 'कम से कम 8 अक्षर',
    authSigningIn: 'साइन इन हो रहा है…',
    authSignIn: 'साइन इन करें',
    authLoginFailed: 'लॉगिन विफल।',
    authAPIError: 'लॉगिन API तक पहुंचने में असमर्थ।',
  },

  es: {
    navBrand: 'AI Susurrador de Estrés de Cultivos',
    navHome: 'Inicio',
    navApp: 'App',
    navLogin: 'Iniciar sesión',
    switchToDark: 'Cambiar a modo oscuro',
    switchToLight: 'Cambiar a modo claro',

    homeEyebrow: 'AI Susurrador de Estrés de Cultivos',
    homeH1: 'Diagnóstico instantáneo del estrés de cultivos con una foto de hoja',
    homeDesc:
      'Sube una imagen de hoja, obtén una puntuación de confianza del modelo, recomendaciones personalizadas y un plan de acción para mejores decisiones de campo.',
    homeLaunch: 'Abrir la App',
    homeLoginDemo: 'Demo de inicio de sesión',
    homeCardLabel: 'Experiencia de demo en vivo',
    homeCardH2: 'Análisis de estrés de plantas por foto',
    homeCardDesc:
      'Una interfaz moderna de Next.js respaldada por funciones serverless Python de Vercel. Sube, analiza y revisa diagnósticos de campo al instante.',
    homePillML: 'API ML en vivo',
    homePillUpload: 'Subida de imágenes',
    homePillPlan: 'Plan de acción',
    homeFeature1Title: 'Experiencia dinámica',
    homeFeature1Desc:
      'El sitio usa Next.js y React para páginas dinámicas con un backend API real. Cada ruta se renderiza a demanda y soporta interacciones rápidas.',
    homeFeature2Title: 'API serverless Python',
    homeFeature2Desc:
      'Las funciones Python de Vercel existentes siguen intactas y continúan sirviendo los endpoints de predicción de cultivos y autenticación.',
    homeFeature3Title: 'Diseño adaptable para móvil',
    homeFeature3Desc:
      'Componentes responsivos y formularios accesibles garantizan que la app funcione bien en teléfonos, tabletas y navegadores de escritorio.',

    appEyebrow: 'Diagnóstico de cultivos',
    appH1: 'Analiza fotos y recibe recomendaciones instantáneas.',
    appDemoLogin: 'Demo de inicio de sesión',
    appDropTitle: 'Suelta una imagen de hoja o haz clic para explorar',
    appDropSub: 'Compatible con JPEG, PNG, WebP, BMP',
    appAnalysing: 'Analizando…',
    appAnalyze: 'Analizar foto',
    appClear: 'Limpiar',
    appCropType: 'Tipo de cultivo',
    appSelectCrop: 'Seleccionar cultivo',
    appStage: 'Etapa',
    appIrrigation: 'Irrigación',
    appSelectSchedule: 'Seleccionar horario',
    appRainfed: 'Por lluvia',
    appWeekly: 'Semanal',
    appTwiceWeekly: '2-3 veces por semana',
    appDaily: 'Diario',
    appDrip: 'Goteo',
    appFieldNotes: 'Notas de campo',
    appFieldNotesPlaceholder: 'Ola de calor la semana pasada, nuevo fertilizante aplicado, etc.',
    appImageQuality: 'Calidad de imagen',
    appPhotoReadiness: 'Preparación de foto',
    appResolution: 'Resolución',
    appFileSize: 'Tamaño de archivo',
    appAspect: 'Aspecto',
    appQualityNote1: 'Usa una foto de primer plano de una sola hoja.',
    appQualityNote2: 'Evita reflejos y sombras para mayor precisión.',
    appQualityNote3: 'Sube imágenes brillantes y centradas para resultados fiables.',
    appQualityExcellent: 'Excelente',
    appQualityGood: 'Bueno',
    appQualityFair: 'Regular',
    appQualityPoor: 'Pobre',
    appPrediction: 'Predicción',
    appSeverity: 'Severidad',
    appConfidence: 'Confianza',
    appRecommendation: 'Recomendación',
    appClimateMessage: 'Mensaje climático',
    appNoAlert: 'No se detectó ninguna alerta.',
    appHearRec: 'Escuchar recomendación',
    appReplayAudio: 'Repetir audio',
    appStopAudio: 'Detener audio',
    appCopyReport: 'Copiar informe',
    appDownloadJSON: 'Descargar JSON',
    appAnalysisHistory: 'Historial de análisis',
    appRecentSessions: 'Sesiones recientes',
    appClearHistory: 'Borrar historial',
    appUploadError: 'Sube una imagen JPEG, PNG, WebP o BMP.',
    appNoFileError: 'Por favor sube una imagen antes de analizar.',
    appAPIError: 'No se puede acceder a la API.',
    appTTSError: 'Error al generar audio.',
    appPlaybackError: 'Error de reproducción.',

    authEyebrow: 'Autenticación de demo',
    authH1: 'Acceso seguro con una API de autenticación de demo.',
    authDesc:
      'Este formulario de inicio de sesión envía credenciales al endpoint serverless Python y devuelve un token de acceso simulado para la experiencia de demo.',
    authUseApp: 'Usar la app',
    authLoginTitle: 'Iniciar sesión',
    authEmail: 'Correo electrónico',
    authPassword: 'Contraseña',
    authEmailPlaceholder: 'tu@ejemplo.com',
    authPasswordPlaceholder: 'Al menos 8 caracteres',
    authSigningIn: 'Iniciando sesión…',
    authSignIn: 'Iniciar sesión',
    authLoginFailed: 'Inicio de sesión fallido.',
    authAPIError: 'No se puede acceder a la API de inicio de sesión.',
  },

  fr: {
    navBrand: 'Chuchoteur de Stress des Cultures IA',
    navHome: 'Accueil',
    navApp: 'App',
    navLogin: 'Connexion',
    switchToDark: 'Passer en mode sombre',
    switchToLight: 'Passer en mode clair',

    homeEyebrow: 'Chuchoteur de Stress des Cultures IA',
    homeH1: 'Diagnostic instantané du stress des cultures avec une photo de feuille',
    homeDesc:
      'Téléversez une image de feuille, obtenez un score de confiance du modèle, des recommandations personnalisées et un plan d\'action pour de meilleures décisions agricoles.',
    homeLaunch: 'Lancer l\'App',
    homeLoginDemo: 'Démo de connexion',
    homeCardLabel: 'Expérience de démo en direct',
    homeCardH2: 'Analyse du stress des plantes par photo',
    homeCardDesc:
      'Une interface Next.js moderne soutenue par des fonctions serverless Python Vercel. Téléversez, analysez et examinez les diagnostics de terrain instantanément.',
    homePillML: 'API ML en direct',
    homePillUpload: 'Upload d\'image',
    homePillPlan: 'Plan d\'action',
    homeFeature1Title: 'Expérience dynamique',
    homeFeature1Desc:
      'Le site utilise Next.js et React pour des pages dynamiques avec un vrai backend API. Chaque route se rend à la demande et prend en charge les interactions rapides.',
    homeFeature2Title: 'API serverless Python',
    homeFeature2Desc:
      'Les fonctions Python Vercel existantes restent intactes et continuent de servir les endpoints de prédiction et d\'authentification.',
    homeFeature3Title: 'Interface adaptée aux mobiles',
    homeFeature3Desc:
      'Des composants responsifs et des formulaires accessibles garantissent que l\'app fonctionne bien sur téléphones, tablettes et navigateurs de bureau.',

    appEyebrow: 'Diagnostic des cultures',
    appH1: 'Analysez des photos et recevez des recommandations instantanées.',
    appDemoLogin: 'Démo de connexion',
    appDropTitle: 'Déposez une image de feuille ou cliquez pour parcourir',
    appDropSub: 'JPEG, PNG, WebP, BMP pris en charge',
    appAnalysing: 'Analyse en cours…',
    appAnalyze: 'Analyser la photo',
    appClear: 'Effacer',
    appCropType: 'Type de culture',
    appSelectCrop: 'Sélectionner une culture',
    appStage: 'Stade',
    appIrrigation: 'Irrigation',
    appSelectSchedule: 'Sélectionner un calendrier',
    appRainfed: 'Pluvial',
    appWeekly: 'Hebdomadaire',
    appTwiceWeekly: '2-3 fois par semaine',
    appDaily: 'Quotidien',
    appDrip: 'Goutte-à-goutte',
    appFieldNotes: 'Notes de terrain',
    appFieldNotesPlaceholder: 'Canicule la semaine dernière, nouvel engrais appliqué, etc.',
    appImageQuality: 'Qualité d\'image',
    appPhotoReadiness: 'Préparation de la photo',
    appResolution: 'Résolution',
    appFileSize: 'Taille du fichier',
    appAspect: 'Rapport',
    appQualityNote1: 'Utilisez une photo rapprochée d\'une seule feuille.',
    appQualityNote2: 'Évitez les reflets et les ombres pour une meilleure précision.',
    appQualityNote3: 'Téléversez des images lumineuses et centrées pour des résultats fiables.',
    appQualityExcellent: 'Excellent',
    appQualityGood: 'Bon',
    appQualityFair: 'Correct',
    appQualityPoor: 'Faible',
    appPrediction: 'Prédiction',
    appSeverity: 'Sévérité',
    appConfidence: 'Confiance',
    appRecommendation: 'Recommandation',
    appClimateMessage: 'Message climatique',
    appNoAlert: 'Aucune alerte détectée.',
    appHearRec: 'Entendre la recommandation',
    appReplayAudio: 'Rejouer l\'audio',
    appStopAudio: 'Arrêter l\'audio',
    appCopyReport: 'Copier le rapport',
    appDownloadJSON: 'Télécharger JSON',
    appAnalysisHistory: 'Historique d\'analyse',
    appRecentSessions: 'Sessions récentes',
    appClearHistory: 'Effacer l\'historique',
    appUploadError: 'Téléversez une image JPEG, PNG, WebP ou BMP.',
    appNoFileError: 'Veuillez téléverser une image avant d\'analyser.',
    appAPIError: 'Impossible d\'accéder à l\'API.',
    appTTSError: 'Échec de la génération audio.',
    appPlaybackError: 'Échec de la lecture.',

    authEyebrow: 'Authentification de démo',
    authH1: 'Accès sécurisé avec une API d\'authentification de démo.',
    authDesc:
      'Ce formulaire de connexion envoie des identifiants à l\'endpoint serverless Python et renvoie un token d\'accès fictif pour l\'expérience de démo.',
    authUseApp: 'Utiliser l\'app',
    authLoginTitle: 'Connexion',
    authEmail: 'Adresse e-mail',
    authPassword: 'Mot de passe',
    authEmailPlaceholder: 'vous@exemple.com',
    authPasswordPlaceholder: 'Au moins 8 caractères',
    authSigningIn: 'Connexion en cours…',
    authSignIn: 'Se connecter',
    authLoginFailed: 'Échec de la connexion.',
    authAPIError: 'Impossible d\'accéder à l\'API de connexion.',
  },
}

const LANG_STORAGE_KEY = 'csw-lang-v1'

const TranslationContext = createContext(null)

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (stored && TRANSLATIONS[stored]) setLang(stored)
  }, [])

  const switchLang = (code) => {
    if (!TRANSLATIONS[code]) return
    setLang(code)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, code)
    }
  }

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key

  return (
    <TranslationContext.Provider value={{ lang, switchLang, t, languages: LANGUAGES }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(TranslationContext)
  if (!ctx) throw new Error('useTranslation must be used inside TranslationProvider')
  return ctx
}
