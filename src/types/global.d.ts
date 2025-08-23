/// <reference types="react" />

// Global TypeScript declarations

// Stripe Pricing Table custom element
declare namespace JSX {
  interface IntrinsicElements {
    'stripe-pricing-table': {
      'pricing-table-id': string
      'publishable-key': string
      'customer-email'?: string
      'client-reference-id'?: string
    }
  }
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    STRIPE_SECRET_KEY: string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: string
  }
}
