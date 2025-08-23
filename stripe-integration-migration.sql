-- Stripe Integration Database Updates
-- Run this SQL in your Supabase SQL Editor

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_type, subscription_status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_session ON usage_logs(user_id, session_id, created_at);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to check subscription status
CREATE OR REPLACE FUNCTION is_premium_active(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id_param 
        AND subscription_type = 'premium' 
        AND subscription_status = 'active'
        AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for the payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
FOR SELECT USING (auth.uid() = user_id);

-- Create a view for subscription analytics (optional)
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    subscription_type,
    subscription_status,
    COUNT(*) as user_count,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM users
WHERE subscription_type IS NOT NULL
GROUP BY subscription_type, subscription_status;

-- Grant appropriate permissions
GRANT SELECT ON subscription_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION is_premium_active TO authenticated;

-- Add constraint to ensure valid subscription types
ALTER TABLE users ADD CONSTRAINT check_subscription_type 
CHECK (subscription_type IN ('free', 'premium'));

-- Add constraint to ensure valid subscription statuses
ALTER TABLE users ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing', 'unpaid'));

COMMENT ON TABLE users IS 'User profiles with subscription information';
COMMENT ON TABLE payments IS 'Payment records from Stripe';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID for recurring billing';
COMMENT ON COLUMN users.subscription_expires_at IS 'When the current subscription period ends';
