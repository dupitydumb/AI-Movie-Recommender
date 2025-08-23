'use client'
import { AlertTriangle, Zap, Crown } from 'lucide-react'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { useAuth } from '@/contexts/AuthContext'

interface UsageLimitBannerProps {
  onUpgrade?: () => void
  onSignIn?: () => void
}

export function UsageLimitBanner({ onUpgrade, onSignIn }: UsageLimitBannerProps) {
  const { usageStats, loading } = useUsageLimit()
  const { user } = useAuth()

  if (loading || !usageStats) return null

  const { dailyUsage, dailyLimit, userType, canMakeRequest } = usageStats
  const isNearLimit = dailyUsage >= dailyLimit * 0.8
  const isAtLimit = !canMakeRequest

  if (userType === 'premium') return null

  const usagePercentage = dailyLimit === -1 ? 0 : (dailyUsage / dailyLimit) * 100

  return (
    <div className={`p-4 mb-6 rounded-xl border ${
      isAtLimit 
        ? 'bg-red-900/20 border-red-500/30' 
        : isNearLimit 
        ? 'bg-orange-900/20 border-orange-500/30' 
        : 'bg-blue-900/20 border-blue-500/30'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {isAtLimit ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Zap className="w-5 h-5 text-blue-400" />
          )}
          
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">
              {isAtLimit ? (
                `Daily limit reached (${dailyUsage}/${dailyLimit === -1 ? '∞' : dailyLimit})`
              ) : (
                `${dailyUsage}/${dailyLimit === -1 ? '∞' : dailyLimit} searches used today`
              )}
            </p>
            
            {dailyLimit !== -1 && (
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isAtLimit 
                      ? 'bg-red-500' 
                      : isNearLimit 
                      ? 'bg-orange-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          {!user && (
            <button
              onClick={onSignIn}
              className="px-4 py-2 text-sm border border-gray-600 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Sign In for More
            </button>
          )}
          
          {(userType === 'guest' || userType === 'free') && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {isAtLimit && (
        <p className="text-gray-400 text-sm mt-2">
          {user ? (
            'Upgrade to premium for unlimited searches'
          ) : (
            'Sign up for a free account to get more daily searches'
          )}
        </p>
      )}
    </div>
  )
}
