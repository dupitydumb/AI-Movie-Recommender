"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  Crown, 
  Gift,
  CreditCard,
  RefreshCw,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface UsageHistory {
  usage_date: string;
  usage_count: number;
}

export function UsageAnalytics() {
  const { user } = useAuth();
  const { usageData, refreshUsage } = useUsageLimit();
  const { userSubscription, plans } = useSubscription();
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageHistory();
    }
  }, [user]);

  const fetchUsageHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('usage_date, usage_count')
        .eq('user_id', user.id)
        .order('usage_date', { ascending: false })
        .limit(7);

      if (error) throw error;
      setUsageHistory(data || []);
    } catch (error) {
      console.error('Error fetching usage history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-gray-700/50 bg-gray-900/50">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const todayUsage = usageHistory.find(h => h.usage_date === new Date().toISOString().split('T')[0]);
  const weeklyUsage = usageHistory.reduce((sum, h) => sum + h.usage_count, 0);
  const averageDaily = weeklyUsage / Math.max(usageHistory.length, 1);

  const proPlan = plans?.find(p => p.name === 'Pro Plan');

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gray-700/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Today's Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">
                  {todayUsage?.usage_count || 0}
                </span>
                <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                  {usageData?.usage_limit || 3} limit
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-700/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Weekly Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">
                  {weeklyUsage}
                </span>
                <Badge variant="outline" className="text-green-400 border-green-400/30">
                  {averageDaily.toFixed(1)} avg/day
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gray-700/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                {usageData?.is_free_tier ? (
                  <Gift className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Crown className="w-4 h-4 text-red-400" />
                )}
                Plan Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">
                  {usageData?.is_free_tier ? 'Free' : 'Pro'}
                </span>
                <Badge 
                  className={
                    usageData?.is_free_tier 
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }
                >
                  {usageData?.remaining_requests} left
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Usage Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-700/50 bg-gray-900/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Current Usage</CardTitle>
                <CardDescription className="text-gray-400">
                  Your AI recommendation usage and limits
                </CardDescription>
              </div>
              <Button
                onClick={refreshUsage}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {usageData?.usage_count} / {usageData?.usage_limit} requests used
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round(((usageData?.usage_count || 0) / (usageData?.usage_limit || 1)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((usageData?.usage_count || 0) / (usageData?.usage_limit || 1)) * 100}
                  className="h-3 bg-gray-800"
                />
              </div>

              {/* Upgrade Section */}
              {usageData?.is_free_tier && (
                <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white mb-1">Upgrade to Pro</h4>
                      <p className="text-sm text-gray-300">
                        Get 100 AI recommendations for just ${proPlan?.price || 10}
                      </p>
                    </div>
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Subscription Info */}
              {userSubscription && (
                <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-red-400" />
                      <div>
                        <h4 className="font-semibold text-white">Pro Plan Active</h4>
                        <p className="text-sm text-gray-400">
                          {userSubscription.usage_remaining} recommendations remaining
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage History */}
      {usageHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-gray-700/50 bg-gray-900/30">
            <CardHeader>
              <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Your usage over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageHistory.map((day, index) => (
                  <div 
                    key={day.usage_date}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        {new Date(day.usage_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {day.usage_count} requests
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
