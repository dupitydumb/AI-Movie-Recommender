import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createSupabaseClient } from '@/lib/supabase'

interface SubscriptionInfo {
  subscriptionType: 'free' | 'premium'
  subscriptionStatus: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionExpiresAt: string | null
  loading: boolean
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscriptionType: 'free',
    subscriptionStatus: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionExpiresAt: null,
    loading: true,
  })
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!user) {
      setSubscriptionInfo(prev => ({
        ...prev,
        subscriptionType: 'free',
        subscriptionStatus: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionExpiresAt: null,
        loading: false,
      }))
      return
    }

    const fetchSubscriptionInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_type, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_expires_at')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching subscription info:', error)
          return
        }

        setSubscriptionInfo({
          subscriptionType: data.subscription_type || 'free',
          subscriptionStatus: data.subscription_status,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
          subscriptionExpiresAt: data.subscription_expires_at,
          loading: false,
        })
      } catch (error) {
        console.error('Error in fetchSubscriptionInfo:', error)
        setSubscriptionInfo(prev => ({ ...prev, loading: false }))
      }
    }

    fetchSubscriptionInfo()

    // Set up real-time subscription to user changes
    const subscription = supabase
      .channel('user_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any
          setSubscriptionInfo({
            subscriptionType: newData.subscription_type || 'free',
            subscriptionStatus: newData.subscription_status,
            stripeCustomerId: newData.stripe_customer_id,
            stripeSubscriptionId: newData.stripe_subscription_id,
            subscriptionExpiresAt: newData.subscription_expires_at,
            loading: false,
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase])

  const refreshSubscription = async () => {
    if (!user) return

    setSubscriptionInfo(prev => ({ ...prev, loading: true }))
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_type, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_expires_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error refreshing subscription info:', error)
        return
      }

      setSubscriptionInfo({
        subscriptionType: data.subscription_type || 'free',
        subscriptionStatus: data.subscription_status,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        subscriptionExpiresAt: data.subscription_expires_at,
        loading: false,
      })
    } catch (error) {
      console.error('Error in refreshSubscription:', error)
      setSubscriptionInfo(prev => ({ ...prev, loading: false }))
    }
  }

  const isPremium = subscriptionInfo.subscriptionType === 'premium' && 
                   subscriptionInfo.subscriptionStatus === 'active'

  const isExpired = subscriptionInfo.subscriptionExpiresAt 
    ? new Date(subscriptionInfo.subscriptionExpiresAt) < new Date()
    : false

  return {
    ...subscriptionInfo,
    isPremium: isPremium && !isExpired,
    isExpired,
    refreshSubscription,
  }
}
