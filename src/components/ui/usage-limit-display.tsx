"use client";

import React, { useState, useEffect } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, Crown, Loader2, Check, AlertCircle, RefreshCw, CreditCard, Gift } from 'lucide-react';
import { AuthModal } from '@/components/ui/auth-modal';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useSubscription } from '@/hooks/useSubscription';
import { motion, AnimatePresence } from 'framer-motion';

interface UsageLimitDisplayProps {
  showUpgrade?: boolean;
  className?: string;
  compact?: boolean;
  showPayPal?: boolean;
}

export function UsageLimitDisplay({ 
  showUpgrade = true, 
  className, 
  compact = false,
  showPayPal = true 
}: UsageLimitDisplayProps) {
  const { user } = useAuth();
  const { usageData, loading, refreshUsage } = useUsageLimit();
  const { plans, createSubscription } = useSubscription();
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Auto-refresh usage data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUsage();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshUsage]);

  const proPlan = plans?.find(p => p.name === 'Pro Plan');
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (loading) {
    return (
      <Card className={`border-gray-700/50 bg-gray-900/50 backdrop-blur-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            <span className="text-gray-300 text-sm">Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  const percentage = Math.min((usageData.usage_count / usageData.usage_limit) * 100, 100);
  const isLimitReached = !usageData.can_make_request;
  const isNearLimit = percentage >= 75;
  
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getBadgeColor = () => {
    if (isLimitReached) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (isNearLimit) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-green-500/20 text-green-300 border-green-500/30";
  };

  const handleUpgradeClick = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    if (!proPlan) return;
    try {
      setPurchaseLoading(true);
      setPurchaseError(null);
      await createSubscription(proPlan.id, details.id, details.payer?.payer_id);
      setPurchaseSuccess(true);
      await refreshUsage();
      setTimeout(() => {
        setPurchaseSuccess(false);
        setShowPayment(false);
      }, 3000);
    } catch (err: any) {
      setPurchaseError(err.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (compact) {
    return (
      <>
        <div className={`flex items-center gap-3 p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl ${className}`}>
          <div className="flex items-center gap-2">
            {usageData.is_free_tier ? (
              <Gift className="w-4 h-4 text-yellow-400" />
            ) : (
              <Crown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-gray-200 font-medium">
              {usageData.remaining_requests} left
            </span>
          </div>
          
          <div className="flex-1">
            <Progress 
              value={percentage} 
              className="h-2 bg-gray-800"
            />
          </div>

          {showUpgrade && (isLimitReached || isNearLimit) && (
            <Button
              onClick={handleUpgradeClick}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {user ? 'Top Up' : 'Sign In'}
            </Button>
          )}
        </div>
        
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`border-gray-700/50 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-300 ${className}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                {usageData.is_free_tier ? (
                  <>
                    <Gift className="w-4 h-4 text-yellow-400" />
                    Free Daily Limit
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-red-400" />
                    Pro Plan Usage
                  </>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge className={getBadgeColor()}>
                  {usageData.remaining_requests} remaining
                </Badge>
                <Button
                  onClick={refreshUsage}
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <CardDescription className="text-xs text-gray-400">
              {usageData.is_free_tier 
                ? "Free users get 3 AI recommendations per day"
                : `${usageData.usage_limit} total recommendations in your Pro plan`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-4">
            {/* Usage Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">
                  {usageData.usage_count} / {usageData.usage_limit} used
                </span>
                <span className="text-gray-400">
                  {Math.round(percentage)}%
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={percentage} 
                  className="h-3 bg-gray-800 rounded-full overflow-hidden"
                />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-700 ease-out ${getProgressColor()}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {isLimitReached && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200 text-xs">
                      {usageData.is_free_tier 
                        ? "You've reached your daily limit. Upgrade to Pro for 100 more recommendations!"
                        : "You've used all your Pro plan recommendations. Purchase another Pro plan to continue."
                      }
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {!isLimitReached && isNearLimit && usageData.is_free_tier && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200 text-xs">
                      Running low on daily requests! Upgrade to Pro to get 100 more recommendations.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {purchaseSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <Check className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300 text-xs">
                      🎉 Purchase successful! Your quota has been updated with 100 more recommendations.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {showUpgrade && (
              <div className="space-y-3">
                {!user && (isLimitReached || isNearLimit) && (
                  <Button
                    onClick={() => setShowAuth(true)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 rounded-lg transition-all duration-200"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sign In to Upgrade
                  </Button>
                )}

                {user && showPayPal && (isLimitReached || isNearLimit) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={() => setShowPayment(!showPayment)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 rounded-lg transition-all duration-200"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isLimitReached ? 'Get 100 More - $10' : 'Top Up Now - $10'}
                    </Button>
                  </motion.div>
                )}

                {!isLimitReached && !isNearLimit && usageData.is_free_tier && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-2">Want unlimited recommendations?</p>
                    <Button
                      onClick={handleUpgradeClick}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* PayPal Payment Modal */}
      <AnimatePresence>
        {showPayment && user && proPlan && paypalClientId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                <p className="text-gray-400 text-sm">Get 100 more AI movie recommendations</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-3xl font-bold text-white">${proPlan.price}</span>
                  <span className="text-gray-400">one-time</span>
                </div>
              </div>

              {purchaseError && (
                <Alert className="border-red-500/50 bg-red-500/10 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200 text-xs">
                    {purchaseError}
                  </AlertDescription>
                </Alert>
              )}

              {!purchaseLoading && !purchaseSuccess && (
                <div className="space-y-4">
                  <PayPalScriptProvider options={{ clientId: paypalClientId, currency: proPlan.currency }}>
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                      createOrder={(data, actions) => {
                        setPurchaseError(null);
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              value: proPlan.price.toString(),
                              currency_code: proPlan.currency
                            },
                            description: `${proPlan.name} - ${proPlan.usage_limit} AI movie recommendations`
                          }],
                          intent: 'CAPTURE'
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (actions.order) {
                          const details = await actions.order.capture();
                          await handlePaymentSuccess(details);
                        }
                      }}
                      onError={(err) => {
                        setPurchaseError('Payment failed. Please try again.');
                        console.error('PayPal error:', err);
                      }}
                      disabled={purchaseLoading}
                    />
                  </PayPalScriptProvider>
                  
                  <div className="text-xs text-center text-gray-500">
                    Secure payment powered by PayPal
                  </div>
                </div>
              )}

              {purchaseLoading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-red-400 mx-auto mb-4" />
                  <p className="text-gray-300">Processing your payment...</p>
                </div>
              )}

              <Button
                onClick={() => setShowPayment(false)}
                variant="outline"
                className="w-full mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
