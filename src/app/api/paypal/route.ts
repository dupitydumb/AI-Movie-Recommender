import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...body } = await req.json();

    switch (action) {
      case 'create-order':
        return await createPayPalOrder(body);
      case 'capture-order':
        return await capturePayPalOrder(body);
      case 'verify-payment':
        return await verifyPayment(body);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('PayPal API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createPayPalOrder(body: any) {
  const { planId } = body;
  
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // Get plan details
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const accessToken = await getPayPalAccessToken();

  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: plan.currency,
          value: plan.price.toString(),
        },
        description: `${plan.name} - ${plan.usage_limit} AI movie recommendations`,
      },
    ],
    application_context: {
      brand_name: 'Screenpick',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    },
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });

  const order = await response.json();

  if (response.ok) {
    return NextResponse.json({ orderId: order.id });
  } else {
    console.error('PayPal order creation failed:', order);
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
  }
}

async function capturePayPalOrder(body: any) {
  const { orderId } = body;
  
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const captureData = await response.json();

  if (response.ok) {
    return NextResponse.json(captureData);
  } else {
    console.error('PayPal order capture failed:', captureData);
    return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 500 });
  }
}

async function verifyPayment(body: any) {
  const { paymentId, planId } = body;
  
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // Get payment details from PayPal
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const paymentData = await response.json();

  if (!response.ok || paymentData.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  }

  // Get plan details
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // Create subscription
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: user.id,
      plan_id: planId,
      paypal_payment_id: paymentId,
      usage_remaining: plan.usage_limit,
      is_active: true,
    })
    .select()
    .single();

  if (subscriptionError) {
    console.error('Subscription creation error:', subscriptionError);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }

  // Record payment transaction
  const { error: transactionError } = await supabase
    .from('payment_transactions')
    .insert({
      user_id: user.id,
      paypal_payment_id: paymentId,
      paypal_payer_id: paymentData.payer?.payer_id,
      amount: plan.price,
      currency: plan.currency,
      status: 'completed',
      plan_id: planId,
      subscription_id: subscription.id,
    });

  if (transactionError) {
    console.error('Transaction recording error:', transactionError);
  }

  return NextResponse.json({ 
    success: true, 
    subscription,
    message: `Successfully purchased ${plan.name}! You now have ${plan.usage_limit} AI recommendations.` 
  });
}
