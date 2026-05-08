import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">AI Crop Stress Whisperer</span>
          <h1>Instant crop stress diagnosis with a leaf photo</h1>
          <p>
            Upload a leaf image, get a model confidence score, tailored
            recommendations, and a simple action plan for better field decisions.
          </p>
          <div className="hero-actions">
            <Link href="/app" className="btn btn-primary">
              Launch the App
            </Link>
            <Link href="/auth" className="btn btn-outline">
              Login Demo
            </Link>
          </div>
        </div>
        <div className="hero-highlight">
          <div className="hero-card">
            <p className="card-label">Live demo experience</p>
            <h2>Photo-based plant stress analysis</h2>
            <p>
              A modern Next.js interface backed by Vercel Python serverless
              functions. Upload, analyse, and review field diagnostics instantly.
            </p>
            <div className="feature-list">
              <span className="pill">Live ML API</span>
              <span className="pill">Image upload</span>
              <span className="pill">Action plan</span>
            </div>
          </div>
        </div>
      </header>

      <section className="overview-grid">
        <article className="feature-card">
          <h3>Dynamic experience</h3>
          <p>
            The site now uses Next.js and React for dynamic pages with a real API
            backend. Every route renders on-demand and supports fast client-side
            interactions.
          </p>
        </article>
        <article className="feature-card">
          <h3>Python serverless API</h3>
          <p>
            Existing Vercel Python functions remain intact and continue to serve
            the crop prediction and auth endpoints.
          </p>
        </article>
        <article className="feature-card">
          <h3>Mobile-friendly layout</h3>
          <p>
            Responsive components and accessible forms ensure the app works well
            across phones, tablets, and desktop browsers.
          </p>
        </article>
      </section>
    </main>
  )
}
