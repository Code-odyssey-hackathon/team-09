'use client'

import Link from 'next/link'
import { useTranslation } from '../components/TranslationContext'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="page-shell">
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
          <h3>{t('homeFeature1Title')}</h3>
          <p>{t('homeFeature1Desc')}</p>
        </article>
        <article className="feature-card">
          <h3>{t('homeFeature2Title')}</h3>
          <p>{t('homeFeature2Desc')}</p>
        </article>
        <article className="feature-card">
          <h3>{t('homeFeature3Title')}</h3>
          <p>{t('homeFeature3Desc')}</p>
        </article>
      </section>
    </main>
  )
}
