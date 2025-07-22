import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createCheckoutSession, PricingPlan } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { planId, successUrl, cancelUrl } = await request.json()

    // Validate input
    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, return a mock response until we set up full Stripe
    return NextResponse.json({ 
      sessionId: 'mock_session_id',
      url: '/pricing?message=stripe_setup_needed'
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}