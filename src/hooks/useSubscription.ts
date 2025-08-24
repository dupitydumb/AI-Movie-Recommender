"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  usage_limit: number;
  description: string;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  paypal_subscription_id: string;
  paypal_payment_id: string;
  usage_remaining: number;
  is_active: boolean;
  expires_at: string;
  subscription_plans: SubscriptionPlan;
}

export function useSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('usage_remaining', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createSubscription = async (planId: string, paypalPaymentId: string, paypalPayerId?: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Create subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          paypal_payment_id: paypalPaymentId,
          usage_remaining: plan.usage_limit,
          is_active: true
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Record payment transaction
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          paypal_payment_id: paypalPaymentId,
          paypal_payer_id: paypalPayerId,
          amount: plan.price,
          currency: plan.currency,
          status: 'completed',
          plan_id: planId,
          subscription_id: subscription.id
        });

      if (transactionError) throw transactionError;

      await fetchUserSubscription();
      return subscription;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchUserSubscription();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPlans(),
      fetchUserSubscription()
    ]).finally(() => setLoading(false));
  }, [user]);

  return {
    plans,
    userSubscription,
    loading,
    error,
    createSubscription,
    cancelSubscription,
    refreshSubscription: fetchUserSubscription
  };
}