'use client'

import Link from 'next/link'
import { useTranslation } from '../components/TranslationContext'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="page-shell">
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-leaf leaf-1">🌿</div>
        <div className="floating-leaf leaf-2">🍃</div>
        <div className="floating-leaf leaf-3">🌱</div>
        <div className="floating-leaf leaf-4">🌾</div>
      </div>

      <header className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{t('homeEyebrow')}</span>
          <h1>{t('homeH1')}</h1>
          <p>{t('homeDesc')}</p>
          <div className="hero-actions">
            <Link href="/app" className="btn btn-primary">
              {t('homeLaunch')}
            </Link>
            <Link href="/auth" className="btn btn-outline">
              {t('homeLoginDemo')}
            </Link>
          </div>
        </div>
        <div className="hero-highlight">
          <div className="hero-card">
            <div className="hero-image-container">
              <img src="/hero-leaf.png" alt="Healthy crop leaf" className="hero-leaf-image" />
            </div>
            <p className="card-label">{t('homeCardLabel')}</p>
            <h2>{t('homeCardH2')}</h2>
            <p>{t('homeCardDesc')}</p>
            <div className="feature-list">
              <span className="pill">{t('homePillML')}</span>
              <span className="pill">{t('homePillUpload')}</span>
              <span className="pill">{t('homePillPlan')}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="overview-grid">
        <article className="feature-card">
          <div className="feature-icon">🔬</div>
          <h3>{t('homeFeature1Title')}</h3>
          <p>{t('homeFeature1Desc')}</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>{t('homeFeature2Title')}</h3>
          <p>{t('homeFeature2Desc')}</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">💊</div>
          <h3>{t('homeFeature3Title')}</h3>
          <p>{t('homeFeature3Desc')}</p>
        </article>
      </section>

      {/* Call to action section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Protect Your Crops?</h2>
          <p>Join thousands of farmers using AI-powered diagnostics to maximize yields and minimize losses.</p>
          <Link href="/app" className="btn btn-primary btn-large">
            Start Analyzing Now
          </Link>
        </div>
      </section>
    </main>
  )
}
