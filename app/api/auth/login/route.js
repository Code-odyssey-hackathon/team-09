import { NextResponse } from 'next/server'

const TOKEN_TTL_SECONDS = 3600

function makeTokens() {
  return {
    access_token: `demo-access-${Math.random().toString(36).substring(2, 15)}`,
    refresh_token: `demo-refresh-${Math.random().toString(36).substring(2, 15)}`,
    token_type: 'Bearer',
    expires_in: TOKEN_TTL_SECONDS,
    issued_at: Math.floor(Date.now() / 1000),
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const email = (data.email || '').trim()
    const password = data.password || ''

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const user = {
      id: `demo-${Math.random().toString(36).substring(2, 14)}`,
      email: email,
    }

    const payload = {
      message: 'Demo login successful. No account lookup performed.',
      demo: true,
      user: user,
      ...makeTokens(),
    }

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({ status: 'ok' })
}