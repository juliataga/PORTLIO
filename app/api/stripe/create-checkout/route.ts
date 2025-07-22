// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createCheckoutSession, PricingPlan } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { planId, successUrl, cancelUrl } = await request.json()

    // Get user from auth header
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Validate plan
    if (!['professional', 'agency'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Check if user already has active subscription
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      user.id,
      planId as PricingPlan,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

