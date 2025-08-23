'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { useSubscription } from '@/hooks/useSubscription'
import { Crown, BarChart, CreditCard, Settings, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PricingModal } from '@/components/pricing/PricingModal'
import { createSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { usageStats, loading: usageLoading } = useUsageLimit()
  const subscription = useSubscription()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single()
    
    setUserProfile(data)
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error opening customer portal:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to access your dashboard.</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const getSubscriptionStatusIcon = () => {
    if (subscription.loading) return <Clock className="w-5 h-5 text-gray-400" />
    if (subscription.isPremium) return <CheckCircle className="w-5 h-5 text-green-400" />
    return <XCircle className="w-5 h-5 text-red-400" />
  }

  const getSubscriptionStatusText = () => {
    if (subscription.loading) return 'Loading...'
    if (subscription.isPremium) return 'Active'
    if (subscription.subscriptionStatus === 'canceled') return 'Canceled'
    if (subscription.subscriptionStatus === 'past_due') return 'Past Due'
    return 'Inactive'
  }

  const getSubscriptionStatusColor = () => {
    if (subscription.loading) return 'bg-gray-700 text-gray-300'
    if (subscription.isPremium) return 'bg-green-500/20 text-green-400'
    if (subscription.subscriptionStatus === 'past_due') return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage your account and subscription</p>
          </div>

          {/* Subscription Status */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Crown className={`w-6 h-6 ${subscription.isPremium ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <h2 className="text-xl font-semibold">
                    {subscription.isPremium ? 'Premium Plan' : 'Free Plan'}
                  </h2>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getSubscriptionStatusColor()}`}>
                    {getSubscriptionStatusIcon()}
                    {getSubscriptionStatusText()}
                  </div>
                </div>
                
                <p className="text-gray-300">
                  {subscription.isPremium ? (
                    'You have unlimited access to all premium features'
                  ) : (
                    'Upgrade to premium for unlimited searches and advanced features'
                  )}
                </p>

                {subscription.isPremium && subscription.subscriptionExpiresAt && (
                  <p className="text-sm text-gray-400">
                    Next billing: {new Date(subscription.subscriptionExpiresAt).toLocaleDateString()}
                  </p>
                )}

                {subscription.isExpired && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">
                      Your subscription has expired. Please renew to continue using premium features.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {subscription.isPremium ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={() => setPricingModalOpen(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          {!usageLoading && usageStats && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BarChart className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold">Usage Statistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-gray-300 font-medium">Daily Usage</p>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          {usageStats.dailyUsage} / {usageStats.dailyLimit === -1 ? '∞' : usageStats.dailyLimit}
                        </span>
                        <span className="text-sm text-gray-400">
                          {usageStats.dailyLimit === -1 ? 'Unlimited' : 
                           `${Math.round((usageStats.dailyUsage / usageStats.dailyLimit) * 100)}%`}
                        </span>
                      </div>
                      {usageStats.dailyLimit !== -1 && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((usageStats.dailyUsage / usageStats.dailyLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-gray-300 font-medium">Monthly Usage</p>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          {usageStats.monthlyUsage} / {usageStats.monthlyLimit === -1 ? '∞' : usageStats.monthlyLimit}
                        </span>
                        <span className="text-sm text-gray-400">
                          {usageStats.monthlyLimit === -1 ? 'Unlimited' :
                           `${Math.round((usageStats.monthlyUsage / usageStats.monthlyLimit) * 100)}%`}
                        </span>
                      </div>
                      {usageStats.monthlyLimit !== -1 && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min((usageStats.monthlyUsage / usageStats.monthlyLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold">Account Information</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Member since:</span>
                  <span className="text-white">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>

                {userProfile?.subscription_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan:</span>
                    <span className="text-white capitalize">
                      {userProfile.subscription_type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <PricingModal 
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  )
}
