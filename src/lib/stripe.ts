import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Stripe Pricing Table Configuration
export const STRIPE_CONFIG = {
  PRICING_TABLE_ID: 'prctbl_1RzHo584fHm6r9gn7cvZSrIq',
  PUBLISHABLE_KEY: 'pk_test_51RzGsQ84fHm6r9gn2lQSEcVhv8HtbaqNVPFLQQ47Sul7vI33ujFw7ByiYlqj3j3PwT6dBgDD2FhqEnAM6Z9BbG93005Ult3vTU'
}
