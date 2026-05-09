'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '../../components/TranslationContext'

export default function AuthPage() {
  const router = useRouter()
  const { t } = useTranslation()
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
        setStatus({ type: 'error', message: data.error || t('authLoginFailed') })
      } else {
        // Store user ID in localStorage for subscription management
        localStorage.setItem('userId', data.user.id)
        router.push('/app')
      }
    } catch (err) {
      setStatus({ type: 'error', message: t('authAPIError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell auth-page">
      <div className="auth-layout">
        <section className="auth-copy card">
          <span className="eyebrow">{t('authEyebrow')}</span>
          <div className="auth-copy-badge">Secure access</div>
          <h1>{t('authH1')}</h1>
          <p>{t('authDesc')}</p>
          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <span className="auth-highlight-title">Protected</span>
              <span className="auth-highlight-subtitle">App auth endpoint</span>
            </div>
            <div className="auth-highlight-item">
              <span className="auth-highlight-title">Fast</span>
              <span className="auth-highlight-subtitle">Login in a few clicks</span>
            </div>
            <div className="auth-highlight-item">
              <span className="auth-highlight-title">Polished</span>
              <span className="auth-highlight-subtitle">Premium dashboard UI</span>
            </div>
          </div>
          <div className="auth-copy-actions">
            <Link href="/app" className="btn btn-primary">
              {t('authUseApp')}
            </Link>
            <Link href="/" className="btn btn-outline">
              Back to home
            </Link>
          </div>
        </section>

        <div className="auth-card card">
          <div className="auth-card-head">
            <div>
              <span className="section-title">Dashboard access</span>
              <h2>{t('authLoginTitle')}</h2>
            </div>
            <span className="auth-card-glass">Frosted glass</span>
          </div>
          <form onSubmit={handleSubmit} className="form-grid">
            <label className="label">
              {t('authEmail')}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input"
                placeholder={t('authEmailPlaceholder')}
                required
              />
              <span className="field-help">Use the email tied to your dashboard account.</span>
            </label>
            <label className="label">
              {t('authPassword')}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input"
                placeholder={t('authPasswordPlaceholder')}
                required
              />
              <span className="field-help">Passwords are validated by the app login endpoint.</span>
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? t('authSigningIn') : t('authSignIn')}
            </button>
          </form>

          {status && (
            <div className={`alert ${status.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              <p>{status.message}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
