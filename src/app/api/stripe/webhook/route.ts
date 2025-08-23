import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Error handling webhook' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('Handling checkout session completed:', session.id)
  
  // Get user ID from client_reference_id (set in pricing table)
  const userId = session.client_reference_id
  
  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  try {
    // Update user subscription status
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_type: 'premium',
        subscription_status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_expires_at: session.subscription ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days for one-time payments
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) {
      console.error('Error updating user subscription:', userError)
      return
    }

    // Log the payment
    if (session.amount_total) {
      await supabase
        .from('payments')
        .insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency,
          status: 'succeeded',
        })
    }

    console.log(`Successfully activated premium subscription for user ${userId}`)
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  console.log('Handling subscription update:', subscription.id)
  
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single()

    if (!user) {
      console.error('No user found for customer:', subscription.customer)
      return
    }

    const subscriptionStatus = subscription.status
    const subscriptionType = subscriptionStatus === 'active' ? 'premium' : 'free'
    const expiresAt = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null
    
    const { error } = await supabase
      .from('users')
      .update({
        subscription_type: subscriptionType,
        subscription_status: subscriptionStatus,
        stripe_subscription_id: subscription.id,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    console.log(`Updated subscription for user ${user.id}: ${subscriptionType} (${subscriptionStatus})`)
  } catch (error) {
    console.error('Error in handleSubscriptionUpdate:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single()

  if (user) {
    await supabase
      .from('users')
      .update({
        subscription_type: 'free',
        subscription_status: 'inactive',
        subscription_expires_at: null,
      })
      .eq('id', user.id)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single()

  if (user) {
    await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
      })
  }
}

async function handlePaymentFailed(invoice: any) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single()

  if (user) {
    await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
      })
  }
}
