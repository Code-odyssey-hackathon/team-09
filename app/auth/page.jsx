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
    <main className="page-shell">
      <div className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">{t('authEyebrow')}</span>
          <h1>{t('authH1')}</h1>
          <p>{t('authDesc')}</p>
          <Link href="/app" className="btn btn-outline">
            {t('authUseApp')}
          </Link>
        </div>

        <div className="auth-card card">
          <h2>{t('authLoginTitle')}</h2>
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
