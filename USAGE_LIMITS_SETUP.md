# Usage Limits & Payment Integration Setup

This implementation adds comprehensive usage limits, Supabase authentication, and Stripe payment integration to your Movie Recommender app.

## 🚀 Features Added

- ✅ **User Authentication** with Supabase (email/password + Google OAuth)
- ✅ **Usage Tracking** for guests, free users, and premium users
- ✅ **Usage Limits** with daily/monthly restrictions
- ✅ **Stripe Payment Integration** for premium subscriptions
- ✅ **Real-time Usage Monitoring** with React hooks
- ✅ **Responsive UI Components** for auth and billing
- ✅ **Database Security** with Row Level Security (RLS)

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database setup** by copying and pasting the contents of `supabase-setup.sql` into your Supabase SQL editor
3. **Enable Google OAuth** (optional):
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable Google provider
   - Add your OAuth credentials

### 3. Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)
2. **Create products and prices**:
   - Create a "Premium Monthly" product with a recurring monthly price
   - Create a "Premium Yearly" product with a recurring yearly price
   - Copy the price IDs
3. **Update price IDs** in `src/lib/stripe.ts`:
   ```typescript
   export const PRICE_IDS = {
     PREMIUM_MONTHLY: 'price_your_monthly_price_id',
     PREMIUM_YEARLY: 'price_your_yearly_price_id',
   }
   ```
4. **Set up webhooks**:
   - Add webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 4. Environment Variables

Update your `.env.local` file:

```env
# Existing
API_KEY=your_existing_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 5. Test the Implementation

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test user flows**:
   - Visit your app as a guest (3 searches/day limit)
   - Sign up for a free account (10 searches/day limit)
   - Test premium upgrade flow
   - Test usage limit enforcement

## 📊 Usage Limits

| User Type | Daily Limit | Monthly Limit | Features |
|-----------|-------------|---------------|----------|
| **Guest** | 3 | 10 | Basic recommendations |
| **Free** | 10 | 50 | Basic recommendations + account |
| **Premium** | ∞ | ∞ | All features + unlimited searches |

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** with Supabase
- **Webhook signature verification** for Stripe
- **Input validation** and error handling
- **Rate limiting** per user type

## 🎨 UI Components

### New Components Added:
- `AuthModal` - Sign in/up modal with Google OAuth
- `PricingModal` - Premium upgrade modal with billing toggle
- `UsageLimitBanner` - Shows current usage and limits
- Updated `Header` - User menu and authentication status
- `Dashboard` - User account management page
- `Success` - Payment success page

## 🔄 User Journey

1. **Guest User**:
   - Arrives at site → Can make 3 searches
   - Hits limit → Prompted to sign up
   - Signs up → Gets 10 daily searches

2. **Free User**:
   - Signs in → Can make 10 searches/day
   - Hits limit → Prompted to upgrade
   - Upgrades → Gets unlimited searches

3. **Premium User**:
   - Enjoys unlimited searches
   - Can manage subscription via dashboard
   - Can cancel/update via Stripe Customer Portal

## 🛠️ Customization

### Adjusting Usage Limits

Update limits in your Supabase database:

```sql
UPDATE public.usage_limits 
SET daily_limit = 5, monthly_limit = 25 
WHERE user_type = 'free';
```

### Adding New User Types

1. Add to the database enum
2. Update TypeScript types
3. Add logic in `useUsageLimit` hook

### Styling

All components use Tailwind CSS and can be customized by updating the className props.

## 🚨 Important Notes

1. **Test with Stripe test keys** before going live
2. **Set up proper error monitoring** (e.g., Sentry)
3. **Configure CORS** for your domain in Supabase
4. **Set up proper logging** for usage tracking
5. **Test webhook endpoints** thoroughly

## 📈 Monitoring

Monitor your app with:
- **Supabase Dashboard** - User growth, database usage
- **Stripe Dashboard** - Revenue, subscriptions, failed payments
- **Vercel Analytics** - Performance and usage metrics

## 🆘 Troubleshooting

### Common Issues:

1. **Webhook not working**:
   - Check webhook URL is correct
   - Verify webhook secret in environment variables
   - Check Stripe webhook logs

2. **Authentication issues**:
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure user profile creation trigger is working

3. **Usage limits not updating**:
   - Check `useUsageLimit` hook implementation
   - Verify database indexes
   - Check if user session is persisting

## 🎯 Next Steps

Consider adding:
- **Email notifications** for usage limits
- **Analytics dashboard** for admin users
- **Referral system** for user growth
- **Enterprise plans** with custom limits
- **API key management** for developers

---

Your Movie Recommender app now has a complete authentication, usage limiting, and payment system! 🎉
