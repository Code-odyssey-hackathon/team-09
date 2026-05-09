<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/herb_1f33f.png" width="80" alt="herb icon"/>
</p>

<h1 align="center">AI Crop Stress Whisperer</h1>

<p align="center">
  <strong>Upload a leaf, plant, tree, or crop photo → get instant AI-powered stress diagnosis + voice-guided treatment advice.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-api-reference">API Reference</a> ·
  <a href="#-deployment">Deployment</a> ·
  <a href="#-team">Team</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.12-3776ab?logo=python&logoColor=white" alt="Python 3.12"/>
  <img src="https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/model-MobileNetV2_ONNX-22c55e" alt="MobileNetV2 ONNX"/>
  <img src="https://img.shields.io/badge/deploy-Vercel-000?logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/i18n-7_languages-6366f1" alt="7 Languages"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"/>
</p>

<p align="center">
  🌐 <strong>Live:</strong> <a href="https://ai-crop-stress-whisperer.vercel.app">ai-crop-stress-whisperer.vercel.app</a>
</p>

---

## 🌾 Problem Statement

Crop stress — caused by drought, nutrient deficiencies, pests, and fungal infections — is one of the leading causes of yield loss in agriculture worldwide. Smallholder farmers often lack timely access to expert diagnosis, resulting in delayed treatment, unnecessary pesticide use, and reduced harvests.

**AI Crop Stress Whisperer** bridges this gap by placing a deep-learning agronomist in every farmer's pocket — available in **7 languages**, with **voice-guided advice** and a **direct marketplace** to connect farmers with buyers.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **5-Class Stress Detection** | Classifies leaf, plant, tree, or crop images into **Healthy**, **Drought Stress**, **Nutrient Deficiency**, **Pest Attack**, or **Fungal Disease** using MobileNetV2 ONNX |
| 📊 **Severity Scoring** | Returns a 0–100 severity score calibrated per stress category with confidence metrics |
| 💊 **Actionable Recommendations** | Expert-level, stress-specific treatment advice (irrigation, fertilizers, pesticides, fungicides) |
| 🌦️ **Real-Time Climate Alerts** | Integrates OpenWeatherMap to surface weather-based crop risk warnings (heat, frost, humidity, wind) |
| 🔊 **Voice Recommendations (TTS)** | ElevenLabs Text-to-Speech reads out the full diagnosis in the user's selected language |
| 🌍 **7-Language UI** | Full UI translation in English, हिन्दी, ಕನ್ನಡ, தமிழ், తెలుగు, Español, Français |
| 📸 **Multi-Subject Analysis** | Accepts photos of individual leaves, full plants, trees, or crop rows |
| 🗂️ **Analysis History** | Last 8 diagnoses persisted in browser localStorage with thumbnail previews |
| 📄 **PDF Report Export** | Download a complete diagnostic report with image, profile, results, and recommendations |
| 🛒 **AgriConnect Marketplace** | Farmers and retailers can post/browse crop listings and connect directly via call or WhatsApp |
| 💳 **Subscription Plans** | Free, Starter, and Professional tiers managed via Supabase + usage tracking |
| 🔐 **Authentication** | Supabase-powered email/password auth with Row Level Security |
| ⚡ **Serverless Architecture** | Zero-ops deployment on Vercel — Python inference API auto-scales from zero |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (React 19)                  │
│                                                                     │
│  /         → Landing page (hero + features + CTA)                   │
│  /app      → Diagnostic dashboard (upload, analyse, history, PDF)   │
│  /auth     → Login / sign-up (Supabase Auth)                        │
│  /pricing  → Subscription plan selector                             │
│  /subscription → Usage & plan management                            │
│  /marketplace  → AgriConnect farmer ↔ retailer listings             │
│                                                                     │
│  Components: Navigation · ThemeProvider · TranslationContext        │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ API calls
          ┌───────────────────┼────────────────────┐
          ▼                   ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
│  Next.js API    │  │  Supabase       │  │  External APIs       │
│  Routes         │  │  (PostgreSQL)   │  │                      │
│                 │  │                 │  │  OpenWeatherMap      │
│  /api/auth      │  │  profiles       │  │  ElevenLabs TTS      │
│  /api/plans     │  │  subscriptions  │  │                      │
│  /api/subscript.│  │  usage_tracking │  └──────────────────────┘
│  /api/usage     │  │  analysis_hist. │
│  /api/tts       │  └─────────────────┘
│                 │
│  Python (Vercel Serverless)
│  /api/predict   │  ← MobileNetV2 ONNX inference
└─────────────────┘
         │
         ▼
  1. Parse multipart → extract image
  2. Validate content type
  3. Preprocess: PIL → 224×224 → normalise [0,1]
  4. ONNX inference → softmax probabilities
  5. Derive stress type + confidence + severity
  6. Attach recommendation + climate alert
  7. Return JSON
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 + React 19 |
| **Styling** | Vanilla CSS — glassmorphism / Material Expressive design |
| **Fonts** | Inter · Space Grotesk (Google Fonts) |
| **ML Model** | MobileNetV2 (ImageNet pre-trained, PlantVillage fine-tuned) |
| **Inference Runtime** | ONNX Runtime (CPU, ~200ms/image) |
| **Image Processing** | Pillow (PIL) + NumPy |
| **Backend API** | Python 3.12 Vercel Serverless Functions |
| **Authentication** | Supabase Auth (email/password + JWT) |
| **Database** | Supabase (PostgreSQL with Row Level Security) |
| **Climate API** | OpenWeatherMap Current Weather (free tier) |
| **Text-to-Speech** | ElevenLabs API (multilingual, language-aware) |
| **PDF Generation** | jsPDF |
| **Deployment** | Vercel (auto-scaling, global edge network, CI/CD) |
| **i18n** | Custom `TranslationContext` — 7 languages, localStorage persistence |

---

## 🗄️ Database Schema

Managed by **Supabase (PostgreSQL)**. Run `supabase-schema.sql` to initialise.

| Table | Purpose |
|---|---|
| `profiles` | Extended user info, linked to Supabase Auth |
| `subscription_plans` | Available pricing tiers (Free / Starter / Professional) |
| `user_subscriptions` | Active plan per user + billing period |
| `usage_tracking` | Monthly analysis count per user (auto-reset) |
| `analysis_history` | Stored crop stress diagnoses per user |

**Key features:** Row Level Security (RLS) on all tables · automatic profile creation on sign-up · monthly usage counter reset logic.

---

## 🌍 Internationalization (i18n)

The entire UI — including navigation, home page, diagnostic dashboard, auth, pricing, subscription, and marketplace — is fully translated into **7 languages** via a custom zero-dependency `TranslationContext`:

| Language | Code | Coverage |
|---|---|---|
| 🇬🇧 English | `en` | Full |
| 🇮🇳 हिन्दी | `hi` | Full |
| 🇮🇳 ಕನ್ನಡ | `kn` | Full |
| 🇮🇳 தமிழ் | `ta` | Full |
| 🇮🇳 తెలుగు | `te` | Full |
| 🇪🇸 Español | `es` | Full |
| 🇫🇷 Français | `fr` | Full |

Language preference is persisted in `localStorage`. Weather alerts and TTS audio are also language-aware.

---

## 🔬 Model Details

- **Architecture:** MobileNetV2 (lightweight mobile-optimised CNN)
- **Base weights:** ImageNet (transfer learning)
- **Dataset:** [PlantVillage](https://plantvillage.psu.edu/) (~54,000 images, 38 plant species)
- **Input:** 224 × 224 × 3 RGB, normalised to [0, 1]
- **Output classes (5):**

| Class | Severity Range | Typical Symptoms |
|---|---|---|
| `Healthy` | 0 | No visible stress |
| `Drought Stress` | 40–95 | Wilting, leaf curl, yellow margins |
| `Nutrient Deficiency` | 30–80 | Chlorosis, purple stems, stunted growth |
| `Pest Attack` | 50–100 | Holes, stippling, webbing, egg clusters |
| `Fungal Disease` | 45–95 | Spots, blights, powdery/downy mildew |

- **Confidence threshold:** 0.40 — predictions below this return a "low confidence" advisory
- **Model file:** `api/model/model.onnx` (~10 MB, not included in repo); falls back to deterministic demo mode if absent
- **Version:** 1.2.0

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.12+**
- **Vercel CLI** (`npm i -g vercel`)
- **Supabase account** — [supabase.com](https://supabase.com)
- *(Optional)* [OpenWeatherMap API key](https://openweathermap.org/api)
- *(Optional)* [ElevenLabs API key](https://elevenlabs.io)

### 1 — Clone & install

```bash
git clone https://github.com/Code-odyssey-hackathon/team-09.git
cd team-09
npm install
```

### 2 — Database setup

```sql
-- In Supabase SQL Editor, run the full schema:
-- supabase-schema.sql
```

### 3 — Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenWeatherMap (climate alerts)
OPENWEATHERMAP_KEY=your-owm-key

# ElevenLabs (TTS)
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id

# ML Model (optional — falls back to demo mode if absent)
MODEL_PATH=./api/model/model.onnx
```

### 4 — Run locally

```bash
npx vercel dev
# App available at http://localhost:3000
```

### 5 — Usage

1. Open the app → select your language from the nav bar
2. Go to **Dashboard** (`/app`)
3. **Drag & drop** a leaf, plant, tree, or crop photo (JPEG / PNG / WebP / BMP)
4. Optionally fill in crop type, growth stage, irrigation schedule, and field notes
5. Click **Analyze photo** — results appear in seconds:
   - Stress type and localized label
   - Severity score (0–100)
   - Confidence percentage
   - Treatment recommendation (also read aloud in your language via TTS)
   - Real-time climate alert for your location
6. **Download PDF** report or **Copy** raw JSON
7. View your last 8 analyses in the **Recent Sessions** history panel

---

## 📡 API Reference

### `POST /api/predict`

AI-powered crop stress inference from an uploaded image.

**Request**
```
Content-Type: multipart/form-data

Fields:
  file      (required)  Image file — JPEG, PNG, WebP, BMP, or TIFF
  userId    (optional)  Supabase user ID (for usage tracking)

Headers (optional):
  X-Latitude   Latitude for climate data  (default: 20.5937 — India)
  X-Longitude  Longitude for climate data (default: 78.9629 — India)
```

**Response `200 OK`**
```json
{
  "stress_type":      "Fungal Disease",
  "severity":         72,
  "confidence":       0.8914,
  "recommendation":   "Remove and destroy visibly infected plant parts immediately...",
  "climate_alert":    "Current conditions in Mumbai: haze, 34°C, 62% humidity — high temperature stress risk.",
  "low_confidence":   false,
  "demo_mode":        false,
  "supported_subjects": ["leaf", "full plant", "tree", "crop"]
}
```

**Low-confidence response (confidence < 0.40)**
```json
{
  "stress_type":    "Pest Attack",
  "severity":       0,
  "confidence":     0.31,
  "recommendation": "Low confidence — please upload a clearer, well-lit photo of the affected leaf, plant, tree, or crop area for a more reliable diagnosis.",
  "low_confidence": true
}
```

**Error `400 Bad Request`**
```json
{ "error": "Unsupported file type: image/gif. Accepted: image/bmp, image/jpeg, image/png, image/tiff, image/webp" }
```

---

### `GET /api/predict`

Health check — returns service metadata.

```json
{
  "service":            "AI Crop Stress Whisperer",
  "version":            "1.2.0",
  "runtime":            "onnxruntime",
  "status":             "ready",
  "categories":         ["Healthy", "Drought Stress", "Nutrient Deficiency", "Pest Attack", "Fungal Disease"],
  "supported_subjects": ["leaf", "full plant", "tree", "crop"]
}
```

---

### `POST /api/tts`

Generate speech audio from a recommendation string.

```json
// Request
{ "text": "Prediction: Fungal Disease...", "lang": "hi", "locale": "hi-IN" }

// Response: audio/mpeg binary stream
```

---

### `GET /api/plans`

Returns all available subscription plan definitions.

### `POST /api/subscriptions`

Subscribe a user to a plan (requires Supabase JWT).

### `GET /api/usage?userId=...`

Returns current-month analysis count and limit for the user.

---

## 📂 Project Structure

```
.
├── api/                        # Python Vercel Serverless Functions
│   ├── predict.py              # Main inference endpoint (MobileNetV2 ONNX)
│   ├── climate.py              # OpenWeatherMap climate alert module
│   ├── recommender.py          # Stress → treatment recommendation engine
│   ├── supabase_client.py      # Supabase Python client helper
│   ├── requirements.txt        # Python dependencies
│   ├── auth/                   # Auth-related Python endpoints
│   │   ├── login.py
│   │   └── signup.py
│   └── model/                  # Place model.onnx here (not committed to repo)
│
├── app/                        # Next.js App Router pages
│   ├── layout.jsx              # Root layout (Nav + ThemeProvider + TranslationProvider)
│   ├── page.jsx                # Landing page (hero + features + CTA)
│   ├── app/page.jsx            # Diagnostic dashboard (main feature page)
│   ├── auth/                   # Login / sign-up page
│   ├── pricing/                # Subscription plan selector
│   ├── subscription/           # Plan management & usage dashboard
│   ├── marketplace/            # AgriConnect farmer ↔ retailer listings
│   └── api/                    # Next.js API routes
│       ├── auth/               # Supabase auth handlers
│       ├── plans/              # Pricing plan endpoints
│       ├── subscriptions/      # Subscription CRUD
│       ├── usage/              # Monthly usage tracking
│       └── tts/                # ElevenLabs TTS proxy
│
├── components/
│   ├── Navigation.jsx          # Top nav with language switcher + theme toggle
│   ├── TranslationContext.jsx  # i18n provider — 7 languages, ~1400 string keys
│   └── ThemeProvider.jsx       # Dark / light mode context
│
├── lib/
│   └── supabase.js             # Supabase JS client (browser)
│
├── styles/                     # Global CSS (glassmorphism design system)
├── public/                     # Static assets (hero image, icons)
├── supabase-schema.sql         # Full DB schema — run once in Supabase SQL Editor
├── generate_samples.py         # Utility: generate sample images for testing
├── .env.example                # Environment variable template
├── .python-version             # Pins Python 3.12 for Vercel runtime
├── vercel.json                 # Vercel config (Python functions, routing)
├── package.json                # Node dependencies
└── README.md
```

---

## 🚢 Deployment

### Live production

| Environment | URL |
|---|---|
| **Production** | [ai-crop-stress-whisperer.vercel.app](https://ai-crop-stress-whisperer.vercel.app) |

### Deploy your own

```bash
# One-command deploy from CLI
npx vercel deploy --prod --yes
```

Or import the GitHub repo on [vercel.com/new](https://vercel.com/new) and add these environment variables in the Vercel dashboard:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `OPENWEATHERMAP_KEY` | Recommended | Real-time climate alerts |
| `ELEVENLABS_API_KEY` | Recommended | Voice recommendations (TTS) |
| `ELEVENLABS_VOICE_ID` | Recommended | Specific ElevenLabs voice ID |
| `MODEL_PATH` | Optional | Path to `model.onnx` (defaults to `./api/model/model.onnx`) |

**Vercel function config** (`vercel.json`):
- Python functions: 30s max duration, 1024 MB memory
- CORS headers enabled for all origins
- Next.js handles all other routing

---

## 📊 Performance

| Scenario | Latency | Notes |
|---|---|---|
| Cold start | ~3 s | Python ONNX model loaded into memory |
| Warm inference | ~200 ms | Model reused across warm invocations |
| Image preprocessing | ~50 ms | Pillow resize + normalisation |
| Climate API call | ~800 ms | OpenWeatherMap round-trip |
| TTS generation | ~1–3 s | ElevenLabs API |
| PDF export | <100 ms | Client-side jsPDF |

---

## 🔐 Security

- **HTTPS everywhere** — enforced by Vercel's edge network
- **Supabase RLS** — every table has Row Level Security policies; users can only read/write their own data
- **No server-side image storage** — images are inferred and discarded; only metadata is stored
- **JWT-authenticated API routes** — subscription and usage endpoints validate Supabase sessions
- **Environment secrets** — all API keys stored as Vercel environment variables, never committed

---

## 🏆 Hackathon Context

Built during **Code Odyssey Hackathon** by Team 09.

**Key differentiators vs. existing tools:**

| Tool | Gap | Our Advantage |
|---|---|---|
| PictureThis | General plant ID; no stress-specific treatment | Automated 5-class stress + targeted treatment |
| CABI Plantwise | Manual symptom selection; no severity scoring | One-click photo → full diagnosis |
| Existing agri apps | English only; no voice output | 7 languages + ElevenLabs TTS |
| Standalone models | No climate context | Real-time weather risk integration |

---

## 👥 Team

| Member | Role |
|---|---|
| **Akash** | Backend, ML pipeline, Supabase integration, Vercel deployment, TTS, i18n |
| **Prajwal Patil** | Project setup, Frontend, UI/UX design |

---

## 📚 References

- [PlantVillage Dataset](https://plantvillage.psu.edu/) — ~54,000 crop disease images across 38 species
- [MobileNetV2 Paper — Sandler et al., 2018](https://arxiv.org/abs/1801.04381)
- [ONNX Runtime Docs](https://onnxruntime.ai/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [ElevenLabs TTS API](https://elevenlabs.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Serverless Python](https://vercel.com/docs/functions/runtimes/python)

---

## 📄 License

Open-source under the [MIT License](LICENSE).

---

<p align="center">
  <sub>⚠️ Predictions are advisory only — always consult a qualified agronomist for high-stakes field decisions.</sub><br/>
  <sub>🌐 Live at <a href="https://ai-crop-stress-whisperer.vercel.app">ai-crop-stress-whisperer.vercel.app</a> · Built with ❤️ for Code Odyssey Hackathon</sub>
</p>
