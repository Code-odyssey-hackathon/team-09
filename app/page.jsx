'use client'

import Link from 'next/link'
import { useTranslation } from '../components/TranslationContext'
import { useEffect, useRef, useState } from 'react'

/* ── Animated counter hook ───────────────────────────────────────────────── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(ease * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return [count, ref]
}

/* ── Stat item ───────────────────────────────────────────────────────────── */
function StatItem({ value, suffix, label }) {
  const [count, ref] = useCountUp(value)
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-value">{count.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

/* ── Step card ───────────────────────────────────────────────────────────── */
function StepCard({ number, icon, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <div className="step-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

/* ── Tech badge ──────────────────────────────────────────────────────────── */
function TechBadge({ icon, name, detail }) {
  return (
    <div className="tech-badge">
      <span className="tech-icon">{icon}</span>
      <div>
        <div className="tech-name">{name}</div>
        <div className="tech-detail">{detail}</div>
      </div>
    </div>
  )
}

/* ── Testimonial card ────────────────────────────────────────────────────── */
function TestimonialCard({ quote, name, role, avatar }) {
  return (
    <article className="testimonial-card">
      <div className="testimonial-stars">{'★'.repeat(5)}</div>
      <blockquote className="testimonial-quote">"{quote}"</blockquote>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </article>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="page-shell home-page">
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-leaf leaf-1">🌿</div>
        <div className="floating-leaf leaf-2">🍃</div>
        <div className="floating-leaf leaf-3">🌱</div>
        <div className="floating-leaf leaf-4">🌾</div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
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
        <div className="hero-leaf-wrapper">
          <img src="/hero-leaf.png" alt="Healthy crop leaf" className="hero-leaf-image" />
        </div>
      </header>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <section className="stats-bar">
        <StatItem value={12000} suffix="+" label={t('statFarmers')} />
        <div className="stats-divider" />
        <StatItem value={98}   suffix="%" label={t('statAccuracy')} />
        <div className="stats-divider" />
        <StatItem value={7}    suffix=""  label={t('statLanguages')} />
        <div className="stats-divider" />
        <StatItem value={45}   suffix="s" label={t('statDiagnosis')} />
      </section>

      {/* ── Feature cards ──────────────────────────────────────────────── */}
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

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">{t('howEyebrow')}</span>
          <h2 className="section-h2">{t('howH2')}</h2>
          <p className="section-p">{t('howDesc')}</p>
        </div>
        <div className="steps-grid">
          <StepCard number="01" icon="📸" title={t('howStep1Title')} desc={t('howStep1Desc')} />
          <div className="step-connector" aria-hidden="true" />
          <StepCard number="02" icon="🤖" title={t('howStep2Title')} desc={t('howStep2Desc')} />
          <div className="step-connector" aria-hidden="true" />
          <StepCard number="03" icon="✅" title={t('howStep3Title')} desc={t('howStep3Desc')} />
        </div>
      </section>

      {/* ── Tech stack ─────────────────────────────────────────────────── */}
      <section className="tech-section">
        <div className="section-heading">
          <span className="eyebrow">{t('techEyebrow')}</span>
          <h2 className="section-h2">{t('techH2')}</h2>
          <p className="section-p">{t('techDesc')}</p>
        </div>
        <div className="tech-grid">
          <TechBadge icon="⚡" name="Next.js 14"       detail={t('techNextDetail')} />
          <TechBadge icon="🧠" name="MobileNetV2"      detail={t('techMobileNetDetail')} />
          <TechBadge icon="🌤️" name="OpenWeatherMap"   detail={t('techWeatherDetail')} />
          <TechBadge icon="🔊" name="ElevenLabs TTS"   detail={t('techTTSDetail')} />
          <TechBadge icon="🔐" name="Supabase Auth"    detail={t('techAuthDetail')} />
          <TechBadge icon="🚀" name="Vercel Edge"      detail={t('techVercelDetail')} />
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="testimonials-section">
        <div className="section-heading">
          <span className="eyebrow">{t('testimonialsEyebrow')}</span>
          <h2 className="section-h2">{t('testimonialsH2')}</h2>
        </div>
        <div className="testimonials-grid">
          <TestimonialCard
            quote={t('testimonial1Quote')}
            name={t('testimonial1Name')}
            role={t('testimonial1Role')}
            avatar="👨‍🌾"
          />
          <TestimonialCard
            quote={t('testimonial2Quote')}
            name={t('testimonial2Name')}
            role={t('testimonial2Role')}
            avatar="👩‍🌾"
          />
          <TestimonialCard
            quote={t('testimonial3Quote')}
            name={t('testimonial3Name')}
            role={t('testimonial3Role')}
            avatar="🧑‍🌾"
          />
        </div>
      </section>

      {/* ── Call to action ─────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>{t('homeCTAH2')}</h2>
          <p>{t('homeCTADesc')}</p>
          <Link href="/app" className="btn btn-primary btn-large">
            {t('homeCTABtn')}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">🌿</span>
            <p className="footer-tagline">{t('footerTagline')}</p>
            <div className="footer-badges">
              <span className="footer-badge">🇮🇳 Made in India</span>
              <span className="footer-badge">♻️ Open-source</span>
            </div>
          </div>

          <div className="footer-links-group">
            <h4>{t('footerProduct')}</h4>
            <ul>
              <li><Link href="/app">{t('navApp')}</Link></li>
              <li><Link href="/pricing">{t('navPricing')}</Link></li>
              <li><Link href="/marketplace">{t('navMarketplace')}</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>{t('footerCompany')}</h4>
            <ul>
              <li><Link href="/auth">{t('navLogin')}</Link></li>
              <li><a href="https://github.com/Code-odyssey-hackathon/team-09" target="_blank" rel="noopener noreferrer">{t('footerGithub')}</a></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>{t('footerTech')}</h4>
            <ul>
              <li><span>Next.js 14</span></li>
              <li><span>TensorFlow / MobileNetV2</span></li>
              <li><span>Supabase</span></li>
              <li><span>ElevenLabs TTS</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">{t('footerCopy')}</p>
          <p className="footer-hackathon">{t('footerHackathon')}</p>
        </div>
      </footer>
    </main>
  )
}
