<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/herb_1f33f.png" width="72" alt="herb icon"/>
</p>

<h1 align="center">AI Crop Stress Whisperer</h1>

<p align="center">
  <strong>Upload a leaf photo → get instant, AI-powered crop stress diagnosis + actionable treatment advice.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#api-reference">API Reference</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#team">Team</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.11-3776ab?logo=python&logoColor=white" alt="Python 3.11"/>
  <img src="https://img.shields.io/badge/TensorFlow-2.15-ff6f00?logo=tensorflow&logoColor=white" alt="TensorFlow 2.15"/>
  <img src="https://img.shields.io/badge/deploy-Vercel-000?logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/model-MobileNetV2-22c55e" alt="MobileNetV2"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"/>
</p>

---

## Problem Statement

Crop stress — caused by drought, nutrient deficiencies, pests, and fungal infections — is one of the leading causes of yield loss in agriculture worldwide. Smallholder farmers often lack timely access to expert diagnosis, resulting in delayed treatment, unnecessary pesticide use, and reduced harvests. **AI Crop Stress Whisperer** bridges this gap by placing a deep-learning agronomist in every farmer's pocket.

---

## Features

| Feature | Description |
|---|---|
| 🔬 **5-Class Stress Detection** | Classifies leaf images into **Healthy**, **Drought Stress**, **Nutrient Deficiency**, **Pest Attack**, or **Fungal Disease** using MobileNetV2 fine-tuned on PlantVillage |
| 📊 **Severity Scoring** | Returns a 0–100 severity score calibrated per stress category |
| 💊 **Actionable Recommendations** | Provides expert-level, stress-specific treatment advice (irrigation, fertilizers, pesticides, fungicides) |
| 🌦️ **Real-Time Climate Alerts** | Integrates OpenWeatherMap to surface weather-based crop risk warnings (heat, frost, humidity, wind) |
| 📱 **Drag-and-Drop UI** | Clean, responsive single-page interface with image preview, animated severity ring, and confidence bar |
| ⚡ **Serverless Architecture** | Zero-ops deployment on Vercel — Python API auto-scales from zero to handle inference at the edge |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│         public/index.html  (Vanilla JS + CSS)                │
│   ┌──────────┐  ┌───────────┐  ┌──────────────────────────┐  │
│   │ Drag/Drop│→ │ Preview   │→ │ POST /api/predict         │  │
│   │ Upload   │  │ + Analyse │  │ (multipart/form-data)     │  │
│   └──────────┘  └───────────┘  └──────────┬───────────────┘  │
└──────────────────────────────────────────────┬───────────────┘
                                               │
┌──────────────────────────────────────────────▼───────────────┐
│                    Vercel Serverless API                      │
│                                                              │
│   api/predict.py ─────────────────────────────────────────   │
│   │  1. Parse multipart body → extract image                 │
│   │  2. Validate content type (JPEG/PNG/WebP/BMP/TIFF)       │
│   │  3. Preprocess: PIL → resize 224×224 → normalise [0,1]   │
│   │  4. MobileNetV2 inference (TensorFlow-cpu)               │
│   │  5. Derive stress type + severity + confidence           │
│   │  6. Attach recommendation + climate alert                │
│   └──────────────────────────────────────────────────────    │
│                                                              │
│   api/recommender.py ── Stress → treatment advice map        │
│   api/climate.py ─────── OpenWeatherMap → crop risk alert    │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Database** | Supabase (PostgreSQL + Auth + Real-time) |
| **ML Model** | MobileNetV2 (ImageNet pre-trained, PlantVillage fine-tuned) |
| **Inference** | TensorFlow 2.15 (CPU) + NumPy + Pillow |
| **Backend** | Python 3.11 + Next.js Serverless Functions (Vercel) |
| **Frontend** | Next.js + React, Inter + Space Grotesk fonts |
| **Authentication** | Supabase Auth |
| **Climate API** | OpenWeatherMap Current Weather (free tier) |
| **Text-to-Speech** | ElevenLabs API |
| **Deployment** | Vercel (auto-scaling, edge network) |

---

## Database Schema

The app uses Supabase (PostgreSQL) to store:

- **User Profiles** (`profiles`) - Extended user information
- **Usage Tracking** (`usage_tracking`) - Monthly analysis counts per user
- **Subscription Plans** (`subscription_plans`) - Available pricing tiers
- **User Subscriptions** (`user_subscriptions`) - Active user plans
- **Analysis History** (`analysis_history`) - Past crop stress diagnoses

**Key Features:**
- Row Level Security (RLS) enabled for data privacy
- Automatic user profile creation on signup
- Monthly usage reset logic
- Subscription-based access control

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Supabase account** (for database functionality)
- *(Optional)* [OpenWeatherMap API key](https://openweathermap.org/api) for climate alerts
- *(Optional)* [ElevenLabs API key](https://elevenlabs.io) for text-to-speech

### Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Go to your project's SQL Editor** and run the schema from `supabase-schema.sql`
3. **Get your project credentials** from Settings → API
4. **Set up environment variables** by copying `.env.example` to `.env.local` and filling in your values:

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and keys
```

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Code-odyssey-hackathon/team-09.git
cd team-09

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Database Setup above)

# 4. Run the development server
npx vercel dev
```

The app will be available at `http://localhost:3000`.

### Usage

1. Open the app in your browser
2. **Drag & drop** a leaf photo onto the upload area (or click to browse)
3. Click **🔍 Analyse Crop**
4. Review the results:
   - **Stress type** with colour-coded severity ring
   - **Severity score** (0–100)
   - **Confidence level** with animated progress bar
   - **Treatment recommendation** tailored to the detected stress
   - **Climate alert** based on your location's current weather

---

## API Reference

### `POST /api/predict`

Upload a leaf image for AI-powered stress diagnosis.

**Request**
```
Content-Type: multipart/form-data

Fields:
  file    (required)  — Leaf image (JPEG, PNG, WebP, BMP, or TIFF)

Headers (optional):
  X-Latitude   — Latitude for climate data (defaults to 20.5937)
  X-Longitude  — Longitude for climate data (defaults to 78.9629)
```

**Response** — `200 OK`
```json
{
  "stress_type": "Fungal Disease",
  "severity": 72,
  "confidence": 0.8914,
  "recommendation": "Remove and destroy visibly infected plant parts...",
  "climate_alert": "Current conditions in Mumbai: haze, 34°C, 62% humidity...",
  "low_confidence": false
}
```

**Stress Categories**
| Category | Severity Range | Description |
|---|---|---|
| `Healthy` | 0 | No stress detected |
| `Drought Stress` | 40–95 | Water deficit indicators |
| `Nutrient Deficiency` | 30–80 | Macro/micronutrient shortage |
| `Pest Attack` | 50–100 | Insect or pest damage |
| `Fungal Disease` | 45–95 | Fungal pathogen infection |

### `GET /api/predict`

Health check — returns service status and supported categories.

### `GET /api/climate?lat=20.59&lon=78.96`

Returns a standalone climate alert for the given coordinates.

---

## Project Structure

```
.
├── api/
│   ├── predict.py         # Main inference endpoint (MobileNetV2)
│   ├── climate.py         # OpenWeatherMap climate alert module
│   ├── recommender.py     # Stress → treatment recommendation engine
│   └── requirements.txt   # Python dependencies
├── public/
│   └── index.html         # Single-page frontend (drag-drop + results UI)
├── vercel.json            # Vercel deployment configuration
├── package.json           # Node.js dev dependencies (Vercel CLI)
└── README.md
```

---

## Deployment

### Vercel (Recommended)

The project is pre-configured for one-click Vercel deployment:

1. Push to GitHub (already done ✓)
2. Import the repo on [vercel.com/new](https://vercel.com/new)
3. Add environment variable:
   - `OPENWEATHERMAP_KEY` → your API key
   - *(Optional)* `MODEL_PATH` → path to fine-tuned model weights
4. Deploy 🚀

**Configuration highlights** (`vercel.json`):
- Python functions: 30s max duration, 1024 MB memory
- CORS headers enabled for cross-origin requests
- SPA fallback routing to `index.html`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHERMAP_KEY` | Optional | OpenWeatherMap API key for real-time climate alerts |
| `MODEL_PATH` | Optional | Path to fine-tuned `.keras` / SavedModel directory (defaults to `./api/model/`) |

---

## Model Details

- **Architecture**: MobileNetV2 (lightweight, mobile-optimised CNN)
- **Base weights**: ImageNet (transfer learning)
- **Classification head**: GlobalAveragePooling → Dropout(0.3) → Dense(128, ReLU) → Dropout(0.2) → Dense(5, Softmax)
- **Input**: 224 × 224 × 3 RGB image, normalised to [0, 1]
- **Dataset**: [PlantVillage](https://plantvillage.psu.edu/) (open-access crop disease dataset)
- **Confidence threshold**: 0.4 — predictions below this trigger a "low confidence" advisory

---

## Team

Built with ❤️ during **Code Odyssey Hackathon**.

| Member | Role |
|---|---|
| **Akash** | Backend, ML Pipeline, Deployment |
| **Prajwal Patil** | Project Setup, Frontend |

---

## License

This project is open-source under the [MIT License](LICENSE).

---

<p align="center">
  <sub>⚠️ Predictions are advisory only — consult a qualified agronomist for field-level decisions.</sub>
</p>
