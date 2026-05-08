import { NextResponse } from 'next/server'

// Adam – deep, clear, authoritative (English)
const VOICE_EN = 'pNInz6obpgDQGcFmaJgB'
// Rachel – multilingual, warm (works well for non-English text)
const VOICE_MULTILINGUAL = '21m00Tcm4TlvDq8ikWAM'

// Ordered by quality; falls back on 402 (tier restriction)
const ELEVENLABS_MODELS = ['eleven_turbo_v2_5', 'eleven_flash_v2_5']

// Languages supported by the turbo/flash multilingual models
// Maps our i18n code → ISO 639-1 code expected by ElevenLabs
const LANG_CODE_MAP = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  ta: 'ta',
  te: 'te',
  es: 'es',
  fr: 'fr',
}

export async function POST(request) {
  try {
    const { text, lang } = await request.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or empty text.' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'TTS service not configured.' }, { status: 503 })
    }

    // Resolve voice and language code
    const languageCode = LANG_CODE_MAP[lang] || 'en'
    const voiceId = languageCode === 'en' ? VOICE_EN : VOICE_MULTILINGUAL

    let elevenRes = null
    for (const model of ELEVENLABS_MODELS) {
      elevenRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text: text.slice(0, 1000),
            model_id: model,
            language_code: languageCode,
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.80,
              style: 0.20,
              use_speaker_boost: true,
            },
          }),
        }
      )
      // 402 = payment / tier required – try next model
      if (elevenRes.ok || elevenRes.status !== 402) break
    }

    if (!elevenRes.ok) {
      const errBody = await elevenRes.text()
      console.error('ElevenLabs error:', elevenRes.status, errBody)
      return NextResponse.json(
        { error: `TTS upstream error: ${elevenRes.status}` },
        { status: 502 }
      )
    }

    const audioBuffer = await elevenRes.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('TTS route error:', err)
    return NextResponse.json({ error: 'Failed to generate audio.' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({ status: 'ok' })
}
