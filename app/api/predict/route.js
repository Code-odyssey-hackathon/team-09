import { NextResponse } from 'next/server'

const STRESS_CATEGORIES = [
  'Healthy',
  'Drought Stress',
  'Nutrient Deficiency',
  'Pest Attack',
  'Fungal Disease',
]

const RECOMMENDATIONS = {
  'Healthy': 'Maintain current irrigation schedule. Monitor weekly for early changes. Keep leaves dry overnight.',
  'Drought Stress': 'Check soil moisture at root depth. Irrigate early morning or late evening. Add mulch to reduce evaporation.',
  'Nutrient Deficiency': 'Run a soil or leaf test. Apply balanced fertilizer after testing. Inspect for uneven growth patterns.',
  'Pest Attack': 'Inspect underside of leaves. Remove heavily infested foliage. Consider targeted bio-control.',
  'Fungal Disease': 'Remove infected leaves safely. Improve airflow between plants. Apply approved fungicide if needed.',
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or BMP image.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Mock prediction - randomly select a stress type
    const randomIndex = Math.floor(Math.random() * STRESS_CATEGORIES.length)
    const stressType = STRESS_CATEGORIES[randomIndex]
    const confidence = Math.random() * 0.4 + 0.6 // Random confidence between 0.6-1.0
    const severity = Math.floor(Math.random() * 100) + 1 // Random severity 1-100

    const response = {
      stress_type: stressType,
      confidence: confidence,
      severity: severity,
      recommendation: RECOMMENDATIONS[stressType],
      climate_alert: 'No extreme weather conditions detected in your area.',
      model_version: 'v1.0',
      processing_time_ms: Math.floor(Math.random() * 500) + 200,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({ status: 'ok' })
}