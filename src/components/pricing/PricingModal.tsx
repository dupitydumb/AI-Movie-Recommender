'use client'
import { useEffect, useRef } from 'react'
import { X, Crown } from 'lucide-react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const pricingTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Stripe pricing table script
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="pricing-table.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/pricing-table.js'
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  useEffect(() => {
    // Create pricing table element when modal opens
    if (isOpen && pricingTableRef.current) {
      const pricingTable = document.createElement('stripe-pricing-table')
      pricingTable.setAttribute('pricing-table-id', process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || "prctbl_1RzHo584fHm6r9gn7cvZSrIq")
      pricingTable.setAttribute('publishable-key', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51RzGsQ84fHm6r9gn2lQSEcVhv8HtbaqNVPFLQQ47Sul7vI33ujFw7ByiYlqj3j3PwT6dBgDD2FhqEnAM6Z9BbG93005Ult3vTU")
      
      // Clear previous content and add pricing table
      pricingTableRef.current.innerHTML = ''
      pricingTableRef.current.appendChild(pricingTable)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-400 text-lg">
            Unlock unlimited movie discoveries and advanced features
          </p>
        </div>

        {/* Stripe Pricing Table */}
        <div className="w-full" ref={pricingTableRef}>
          {/* Pricing table will be inserted here dynamically */}
        </div>

        {/* Additional Benefits */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mt-8">
          <h4 className="text-white font-semibold mb-4 text-center">
            Why upgrade to Premium?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h5 className="text-gray-300 font-medium mb-1">Smarter Recommendations</h5>
              <p className="text-gray-400 text-xs">
                Advanced AI algorithms for more accurate suggestions
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h5 className="text-gray-300 font-medium mb-1">Unlimited Access</h5>
              <p className="text-gray-400 text-xs">
                No daily or monthly limits on searches
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🚀</div>
              <h5 className="text-gray-300 font-medium mb-1">Exclusive Features</h5>
              <p className="text-gray-400 text-xs">
                Early access to new features and improvements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
