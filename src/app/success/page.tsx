'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Crown } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const subscription = useSubscription()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (sessionId) {
      // Wait for subscription to update and verify payment
      const checkSubscription = async () => {
        // Give webhook time to process
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Refresh subscription status
        await subscription.refreshSubscription()
        
        setLoading(false)
        setVerified(true)
      }
      
      checkSubscription()
    } else {
      // No session ID, redirect to home
      router.push('/')
    }
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Activating your premium subscription...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              {subscription.isPremium ? 'Welcome to Premium! 🎉' : 'Payment Successful! 🎉'}
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              {subscription.isPremium 
                ? 'Your subscription has been activated successfully. You now have unlimited access to our AI-powered movie recommendations!'
                : 'Your payment was processed successfully. Your premium features will be activated shortly.'
              }
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-3">
              Premium Features Unlocked:
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>✅ Unlimited movie searches</p>
              <p>✅ Advanced AI recommendations</p>
              <p>✅ Personalized watchlists</p>
              <p>✅ Priority support</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              🎬 Start Discovering Movies
            </Link>
            
            <Link
              href="/dashboard"
              className="block w-full py-3 border border-gray-600 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
