'use client'

import { useState } from 'react'
import { useTranslation } from '../../components/TranslationContext'

// ─── Static seed data ──────────────────────────────────────────────────────────
const SEED_LISTINGS = [
  {
    id: 1,
    type: 'farmer',
    name: 'Rajesh Kumar',
    avatar: '👨‍🌾',
    location: 'Punjab, India',
    crop: 'Wheat',
    quantity: '500 kg',
    price: '₹2,400/quintal',
    quality: 'Grade A',
    harvest: 'Ready now',
    description: 'Fresh harvest wheat, sun-dried and cleaned. Ideal for flour mills and wholesale buyers.',
    contact: '+91 98765 43210',
    tags: ['Organic', 'Pesticide-Free'],
    verified: true,
    posted: '2 hours ago',
  },
  {
    id: 2,
    type: 'retailer',
    name: 'Agro Fresh Pvt Ltd',
    avatar: '🏪',
    location: 'Delhi NCR',
    crop: 'Rice (Basmati)',
    quantity: '2 tonnes',
    price: '₹7,500/quintal',
    quality: 'Premium',
    harvest: 'Flexible',
    description: 'Established retail chain looking for consistent basmati rice supply. Long-term contracts preferred.',
    contact: '+91 11 2345 6789',
    tags: ['Bulk Order', 'Long-Term'],
    verified: true,
    posted: '5 hours ago',
  },
  {
    id: 3,
    type: 'farmer',
    name: 'Anita Devi',
    avatar: '👩‍🌾',
    location: 'Maharashtra',
    crop: 'Tomatoes',
    quantity: '200 kg',
    price: '₹35/kg',
    quality: 'Grade B',
    harvest: 'In 3 days',
    description: 'Farm-fresh tomatoes, organically grown without chemical fertilizers. Available for pickup.',
    contact: '+91 94567 89012',
    tags: ['Organic', 'Local'],
    verified: false,
    posted: '1 day ago',
  },
  {
    id: 4,
    type: 'retailer',
    name: 'Green Basket Supermarket',
    avatar: '🛒',
    location: 'Bangalore',
    crop: 'Mixed Vegetables',
    quantity: '500 kg/week',
    price: 'Market rate',
    quality: 'Any grade',
    harvest: 'Weekly delivery',
    description: 'Seeking reliable farmers for weekly fresh vegetable supply. All crops welcome. Prompt payment guaranteed.',
    contact: '+91 80 3456 7890',
    tags: ['Weekly', 'All Crops'],
    verified: true,
    posted: '2 days ago',
  },
  {
    id: 5,
    type: 'farmer',
    name: 'Suresh Patel',
    avatar: '👨‍🌾',
    location: 'Gujarat',
    crop: 'Cotton',
    quantity: '1 tonne',
    price: '₹6,500/quintal',
    quality: 'Grade A+',
    harvest: 'Ready in 2 weeks',
    description: 'High-staple length Bt cotton from certified farm. Suitable for textile mills.',
    contact: '+91 99876 54321',
    tags: ['BT Cotton', 'Certified'],
    verified: true,
    posted: '3 days ago',
  },
  {
    id: 6,
    type: 'retailer',
    name: 'NutriMart Foods',
    avatar: '🏬',
    location: 'Hyderabad',
    crop: 'Groundnuts / Peanuts',
    quantity: '300 kg',
    price: '₹65/kg',
    quality: 'Grade A',
    harvest: 'ASAP',
    description: 'Food processing company urgently requires groundnuts for our snack range. Immediate purchase.',
    contact: '+91 40 5678 1234',
    tags: ['Urgent', 'Food Grade'],
    verified: true,
    posted: '4 days ago',
  },
]

const CROP_TYPES = ['All Crops', 'Wheat', 'Rice (Basmati)', 'Tomatoes', 'Mixed Vegetables', 'Cotton', 'Groundnuts / Peanuts']
const ROLES = ['All', 'Farmers', 'Retailers']

export default function MarketplacePage() {
  const { t } = useTranslation()
  const [listings, setListings] = useState(SEED_LISTINGS)
  const [filterRole, setFilterRole] = useState('All')
  const [filterCrop, setFilterCrop] = useState('All Crops')
  const [search, setSearch] = useState('')
  const [contactModal, setContactModal] = useState(null)
  const [postModal, setPostModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [form, setForm] = useState({
    type: 'farmer',
    name: '',
    location: '',
    crop: '',
    quantity: '',
    price: '',
    quality: 'Grade A',
    harvest: '',
    description: '',
    contact: '',
    tags: '',
  })

  // Filter listings
  const filtered = listings.filter((l) => {
    const roleMatch =
      filterRole === 'All' ||
      (filterRole === 'Farmers' && l.type === 'farmer') ||
      (filterRole === 'Retailers' && l.type === 'retailer')
    const cropMatch = filterCrop === 'All Crops' || l.crop === filterCrop
    const searchMatch =
      search === '' ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.crop.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase())
    return roleMatch && cropMatch && searchMatch
  })

  function handlePost(e) {
    e.preventDefault()
    const newListing = {
      id: Date.now(),
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      verified: false,
      posted: 'Just now',
      avatar: form.type === 'farmer' ? '👨‍🌾' : '🏪',
    }
    setListings([newListing, ...listings])
    setPostModal(false)
    setSuccessMsg(t('mktSuccess'))
    setTimeout(() => setSuccessMsg(''), 4000)
    setForm({
      type: 'farmer', name: '', location: '', crop: '', quantity: '',
      price: '', quality: 'Grade A', harvest: '', description: '', contact: '', tags: '',
    })
  }

  return (
    <main className="page-shell marketplace-page">
      {/* Floating background */}
      <div className="floating-elements" aria-hidden="true">
        <div className="floating-leaf leaf-1">🌾</div>
        <div className="floating-leaf leaf-2">🥦</div>
        <div className="floating-leaf leaf-3">🍅</div>
        <div className="floating-leaf leaf-4">🌽</div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mkt-hero">
        <div className="mkt-hero-text">
          <span className="eyebrow">🌱 {t('mktEyebrow')}</span>
          <h1>{t('mktH1')}</h1>
          <p>{t('mktDesc')}</p>
          <div className="mkt-hero-stats">
            <div className="mkt-stat">
              <span className="mkt-stat-num">2,400+</span>
              <span className="mkt-stat-label">{t('mktFarmers')}</span>
            </div>
            <div className="mkt-stat-sep" />
            <div className="mkt-stat">
              <span className="mkt-stat-num">850+</span>
              <span className="mkt-stat-label">{t('mktRetailers')}</span>
            </div>
            <div className="mkt-stat-sep" />
            <div className="mkt-stat">
              <span className="mkt-stat-num">₹12 Cr+</span>
              <span className="mkt-stat-label">{t('mktTraded')}</span>
            </div>
          </div>
        </div>
        <button
          id="post-listing-btn"
          className="btn btn-primary btn-large mkt-post-btn"
          onClick={() => setPostModal(true)}
        >
          {t('mktPostBtn')}
        </button>
      </header>

      {/* ── Success banner ──────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="mkt-success-banner" role="alert">
          {successMsg}
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <section className="mkt-filters" aria-label="Filter listings">
        <input
          id="marketplace-search"
          className="input mkt-search"
          type="search"
          placeholder={t('mktSearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mkt-filter-row">
          <div className="toggle-group" role="group" aria-label="Filter by role">
            {ROLES.map((r) => (
              <button
                key={r}
                className={`toggle ${filterRole === r ? 'active' : ''}`}
                onClick={() => setFilterRole(r)}
                id={`role-filter-${r.toLowerCase()}`}
              >
                {r === 'Farmers' ? t('mktFilterFarmers') : r === 'Retailers' ? t('mktFilterRetailers') : t('mktFilterAll')}
              </button>
            ))}
          </div>
          <select
            id="crop-filter-select"
            className="input mkt-crop-select"
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            aria-label="Filter by crop type"
          >
            {CROP_TYPES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <p className="mkt-count">
          {t('mktShowing')} <strong>{filtered.length}</strong> {filtered.length !== 1 ? t('mktListings') : t('mktListing')}
        </p>
      </section>

      {/* ── Listings Grid ───────────────────────────────────────────────────── */}
      <section className="mkt-grid" aria-label="Crop listings">
        {filtered.length === 0 ? (
          <div className="mkt-empty">
            <span className="mkt-empty-icon">🌿</span>
            <p>{t('mktNoResults')}</p>
          </div>
        ) : (
          filtered.map((l) => (
            <article
              key={l.id}
              className={`mkt-card ${l.type}`}
              id={`listing-${l.id}`}
              tabIndex={0}
            >
              <div className="mkt-card-top">
                <div className="mkt-avatar">{l.avatar}</div>
                <div className="mkt-card-meta">
                  <div className="mkt-card-name-row">
                    <span className="mkt-name">{l.name}</span>
                    {l.verified && <span className="mkt-verified" title="Verified">✓</span>}
                  </div>
                  <span className="mkt-location">📍 {l.location}</span>
                </div>
                <span className={`mkt-role-badge ${l.type}`}>
                  {l.type === 'farmer' ? t('mktFarmerRole') : t('mktRetailerRole')}
                </span>
              </div>

              <div className="mkt-card-body">
                <div className="mkt-crop-row">
                  <span className="mkt-crop-name">{l.crop}</span>
                  <span className="mkt-qty">{l.quantity}</span>
                </div>
                <div className="mkt-details-grid">
                  <div className="mkt-detail">
                    <span className="mkt-detail-label">{t('mktPrice2')}</span>
                    <span className="mkt-detail-val mkt-price">{l.price}</span>
                  </div>
                  <div className="mkt-detail">
                    <span className="mkt-detail-label">{t('mktQuality')}</span>
                    <span className="mkt-detail-val">{l.quality}</span>
                  </div>
                  <div className="mkt-detail">
                    <span className="mkt-detail-label">{t('mktAvail')}</span>
                    <span className="mkt-detail-val">{l.harvest}</span>
                  </div>
                </div>
                <p className="mkt-desc">{l.description}</p>
                <div className="mkt-tags">
                  {l.tags.map((tag) => (
                    <span key={tag} className="pill">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="mkt-card-footer">
                <span className="mkt-posted">🕐 {l.posted}</span>
                <button
                  id={`contact-btn-${l.id}`}
                  className="btn btn-primary"
                  onClick={() => setContactModal(l)}
                >
                  {l.type === 'farmer' ? t('mktContactFarmer') : t('mktContactRetailer')}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* ── Contact Modal ───────────────────────────────────────────────────── */}
      {contactModal && (
        <div
          className="mkt-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Contact ${contactModal.name}`}
          onClick={(e) => e.target === e.currentTarget && setContactModal(null)}
        >
          <div className="mkt-modal">
            <button
              className="mkt-modal-close"
              onClick={() => setContactModal(null)}
              aria-label="Close contact modal"
              id="close-contact-modal"
            >
              ✕
            </button>
            <div className="mkt-modal-header">
              <span className="mkt-modal-avatar">{contactModal.avatar}</span>
              <div>
                <h2>{contactModal.name}</h2>
                <p className="mkt-location">📍 {contactModal.location}</p>
              </div>
            </div>
            <div className="mkt-modal-info">
              <div className="mkt-modal-row">
                <span className="mkt-modal-label">Crop</span>
                <span>{contactModal.crop}</span>
              </div>
              <div className="mkt-modal-row">
                <span className="mkt-modal-label">Quantity</span>
                <span>{contactModal.quantity}</span>
              </div>
              <div className="mkt-modal-row">
                <span className="mkt-modal-label">Price</span>
                <span className="mkt-price">{contactModal.price}</span>
              </div>
              <div className="mkt-modal-row">
                <span className="mkt-modal-label">Availability</span>
                <span>{contactModal.harvest}</span>
              </div>
            </div>
            <div className="mkt-contact-box">
              <p className="mkt-contact-label">{t('mktDirectContact')}</p>
              <a
                href={`tel:${contactModal.contact.replace(/\s/g, '')}`}
                className="mkt-contact-number"
                id={`call-link-${contactModal.id}`}
              >
                {contactModal.contact}
              </a>
            </div>
            <div className="mkt-modal-actions">
              <a
                href={`https://wa.me/${contactModal.contact.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                id={`whatsapp-btn-${contactModal.id}`}
              >
                {t('mktWhatsApp')}
              </a>
              <a
                href={`tel:${contactModal.contact.replace(/\s/g, '')}`}
                className="btn btn-outline"
                id={`call-btn-${contactModal.id}`}
              >
                {t('mktCallNow')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Post Listing Modal ──────────────────────────────────────────────── */}
      {postModal && (
        <div
          className="mkt-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Post a new listing"
          onClick={(e) => e.target === e.currentTarget && setPostModal(false)}
        >
          <div className="mkt-modal mkt-post-modal">
            <button
              className="mkt-modal-close"
              onClick={() => setPostModal(false)}
              aria-label="Close post listing modal"
              id="close-post-modal"
            >
              ✕
            </button>
            <h2 className="mkt-modal-title">{t('mktPostTitle')}</h2>
            <p className="mkt-modal-sub">{t('mktPostSub')}</p>

            <form onSubmit={handlePost} className="mkt-form" id="post-listing-form">
              <div className="mkt-form-row">
                <div className="field">
                  <label className="label" htmlFor="form-type">{t('mktIAm')}</label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      id="toggle-farmer"
                      className={`toggle ${form.type === 'farmer' ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, type: 'farmer' })}
                    >
                      {t('mktFarmerLabel')}
                    </button>
                    <button
                      type="button"
                      id="toggle-retailer"
                      className={`toggle ${form.type === 'retailer' ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, type: 'retailer' })}
                    >
                      {t('mktRetailerLabel')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mkt-form-2col">
                <div className="field">
                  <label className="label" htmlFor="form-name">{t('mktFullName')}</label>
                  <input
                    id="form-name"
                    className="input"
                    required
                    placeholder="e.g. Ramesh Singh"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="form-location">{t('mktLocation')}</label>
                  <input
                    id="form-location"
                    className="input"
                    required
                    placeholder="e.g. Punjab, India"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="mkt-form-2col">
                <div className="field">
                  <label className="label" htmlFor="form-crop">{t('mktCropProduce')}</label>
                  <input
                    id="form-crop"
                    className="input"
                    required
                    placeholder="e.g. Wheat, Tomatoes"
                    value={form.crop}
                    onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="form-quantity">{t('mktQuantity')}</label>
                  <input
                    id="form-quantity"
                    className="input"
                    required
                    placeholder="e.g. 500 kg"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="mkt-form-2col">
                <div className="field">
                  <label className="label" htmlFor="form-price">{t('mktPrice')}</label>
                  <input
                    id="form-price"
                    className="input"
                    placeholder="e.g. ₹2,400/quintal"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="form-harvest">{t('mktAvailability')}</label>
                  <input
                    id="form-harvest"
                    className="input"
                    required
                    placeholder="e.g. Ready now, In 1 week"
                    value={form.harvest}
                    onChange={(e) => setForm({ ...form, harvest: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="form-description">{t('mktDescription')}</label>
                <textarea
                  id="form-description"
                  className="textarea"
                  required
                  placeholder="Describe your crop quality, delivery terms, etc."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="mkt-form-2col">
                <div className="field">
                  <label className="label" htmlFor="form-contact">{t('mktContact')}</label>
                  <input
                    id="form-contact"
                    className="input"
                    required
                    placeholder="+91 98765 43210"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="form-tags">{t('mktTags')}</label>
                  <input
                    id="form-tags"
                    className="input"
                    placeholder="e.g. Organic, Bulk"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="mkt-form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPostModal(false)}
                  id="cancel-post-btn"
                >
                  {t('mktCancel')}
                </button>
                <button type="submit" className="btn btn-primary" id="submit-post-btn">
                  {t('mktSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="mkt-how-it-works">
        <h2 className="mkt-section-title">{t('mktHowTitle')}</h2>
        <div className="mkt-steps">
          <div className="mkt-step">
            <div className="mkt-step-icon">📋</div>
            <h3>{t('mktStep1Title')}</h3>
            <p>{t('mktStep1Desc')}</p>
          </div>
          <div className="mkt-step-arrow">→</div>
          <div className="mkt-step">
            <div className="mkt-step-icon">🔍</div>
            <h3>{t('mktStep2Title')}</h3>
            <p>{t('mktStep2Desc')}</p>
          </div>
          <div className="mkt-step-arrow">→</div>
          <div className="mkt-step">
            <div className="mkt-step-icon">🤝</div>
            <h3>{t('mktStep3Title')}</h3>
            <p>{t('mktStep3Desc')}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
