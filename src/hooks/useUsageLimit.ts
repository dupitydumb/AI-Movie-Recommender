import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase'

interface UsageStats {
  dailyUsage: number
  monthlyUsage: number
  dailyLimit: number
  monthlyLimit: number
  canMakeRequest: boolean
  userType: 'guest' | 'free' | 'premium'
}

export function useUsageLimit() {
  const { user } = useAuth()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  const getSessionId = () => {
    if (typeof window === 'undefined') return null
    let sessionId = localStorage.getItem('guest_session_id')
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('guest_session_id', sessionId)
    }
    return sessionId
  }

  const getUserType = async (): Promise<'guest' | 'free' | 'premium'> => {
    if (!user) return 'guest'
    
    // Check user subscription from database
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_type, subscription_status')
      .eq('id', user.id)
      .single()
    
    if (userData?.subscription_type === 'premium' && userData?.subscription_status === 'active') {
      return 'premium'
    }
    
    return 'free' // Default for authenticated users
  }

  const checkUsageLimit = async (): Promise<UsageStats> => {
    const userType = await getUserType()
    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // Get usage limits
    const { data: limits } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_type', userType)
      .single()

    if (!limits) {
      throw new Error('Usage limits not found')
    }

    let dailyUsage = 0
    let monthlyUsage = 0

    if (user) {
      // For authenticated users
      const { data: dailyData } = await supabase
        .from('usage_logs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today)

      const { data: monthlyData } = await supabase
        .from('usage_logs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)

      dailyUsage = dailyData?.length || 0
      monthlyUsage = monthlyData?.length || 0
    } else {
      // For guest users
      const sessionId = getSessionId()
      if (sessionId) {
        const { data: dailyData } = await supabase
          .from('usage_logs')
          .select('id')
          .eq('session_id', sessionId)
          .gte('created_at', today)

        const { data: monthlyData } = await supabase
          .from('usage_logs')
          .select('id')
          .eq('session_id', sessionId)
          .gte('created_at', startOfMonth)

        dailyUsage = dailyData?.length || 0
        monthlyUsage = monthlyData?.length || 0
      }
    }

    const canMakeRequest = (
      (limits.daily_limit === -1 || dailyUsage < limits.daily_limit) &&
      (limits.monthly_limit === -1 || limits.monthly_limit === null || monthlyUsage < limits.monthly_limit)
    )

    return {
      dailyUsage,
      monthlyUsage,
      dailyLimit: limits.daily_limit,
      monthlyLimit: limits.monthly_limit || -1,
      canMakeRequest,
      userType
    }
  }

  const logUsage = async () => {
    const sessionId = user ? null : getSessionId()
    
    await supabase
      .from('usage_logs')
      .insert({
        user_id: user?.id || null,
        session_id: sessionId,
        action_type: 'movie_search'
      })
  }

  useEffect(() => {
    const loadUsageStats = async () => {
      try {
        const stats = await checkUsageLimit()
        setUsageStats(stats)
      } catch (error) {
        console.error('Error checking usage limit:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsageStats()
  }, [user])

  return {
    usageStats,
    loading,
    checkUsageLimit,
    logUsage,
    refreshUsage: async () => {
      const stats = await checkUsageLimit()
      setUsageStats(stats)
    }
  }
}
