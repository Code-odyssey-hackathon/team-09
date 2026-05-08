'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

const STRESS_CATEGORIES = [
  'Healthy',
  'Drought Stress',
  'Nutrient Deficiency',
  'Pest Attack',
  'Fungal Disease',
]

const STRESS_ACTIONS = {
  Healthy: [
    'Maintain current irrigation schedule',
    'Monitor weekly for early changes',
    'Keep leaves dry overnight',
  ],
  'Drought Stress': [
    'Check soil moisture at root depth',
    'Irrigate early morning or late evening',
    'Add mulch to reduce evaporation',
  ],
  'Nutrient Deficiency': [
    'Run a soil or leaf test',
    'Apply balanced fertilizer after testing',
    'Inspect for uneven growth patterns',
  ],
  'Pest Attack': [
    'Inspect underside of leaves',
    'Remove heavily infested foliage',
    'Consider targeted bio-control',
  ],
  'Fungal Disease': [
    'Remove infected leaves safely',
    'Improve airflow between plants',
    'Apply approved fungicide if needed',
  ],
}

const DEFAULT_PROFILE = {
  crop: '',
  stage: 'Seedling',
  irrigation: '',
  notes: '',
}

const PROFILE_KEY = 'csw-profile-v1'
const HISTORY_KEY = 'csw-history-v1'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function normalizeAspect(width, height) {
  if (!width || !height) return '-'
  const ratio = width / height
  return ratio.toFixed(2)
}

function computeQuality(file, width, height) {
  if (!file || !width || !height) return 0
  let score = 0
  score += file.size <= 1_500_000 ? 35 : 18
  score += width >= 800 && height >= 800 ? 35 : 18
  const aspect = Math.max(width / height, height / width)
  score += aspect <= 1.8 ? 30 : 12
  return Math.min(100, Math.max(10, Math.round(score)))
}

export default function CropAppPage() {
  const inputRef = useRef(null)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [meta, setMeta] = useState({ resolution: '-', size: '-', aspect: '-', score: 0 })
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedProfile = window.localStorage.getItem(PROFILE_KEY)
    const storedHistory = window.localStorage.getItem(HISTORY_KEY)

    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile))
      } catch {
        setProfile(DEFAULT_PROFILE)
      }
    }

    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory))
      } catch {
        setHistory([])
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    }
  }, [profile])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const qualityLabel = useMemo(() => {
    if (meta.score >= 80) return 'Excellent'
    if (meta.score >= 55) return 'Good'
    if (meta.score >= 30) return 'Fair'
    return 'Poor'
  }, [meta.score])

  const handleFile = (nextFile) => {
    setError('')
    if (!nextFile) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(nextFile.type)) {
      setError('Upload a JPEG, PNG, WebP, or BMP image.')
      return
    }

    const objectUrl = URL.createObjectURL(nextFile)
    setFile(nextFile)
    setPreviewUrl(objectUrl)
    setReport(null)

    const image = new Image()
    image.onload = () => {
      const score = computeQuality(nextFile, image.width, image.height)
      setMeta({
        resolution: `${image.width}×${image.height}`,
        size: formatSize(nextFile.size),
        aspect: normalizeAspect(image.width, image.height),
        score,
      })
    }
    image.src = objectUrl
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files.length > 0) {
      handleFile(event.dataTransfer.files[0])
    }
  }

  const handleSelect = () => {
    inputRef.current?.click()
  }

  const resetFile = () => {
    setFile(null)
    setPreviewUrl('')
    setMeta({ resolution: '-', size: '-', aspect: '-', score: 0 })
    setReport(null)
    setError('')
  }

  const saveProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const addHistoryEntry = (entry) => {
    setHistory((current) => [entry, ...current].slice(0, 8))
  }

  const runAnalysis = async () => {
    if (!file) {
      setError('Please upload an image before analysing.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed. Please try again.')
      }

      setReport(data)
      addHistoryEntry({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        stress_type: data.stress_type || 'Unknown',
        confidence: data.confidence || 0,
        severity: data.severity || 0,
        recommendation: data.recommendation || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the API.')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'crop-report.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const copyReport = async () => {
    if (!report) return
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
  }

  return (
    <main className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Crop diagnosis</p>
          <h1>Analyze photos and receive instant recommendations.</h1>
        </div>
        <Link href="/auth" className="btn btn-outline">
          Demo login
        </Link>
      </div>

      <section className="app-grid">
        <article className="card upload-card">
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={handleSelect}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp"
              hidden
              onChange={(event) => {
                const next = event.target.files?.[0]
                if (next) handleFile(next)
              }}
            />
            <div>
              <p className="drop-title">Drop a leaf image or click to browse</p>
              <p className="drop-sub">JPEG, PNG, WebP, BMP supported</p>
            </div>
          </div>

          {previewUrl && (
            <div className="preview-panel">
              <img className="preview-img" src={previewUrl} alt="Leaf preview" />
              <div className="preview-actions">
                <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}>
                  {loading ? 'Analysing…' : 'Analyze photo'}
                </button>
                <button className="btn btn-ghost" onClick={resetFile} type="button">
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="panel-grid">
            <div className="field">
              <label className="label">Crop type</label>
              <select
                value={profile.crop}
                onChange={(event) => saveProfileField('crop', event.target.value)}
                className="input"
              >
                <option value="">Select crop</option>
                <option>Tomato</option>
                <option>Potato</option>
                <option>Corn</option>
                <option>Wheat</option>
                <option>Rice</option>
                <option>Cotton</option>
                <option>Soybean</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Stage</label>
              <div className="toggle-group">
                {['Seedling', 'Vegetative', 'Flowering', 'Fruiting'].map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    className={`toggle ${profile.stage === stage ? 'active' : ''}`}
                    onClick={() => saveProfileField('stage', stage)}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label">Irrigation</label>
              <select
                value={profile.irrigation}
                onChange={(event) => saveProfileField('irrigation', event.target.value)}
                className="input"
              >
                <option value="">Select schedule</option>
                <option>Rainfed</option>
                <option>Weekly</option>
                <option>2-3x weekly</option>
                <option>Daily</option>
                <option>Drip</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Field notes</label>
              <textarea
                value={profile.notes}
                onChange={(event) => saveProfileField('notes', event.target.value)}
                className="input textarea"
                placeholder="Heatwave last week, new fertilizer applied, etc."
              />
            </div>
          </div>
        </article>

        <article className="card status-card">
          <div>
            <p className="section-title">Image quality</p>
            <h2>Photo readiness</h2>
          </div>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Resolution</span>
              <span>{meta.resolution}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">File size</span>
              <span>{meta.size}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Aspect</span>
              <span>{meta.aspect}</span>
            </div>
          </div>
          <div className="quality-panel">
            <div className="quality-bar">
              <div className="quality-fill" style={{ width: `${meta.score}%` }} />
            </div>
            <div className="quality-summary">
              <span>{meta.score}%</span>
              <span>{qualityLabel}</span>
            </div>
          </div>
          <ul className="quality-notes">
            <li>Use a close-up photo of a single leaf.</li>
            <li>Avoid glare and shadows for best prediction accuracy.</li>
            <li>Upload bright, centered images for reliable results.</li>
          </ul>
        </article>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {report && (
        <section className="result-section">
          <div className="result-header">
            <div>
              <p className="section-title">Prediction</p>
              <h2>{report.stress_type || 'Unknown'}</h2>
            </div>
            <span className="badge">Severity {report.severity ?? '—'}</span>
          </div>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">Confidence</p>
              <strong>{Math.round((report.confidence || 0) * 100)}%</strong>
            </div>
            <div className="result-card">
              <p className="result-label">Recommendation</p>
              <p>{report.recommendation}</p>
            </div>
            <div className="result-card">
              <p className="result-label">Climate message</p>
              <p>{report.climate_alert || 'No alert detected.'}</p>
            </div>
          </div>
          <div className="action-row">
            <button className="btn btn-primary" type="button" onClick={copyReport}>
              Copy report
            </button>
            <button className="btn btn-outline" type="button" onClick={downloadReport}>
              Download JSON
            </button>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="history-panel">
          <div className="history-header">
            <div>
              <p className="section-title">Analysis history</p>
              <h2>Recent sessions</h2>
            </div>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setHistory([])}
            >
              Clear history
            </button>
          </div>
          <div className="history-list">
            {history.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-row">
                  <div className="history-content">
                    <span className="history-leaf">🌿</span>
                    <div>
                      <p className="history-title">{item.stress_type}</p>
                      <p className="history-meta">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <span className="badge">{Math.round(item.confidence * 100)}%</span>
                  </div>
                </div>
                <p>{item.recommendation}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
