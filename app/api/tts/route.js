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

    /**
     * Fallback strategy (each step only runs if previous step gets 402):
     *  1. Preferred voice + language_code  (best quality, paid feature)
     *  2. Preferred voice, no language_code (auto-detect, free-tier safe)
     *  3. English Adam voice, no language_code (last resort)
     */
    const ATTEMPTS = [
      // Attempt 1 – with language_code (paid tier)
      ...ELEVENLABS_MODELS.map((model) => ({
        model,
        voice: voiceId,
        withLangCode: true,
      })),
      // Attempt 2 – without language_code (free-tier compatible, auto-detect)
      ...ELEVENLABS_MODELS.map((model) => ({
        model,
        voice: voiceId,
        withLangCode: false,
      })),
      // Attempt 3 – English Adam voice, no language_code (always works)
      ...ELEVENLABS_MODELS.map((model) => ({
        model,
        voice: VOICE_EN,
        withLangCode: false,
      })),
    ]

    let elevenRes = null
    for (const attempt of ATTEMPTS) {
      const body = {
        text: text.slice(0, 1000),
        model_id: attempt.model,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.80,
          style: 0.20,
          use_speaker_boost: true,
        },
      }
      if (attempt.withLangCode) body.language_code = languageCode

      elevenRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${attempt.voice}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify(body),
        }
      )
      // Only continue to the next attempt on a 402 (tier restriction)
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
