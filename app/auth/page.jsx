'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setStatus({ type: 'error', message: data.error || 'Login failed.' })
      } else {
        setStatus({ type: 'success', message: data.message, details: data })
        // Redirect to app after successful login
        setTimeout(() => {
          router.push('/app')
        }, 1500) // Small delay to show success message
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to reach the login API.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <div className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Demo authentication</span>
          <h1>Secure access with a demo auth API.</h1>
          <p>
            This login form sends credentials to the Python serverless endpoint
            and returns a mock access token for the demo experience.
          </p>
          <Link href="/app" className="btn btn-outline">
            Use the app
          </Link>
        </div>

        <div className="auth-card card">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label className="label">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="label">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input"
                placeholder="At least 8 characters"
                required
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {status && (
            <div className={`alert ${status.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              <p>{status.message}</p>
              {status.type === 'success' && status.details && (
                <div className="token-box">
                  <pre>{status.details.access_token}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
