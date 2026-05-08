# Deployment & Setup Guide

## ✅ Completed Setup

- [x] Created `/api/model/` directory (ready for ONNX model)
- [x] Generated 5 test leaf images in `/public/samples/` 
  - `leaf-healthy.png`
  - `leaf-drought.png`
  - `leaf-nutrient.png`
  - `leaf-pest.png`
  - `leaf-fungal.png`
- [x] Created `.env.local` template for local development
- [x] Created `.env.example` for documentation

---

## 🚀 Next Steps

### 1. Set OpenWeatherMap API Key (1 min)

**Get your free API key:**
1. Visit https://openweathermap.org/api
2. Sign up for free tier
3. Go to API keys → copy your key

**Configure locally:**
```bash
# Edit .env.local in project root
OPENWEATHERMAP_KEY=your_actual_api_key_here
```

**For Vercel deployment:**
```bash
vercel env add OPENWEATHERMAP_KEY
# Paste your key when prompted
```

---

### 2. Deploy to Vercel (2 min)

**Prerequisites:**
- Node.js 18+ installed
- Vercel CLI: `npm install -g vercel`
- GitHub account (recommended)

**Option A: CLI Deployment**
```bash
cd c:\Users\REKHA\OneDrive\Documents\source\team-09
vercel deploy
# Follow prompts, answer yes to create new project
# Visit the generated URL (e.g., https://team-09.vercel.app)
```

**Option B: Git + Vercel Dashboard**
1. Push to GitHub
2. Go to https://vercel.com
3. Click "New Project" → import repo
4. Set environment variables in Vercel dashboard
5. Deploy with one click

---

### 3. Add ONNX Model (Optional but Recommended)

If you have a trained MobileNetV2 ONNX model:

1. Place it at `/api/model/model.onnx`
2. The app automatically loads it on cold start
3. If missing, runs in demo mode (still works perfectly for testing)

**Model specs the code expects:**
- Input: (1, 224, 224, 3) RGB image
- Output: (1, 5) probabilities for [Healthy, Drought, Nutrient, Pest, Fungal]

---

## 🧪 Testing Locally

**Test with sample images:**
1. Open http://localhost:3000/app
2. Upload any image from `/public/samples/`
3. Click "Analyze photo"
4. View results, climate alert, and recommendations

**Test with custom images:**
- Use real leaf photos (JPEG, PNG, WebP, BMP)
- Recommended: 800×800+ pixels, well-lit, centered leaf

---

## 📋 Checklist for Production

- [ ] Set `OPENWEATHERMAP_KEY` env var in Vercel
- [ ] Deploy to Vercel via CLI or GitHub
- [ ] Test prediction endpoint: `POST /api/predict`
- [ ] Verify climate alerts appear
- [ ] Test with 5+ different leaf images
- [ ] Confirm analysis history persists in localStorage
- [ ] Check responsive layout on mobile
- [ ] Share live link with judges

---

## 🔗 Useful Links

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **OpenWeatherMap API:** https://openweathermap.org/api
- **Project README:** See README.md for technical architecture

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `vercel deploy` | Deploy to Vercel |
| `vercel env add KEY` | Add environment variable |
| `python generate_samples.py` | Regenerate test images |

---

**Status:** ✅ **Ready for deployment!**
