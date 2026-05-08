'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '../../components/TranslationContext'

const STAGE_KEYS = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting']

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
  score += aspect <= 3.0 ? 30 : 12
  return Math.min(100, Math.max(10, Math.round(score)))
}

export default function CropAppPage() {
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const { t, lang } = useTranslation()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewBase64, setPreviewBase64] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [meta, setMeta] = useState({ resolution: '-', size: '-', aspect: '-', score: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [ttsState, setTtsState] = useState('idle')
  const [ttsError, setTtsError] = useState('')

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
    if (meta.score >= 80) return t('appQualityExcellent')
    if (meta.score >= 55) return t('appQualityGood')
    if (meta.score >= 30) return t('appQualityFair')
    return t('appQualityPoor')
  }, [meta.score, t])

  const handleFile = (nextFile) => {
    setError('')
    if (!nextFile) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(nextFile.type)) {
      setError(t('appUploadError'))
      return
    }

    const objectUrl = URL.createObjectURL(nextFile)
    setFile(nextFile)
    setPreviewUrl(objectUrl)
    setReport(null)

    // Convert to base64 for history persistence
    const reader = new FileReader()
    reader.onload = (e) => setPreviewBase64(e.target.result)
    reader.readAsDataURL(nextFile)

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
    setPreviewBase64('')
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
      setError(t('appNoFileError'))
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
        imageBase64: previewBase64 || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('appAPIError'))
    } finally {
      setLoading(false)
    }
  }

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speakRecommendation = useCallback(async (text) => {
    if (!text) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setTtsState('loading')
    setTtsError('')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `TTS failed (${res.status})`)
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onplay  = () => setTtsState('playing')
      audio.onended = () => { setTtsState('done'); URL.revokeObjectURL(url) }
      audio.onerror = () => { setTtsState('error'); setTtsError(t('appPlaybackError')); URL.revokeObjectURL(url) }
      audio.play()
    } catch (err) {
      setTtsState('error')
      setTtsError(err instanceof Error ? err.message : t('appTTSError'))
    }
  }, [t, lang])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setTtsState('idle')
    }
  }, [])

  // Auto-play TTS whenever a new report arrives (uses active language)
  useEffect(() => {
    if (!report) return
    const fullText = [
      `${t('appPrediction')}: ${report.stress_type}.`,
      `${t('appConfidence')}: ${Math.round((report.confidence || 0) * 100)}%.`,
      `${t('appRecommendation')}: ${report.recommendation}`,
      report.climate_alert && report.climate_alert !== t('appNoAlert')
        ? `${t('appClimateMessage')}: ${report.climate_alert}`
        : '',
    ].filter(Boolean).join(' ')
    speakRecommendation(fullText)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report])

  // Clean up on unmount
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause() }, [])
  // ─────────────────────────────────────────────────────────────────────────

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
          <p className="eyebrow">{t('appEyebrow')}</p>
          <h1>{t('appH1')}</h1>
        </div>
        <Link href="/auth" className="btn btn-outline">
          {t('appDemoLogin')}
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
              <p className="drop-title">{t('appDropTitle')}</p>
              <p className="drop-sub">{t('appDropSub')}</p>
            </div>
          </div>

          {previewUrl && (
            <div className="preview-panel">
              <img className="preview-img" src={previewUrl} alt="Leaf / plant preview" />
              <div className="preview-actions">
                <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}>
                  {loading ? t('appAnalysing') : t('appAnalyze')}
                </button>
                <button className="btn btn-ghost" onClick={resetFile} type="button">
                  {t('appClear')}
                </button>
              </div>
            </div>
          )}

          <div className="panel-grid">
            <div className="field">
              <label className="label">{t('appCropType')}</label>
              <select
                value={profile.crop}
                onChange={(event) => saveProfileField('crop', event.target.value)}
                className="input"
              >
                <option value="">{t('appSelectCrop')}</option>
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
              <label className="label">{t('appStage')}</label>
              <div className="toggle-group">
                {STAGE_KEYS.map((stage) => (
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
              <label className="label">{t('appIrrigation')}</label>
              <select
                value={profile.irrigation}
                onChange={(event) => saveProfileField('irrigation', event.target.value)}
                className="input"
              >
                <option value="">{t('appSelectSchedule')}</option>
                <option>{t('appRainfed')}</option>
                <option>{t('appWeekly')}</option>
                <option>{t('appTwiceWeekly')}</option>
                <option>{t('appDaily')}</option>
                <option>{t('appDrip')}</option>
              </select>
            </div>
            <div className="field">
              <label className="label">{t('appFieldNotes')}</label>
              <textarea
                value={profile.notes}
                onChange={(event) => saveProfileField('notes', event.target.value)}
                className="input textarea"
                placeholder={t('appFieldNotesPlaceholder')}
              />
            </div>
          </div>
        </article>

        <article className="card status-card">
          <div>
            <p className="section-title">{t('appImageQuality')}</p>
            <h2>{t('appPhotoReadiness')}</h2>
          </div>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">{t('appResolution')}</span>
              <span>{meta.resolution}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{t('appFileSize')}</span>
              <span>{meta.size}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{t('appAspect')}</span>
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
            <li>{t('appQualityNote1')}</li>
            <li>{t('appQualityNote2')}</li>
            <li>{t('appQualityNote3')}</li>
          </ul>
        </article>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {report && (
        <section className="result-section">
          <div className="result-header">
            <div>
              <p className="section-title">{t('appPrediction')}</p>
              <h2>{report.stress_type || 'Unknown'}</h2>
            </div>
            <span className="badge">{t('appSeverity')} {report.severity ?? '—'}</span>
          </div>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">{t('appConfidence')}</p>
              <strong>{Math.round((report.confidence || 0) * 100)}%</strong>
            </div>
            <div className="result-card">
              <p className="result-label">{t('appRecommendation')}</p>
              <p>{report.recommendation}</p>
            </div>
            <div className="result-card">
              <p className="result-label">{t('appClimateMessage')}</p>
              <p>{report.climate_alert || t('appNoAlert')}</p>
            </div>
          </div>
          <div className="action-row">
            {/* ── TTS speaker button ─────────────────────────── */}
            <button
              id="tts-speak-btn"
              className={`btn btn-tts ${
                ttsState === 'loading' ? 'btn-tts--loading' :
                ttsState === 'playing' ? 'btn-tts--playing' : ''
              }`}
              type="button"
              title={ttsState === 'playing' ? t('appStopAudio') : t('appHearRec')}
              onClick={() =>
                ttsState === 'playing'
                  ? stopAudio()
                  : speakRecommendation([
                      `${t('appPrediction')}: ${report.stress_type}.`,
                      `${t('appConfidence')}: ${Math.round((report.confidence || 0) * 100)}%.`,
                      `${t('appRecommendation')}: ${report.recommendation}`,
                      report.climate_alert && report.climate_alert !== t('appNoAlert')
                        ? `${t('appClimateMessage')}: ${report.climate_alert}` : '',
                    ].filter(Boolean).join(' '))
              }
              disabled={ttsState === 'loading'}
            >
              {ttsState === 'loading' && (
                <span className="tts-spin" aria-hidden="true" />
              )}
              {ttsState === 'playing' ? (
                <>
                  <span className="tts-wave" aria-hidden="true">
                    <span /><span /><span /><span />
                  </span>
                  {t('appStopAudio')}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  {ttsState === 'done' ? t('appReplayAudio') : t('appHearRec')}
                </>
              )}
            </button>
            {ttsError && (
              <span className="tts-error" role="alert">{ttsError}</span>
            )}
            {/* ──────────────────────────────────────────────── */}
            <button className="btn btn-primary" type="button" onClick={copyReport}>
              {t('appCopyReport')}
            </button>
            <button className="btn btn-outline" type="button" onClick={downloadReport}>
              {t('appDownloadJSON')}
            </button>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="history-panel">
          <div className="history-header">
            <div>
              <p className="section-title">{t('appAnalysisHistory')}</p>
              <h2>{t('appRecentSessions')}</h2>
            </div>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setHistory([])}
            >
              {t('appClearHistory')}
            </button>
          </div>
          <div className="history-list">
            {history.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-row">
                  <div className="history-content">
                    {item.imageBase64 ? (
                      <img
                        className="history-thumb"
                        src={item.imageBase64}
                        alt={item.stress_type}
                      />
                    ) : (
                      <span className="history-leaf">🌿</span>
                    )}
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
