
// API route for sending emails
// app/api/emails/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    let template
    switch (type) {
      case 'welcome':
        template = emailService.getWelcomeTemplate(data.name)
        break
      case 'trial_ending':
        template = emailService.getTrialEndingTemplate(data.name, data.daysLeft)
        break
      case 'payment_success':
        template = emailService.getPaymentSuccessTemplate(data.name, data.planName, data.amount)
        break
      case 'portal_shared':
        template = emailService.getPortalSharedTemplate(data.portalTitle, data.portalUrl, data.clientEmail)
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const result = await emailService.sendEmail(to, template)

    // Log email sent
    await supabase.from('email_logs').insert({
      email_type: type,
      recipient: to,
      subject: template.subject,
      status: 'sent',
      sent_at: new Date().toISOString(),
      data: data
    })

    return NextResponse.json({ success: true, messageId: result?.id })
  } catch (error) {
    console.error('Email send error:', error)
    
    // Log failed email
    await supabase.from('email_logs').insert({
      email_type: 'unknown',
      recipient: 'unknown',
      subject: 'Failed to send',
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      sent_at: new Date().toISOString()
    })

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Helper function to send emails from anywhere in the app
export async function sendEmail(type: string, to: string, data: any) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, to, data }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Email helper error:', error)
    throw error
  }
}