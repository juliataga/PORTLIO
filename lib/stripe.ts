import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Pricing configuration
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    priceId: null,
    features: {
      portals: 2,
      visits: 50,
      customBranding: false,
      analytics: false,
      support: 'email'
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 29,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    features: {
      portals: 10,
      visits: 500,
      customBranding: true,
      analytics: true,
      support: 'priority'
    }
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 79,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    features: {
      portals: 'unlimited',
      visits: 'unlimited',
      customBranding: true,
      analytics: true,
      support: 'dedicated'
    }
  }
} as const

export type PricingPlan = keyof typeof PRICING_PLANS

// Helper functions
export const getPlan = (planId: PricingPlan) => PRICING_PLANS[planId]

export const createCheckoutSession = async (
  userId: string,
  planId: PricingPlan,
  successUrl: string,
  cancelUrl: string
) => {
  const plan = getPlan(planId)
  
  if (!plan.priceId) {
    throw new Error('Invalid plan for checkout')
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: undefined, // Will be filled by Stripe
    billing_address_collection: 'required',
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
  })

  return session
}

export const createPortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export const getSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}