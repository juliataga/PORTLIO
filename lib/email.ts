// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private fromEmail = 'noreply@portlio.com'
  private supportEmail = 'support@portlio.com'

  async sendEmail(to: string, template: EmailTemplate) {
    try {
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Email send error:', error)
      throw error
    }
  }

  // Welcome email for new signups
  getWelcomeTemplate(name: string): EmailTemplate {
    return {
      subject: 'Welcome to Portlio! Your 14-day trial has started 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Portlio</title>
        </head>
        <body style="font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">
                Welcome to Portlio!
              </h1>
              <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">
                Your professional client portal platform
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 22px;">
                Hi ${name}! 👋
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                Thanks for signing up for Portlio! Your <strong>14-day free trial</strong> has started, 
                giving you full access to all premium features.
              </p>

              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px; font-size: 18px;">
                  What you can do during your trial:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569;">
                  <li style="margin-bottom: 8px;">Create unlimited professional client portals</li>
                  <li style="margin-bottom: 8px;">Customize with your branding and colors</li>
                  <li style="margin-bottom: 8px;">Collect payments and files from clients</li>
                  <li style="margin-bottom: 8px;">Track analytics and client engagement</li>
                  <li>Get priority support from our team</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Create Your First Portal
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

              <h3 style="color: #1e293b; margin: 0 0 15px; font-size: 18px;">
                Need help getting started?
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 8px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" style="color: #4f46e5; text-decoration: none;">
                    View our quick start guide
                  </a>
                </li>
                <li style="margin-bottom: 8px;">
                  <a href="mailto:${this.supportEmail}" style="color: #4f46e5; text-decoration: none;">
                    Email our support team
                  </a>
                </li>
                <li>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/examples" style="color: #4f46e5; text-decoration: none;">
                    Browse portal examples
                  </a>
                </li>
              </ul>

              <p style="margin: 25px 0 0; font-size: 16px; line-height: 1.6;">
                Thanks for choosing Portlio. We're excited to help you create amazing client experiences!
              </p>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px;">
                Best regards,<br>
                The Portlio Team
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                You're receiving this because you signed up for Portlio.
                <br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Portlio, ${name}!

        Your 14-day free trial has started. You now have full access to all premium features.

        What you can do:
        - Create unlimited professional client portals
        - Customize with your branding and colors
        - Collect payments and files from clients
        - Track analytics and client engagement

        Get started: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

        Need help? Email us at ${this.supportEmail}

        Thanks for choosing Portlio!
        The Portlio Team
      `
    }
  }

  // Trial ending reminder email (sent 3 days before trial ends)
  getTrialEndingTemplate(name: string, daysLeft: number): EmailTemplate {
    return {
      subject: `Your Portlio trial ends in ${daysLeft} days`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0;">
                ${daysLeft} days left in your trial
              </h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px;">Hi ${name},</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px;">
                Your Portlio trial ends in <strong>${daysLeft} days</strong>. Don't lose access to your professional client portals!
              </p>

              <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px;">What happens after your trial?</h3>
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  You'll be moved to the free plan (2 portals, basic features). 
                  Upgrade now to keep all your portals active with premium features.
                </p>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
                   style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
                  Upgrade Now
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: #e2e8f0; color: #475569; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Dashboard
                </a>
              </div>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px;">
                Questions? Reply to this email or contact us at ${this.supportEmail}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }

  // Payment successful email
  getPaymentSuccessTemplate(name: string, planName: string, amount: number): EmailTemplate {
    return {
      subject: 'Payment confirmed - Welcome to Portlio Pro! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0;">
                Payment Confirmed! 🎉
              </h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px;">Hi ${name},</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px;">
                Thank you for upgrading to <strong>Portlio ${planName}</strong>! 
                Your payment of <strong>$${amount}</strong> has been processed successfully.
              </p>

              <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 15px;">Your ${planName} features are now active:</h3>
                <ul style="color: #065f46; margin: 0; padding-left: 20px;">
                  ${planName === 'Professional' ? `
                    <li>10 active portals</li>
                    <li>Custom branding & colors</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                    <li>500 client visits/month</li>
                  ` : `
                    <li>Unlimited portals</li>
                    <li>Team collaboration</li>
                    <li>White-label options</li>
                    <li>Unlimited visits</li>
                    <li>Dedicated support</li>
                  `}
                </ul>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Access Your Dashboard
                </a>
              </div>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px;">
                Need help? Contact us at ${this.supportEmail}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }

  // Portal shared notification
  getPortalSharedTemplate(portalTitle: string, portalUrl: string, clientEmail: string): EmailTemplate {
    return {
      subject: `New client portal: ${portalTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0;">
                Your Project Portal is Ready! 📋
              </h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px;">Welcome to your project!</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px;">
                Your project portal "<strong>${portalTitle}</strong>" is now ready. 
                This secure portal contains everything you need for our project together.
              </p>

              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px;">What you can do in your portal:</h3>
                <ul style="color: #475569; margin: 0; padding-left: 20px;">
                  <li>Upload files and assets</li>
                  <li>Make secure payments</li>
                  <li>Track project progress</li>
                  <li>Communicate directly</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Access Your Portal
                </a>
              </div>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px;">
                Bookmark this link for easy access throughout our project.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

