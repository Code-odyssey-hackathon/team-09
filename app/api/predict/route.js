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
        const subscriptionResponse = await fetch(`${request.nextUrl.origin}/api/subscriptions?userId=${userId}`)
        const subscriptionData = await subscriptionResponse.json()

        if (subscriptionData.subscription) {
          const plan = subscriptionData.subscription.plan

          // Get current usage
          const usageResponse = await fetch(`${request.nextUrl.origin}/api/usage?userId=${userId}`)
          const usageData = await usageResponse.json()

          // Check if user has exceeded their limit
          if (plan.limits.analysesPerMonth !== -1 && usageData.usage.analysesCount >= plan.limits.analysesPerMonth) {
            return NextResponse.json(
              {
                error: 'Monthly analysis limit exceeded. Please upgrade your plan or wait for the next billing cycle.',
                limit: plan.limits.analysesPerMonth,
                used: usageData.usage.analysesCount,
                planName: plan.name
              },
              { status: 429 }
            )
          }
        } else {
          // Free plan check
          const usageResponse = await fetch(`${request.nextUrl.origin}/api/usage?userId=${userId}`)
          const usageData = await usageResponse.json()

          if (usageData.usage.analysesCount >= 5) { // Free plan limit
            return NextResponse.json(
              {
                error: 'Free plan limit exceeded. Please upgrade to continue using the service.',
                limit: 5,
                used: usageData.usage.analysesCount,
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

    // Record usage for authenticated users
    if (userId !== 'anonymous') {
      try {
        await fetch(`${request.nextUrl.origin}/api/usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      } catch (error) {
        console.error('Usage recording error:', error)
        // Continue with analysis if usage recording fails
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