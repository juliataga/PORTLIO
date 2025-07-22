// app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handling error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, planId } = session.metadata!
  
  if (!session.customer || !session.subscription) return

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Create user subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancel_at_period_end: false
    })

  if (error) {
    console.error('Failed to create subscription record:', error)
  }

  // Send welcome email
  await sendWelcomeEmail(userId, planId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  // Update subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'active',
      last_payment_date: new Date()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to update subscription status:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to update subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'canceled',
      canceled_at: new Date()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to cancel subscription:', error)
  }
}

async function sendWelcomeEmail(userId: string, planId: string) {
  // Get user email
  const { data: user } = await supabase.auth.admin.getUserById(userId)
  if (!user.user?.email) return

  // Send email using Resend or your email service
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@portlio.com',
        to: user.user.email,
        subject: `Welcome to Portlio ${planId === 'professional' ? 'Professional' : 'Agency'}!`,
        html: `
          <h1>Welcome to Portlio!</h1>
          <p>Thank you for upgrading to ${planId === 'professional' ? 'Professional' : 'Agency'}.</p>
          <p>You now have access to:</p>
          <ul>
            <li>Custom branding</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            ${planId === 'agency' ? '<li>Unlimited portals</li>' : ''}
          </ul>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Get Started</a>
        `
      }),
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}