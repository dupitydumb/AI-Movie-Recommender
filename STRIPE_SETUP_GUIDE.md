# Stripe Environment Variables Setup

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_your_pricing_table_id_here

# Supabase Configuration (if not already added)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Stripe Dashboard Setup

1. **Create Products and Prices** in Stripe Dashboard
2. **Configure Pricing Table** with your products
3. **Set up Webhook Endpoint** pointing to: `https://yourdomain.com/api/stripe/webhook`
4. **Configure Webhook Events** to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Important Notes

- Make sure your webhook endpoint is accessible and returns 200 status
- Test webhooks using Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Verify webhook signatures for security
- Set up proper error handling and logging
