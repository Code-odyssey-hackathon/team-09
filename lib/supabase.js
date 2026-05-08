import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Usage tracking
  async getUserUsage(userId) {
    const monthKey = new Date().toISOString().slice(0, 7) // YYYY-MM format

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_key', monthKey)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    if (!data) {
      // Create new usage record
      const { data: newData, error: insertError } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          month_key: monthKey,
          analyses_count: 0
        })
        .select()
        .single()

      if (insertError) throw insertError
      return newData
    }

    return data
  },

  async incrementUsage(userId) {
    const monthKey = new Date().toISOString().slice(0, 7)

    const { data, error } = await supabase.rpc('increment_usage_count', {
      p_user_id: userId,
      p_month_key: monthKey
    })

    if (error) throw error
    return data
  },

  // Subscription plans
  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price')

    if (error) throw error
    return data
  },

  // User subscriptions
  async getUserSubscription(userId) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Analysis history
  async saveAnalysis(userId, analysisData) {
    const { data, error } = await supabase
      .from('analysis_history')
      .insert({
        user_id: userId,
        ...analysisData
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserAnalysisHistory(userId, limit = 50) {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}