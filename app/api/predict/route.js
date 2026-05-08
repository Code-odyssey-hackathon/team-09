import { NextResponse } from 'next/server'
import { db } from '../../../lib/supabase.js'

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
    const userId = formData.get('userId') || 'anonymous'

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

    // Check subscription limits for authenticated users
    if (userId !== 'anonymous') {
      try {
        // Get user's subscription
        const subscription = await db.getUserSubscription(userId)
        const usage = await db.getUserUsage(userId)

        if (subscription) {
          const plan = subscription.subscription_plans

          // Check if user has exceeded their limit
          if (plan.limits.analysesPerMonth !== -1 && usage.analyses_count >= plan.limits.analysesPerMonth) {
            return NextResponse.json(
              {
                error: 'Monthly analysis limit exceeded. Please upgrade your plan or wait for the next billing cycle.',
                limit: plan.limits.analysesPerMonth,
                used: usage.analyses_count,
                planName: plan.name
              },
              { status: 429 }
            )
          }
        } else {
          // Free plan check (5 analyses per month)
          if (usage.analyses_count >= 5) {
            return NextResponse.json(
              {
                error: 'Free plan limit exceeded. Please upgrade to continue using the service.',
                limit: 5,
                used: usage.analyses_count,
                planName: 'Free Plan'
              },
              { status: 429 }
            )
          }
        }
      } catch (error) {
        console.error('Subscription check error:', error)
        // Continue with analysis if subscription check fails
      }
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

    // Record usage and save analysis for authenticated users
    if (userId !== 'anonymous') {
      try {
        await db.incrementUsage(userId)
        await db.saveAnalysis(userId, {
          stress_type: stressType,
          severity: severity,
          confidence: confidence,
          recommendation: response.recommendation,
          climate_alert: response.climate_alert,
          inference_time_ms: response.processing_time_ms
        })
      } catch (error) {
        console.error('Database update error:', error)
        // Continue with response if database update fails
      }
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