-- Add usage tracking and payment tables

-- Create usage tracking table
CREATE TABLE public.user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_ip TEXT, -- For anonymous users
  usage_date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, usage_date),
  UNIQUE(user_ip, usage_date)
);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  usage_limit INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  paypal_subscription_id TEXT,
  paypal_payment_id TEXT,
  usage_remaining INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  paypal_payment_id TEXT UNIQUE NOT NULL,
  paypal_payer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- completed, pending, failed, cancelled
  plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_usage_user_id ON public.user_usage(user_id);
CREATE INDEX idx_user_usage_user_ip ON public.user_usage(user_ip);
CREATE INDEX idx_user_usage_date ON public.user_usage(usage_date);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_paypal_id ON public.payment_transactions(paypal_payment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_usage
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to get or create daily usage
CREATE OR REPLACE FUNCTION public.get_or_create_usage(p_user_id UUID DEFAULT NULL, p_user_ip TEXT DEFAULT NULL)
RETURNS TABLE(id UUID, usage_count INTEGER, usage_limit INTEGER) AS $$
DECLARE
  current_usage INTEGER := 0;
  usage_record_id UUID;
  daily_limit INTEGER := 3; -- Free tier daily limit
  user_subscription RECORD;
BEGIN
  -- Check if user has an active subscription
  IF p_user_id IS NOT NULL THEN
    SELECT us.usage_remaining, us.is_active INTO user_subscription
    FROM public.user_subscriptions us
    WHERE us.user_id = p_user_id 
      AND us.is_active = true 
      AND (us.expires_at IS NULL OR us.expires_at > NOW())
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- If user has active subscription with remaining usage
    IF user_subscription.is_active AND user_subscription.usage_remaining > 0 THEN
      daily_limit := user_subscription.usage_remaining;
    END IF;
  END IF;

  -- Get or create usage record
  IF p_user_id IS NOT NULL THEN
    -- For authenticated users
    INSERT INTO public.user_usage (user_id, usage_date, usage_count)
    VALUES (p_user_id, CURRENT_DATE, 0)
    ON CONFLICT (user_id, usage_date) 
    DO UPDATE SET updated_at = NOW()
    RETURNING public.user_usage.id, public.user_usage.usage_count INTO usage_record_id, current_usage;
  ELSE
    -- For anonymous users (IP-based)
    INSERT INTO public.user_usage (user_ip, usage_date, usage_count)
    VALUES (p_user_ip, CURRENT_DATE, 0)
    ON CONFLICT (user_ip, usage_date) 
    DO UPDATE SET updated_at = NOW()
    RETURNING public.user_usage.id, public.user_usage.usage_count INTO usage_record_id, current_usage;
  END IF;

  RETURN QUERY SELECT usage_record_id, current_usage, daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID DEFAULT NULL, p_user_ip TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  limit_reached BOOLEAN := false;
BEGIN
  IF p_user_id IS NOT NULL THEN
    UPDATE public.user_usage 
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE
    RETURNING usage_count INTO current_count;
  ELSE
    UPDATE public.user_usage 
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE user_ip = p_user_ip AND usage_date = CURRENT_DATE
    RETURNING usage_count INTO current_count;
  END IF;

  RETURN current_count IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement subscription usage
CREATE OR REPLACE FUNCTION public.decrement_subscription_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_subscriptions 
  SET usage_remaining = usage_remaining - 1, updated_at = NOW()
  WHERE user_id = p_user_id 
    AND is_active = true 
    AND usage_remaining > 0
    AND (expires_at IS NULL OR expires_at > NOW());
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription plan
INSERT INTO public.subscription_plans (name, price, usage_limit, description) 
VALUES ('Pro Plan', 10.00, 100, '100 AI movie recommendations for $10');

-- Triggers for updated_at
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
