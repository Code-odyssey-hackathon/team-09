import { NextResponse } from 'next/server'

const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB' // Adam – deep, clear, authoritative
// Ordered by quality; falls back on 402 (tier restriction)
const ELEVENLABS_MODELS = ['eleven_turbo_v2_5', 'eleven_flash_v2_5']

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or empty text.' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'TTS service not configured.' }, { status: 503 })
    }

    let elevenRes = null
    for (const model of ELEVENLABS_MODELS) {
      elevenRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
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
