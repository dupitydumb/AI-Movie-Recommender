"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface UsageData {
  id: string;
  usage_count: number;
  usage_limit: number;
  can_make_request: boolean;
  remaining_requests: number;
  is_free_tier: boolean;
}

export function useUsageLimit() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  const checkUsageLimit = async () => {
    try {
      setLoading(true);
      setError(null);

      let userIP = null;
      if (!user) {
        userIP = await getUserIP();
      }

      const { data, error } = await supabase.rpc('get_or_create_usage', {
        p_user_id: user?.id || null,
        p_user_ip: userIP
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const usage = data[0];
        const remaining = Math.max(0, usage.usage_limit - usage.usage_count);
        const canMakeRequest = remaining > 0;
        
        // Check if user has active subscription
        let isFreeTier = true;
        if (user) {
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .gt('usage_remaining', 0)
            .single();
          
          if (subscription) {
            isFreeTier = false;
          }
        }

        setUsageData({
          id: usage.id,
          usage_count: usage.usage_count,
          usage_limit: usage.usage_limit,
          can_make_request: canMakeRequest,
          remaining_requests: remaining,
          is_free_tier: isFreeTier
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    try {
      let userIP = null;
      if (!user) {
        userIP = await getUserIP();
      }

      const { error } = await supabase.rpc('increment_usage', {
        p_user_id: user?.id || null,
        p_user_ip: userIP
      });

      if (error) {
        throw error;
      }

      // If user has subscription, decrement subscription usage
      if (user && usageData && !usageData.is_free_tier) {
        await supabase.rpc('decrement_subscription_usage', {
          p_user_id: user.id
        });
      }

      // Refresh usage data
      await checkUsageLimit();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    checkUsageLimit();
    // Listen for global usage updates dispatched from API responses
    const handler = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      setUsageData(prev => ({
        id: prev?.id || 'local',
        usage_count: detail.usage_count ?? (detail.usage_limit - detail.remaining_requests),
        usage_limit: detail.usage_limit,
        can_make_request: detail.remaining_requests > 0,
        remaining_requests: detail.remaining_requests,
        is_free_tier: detail.is_free_tier
      }));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('usage-updated', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('usage-updated', handler as EventListener);
      }
    };
  }, [user]);

  return {
    usageData,
    loading,
    error,
    incrementUsage,
    refreshUsage: checkUsageLimit
  };
}