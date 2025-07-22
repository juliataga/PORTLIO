// app/pricing/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { subscription, planLimits, upgrade } = useSubscription()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for trying out Portlio',
      features: [
        '2 active portals',
        'Basic templates',
        'Portlio branding',
        '50 client visits/month',
        'Email support',
        '14-day full access trial'
      ],
      cta: 'Get Started Free',
      popular: false,
      accent: 'from-slate-500 to-slate-600',
      limitations: ['Limited customization', 'Portlio branding']
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 29,
      yearlyPrice: 290, // 2 months free
      description: 'Great for freelancers and consultants',
      features: [
        '10 active portals',
        'Custom branding & colors',
        'Password protection',
        'Advanced analytics',
        '500 visits/month',
        'Priority support',
        'Custom domains',
        'Client notifications',
        'File upload limits: 100MB',
        'Export client data'
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
      accent: 'from-indigo-600 to-purple-600',
      mostPopularFor: 'Solo freelancers & consultants'
    },
    {
      id: 'agency',
      name: 'Agency',
      monthlyPrice: 79,
      yearlyPrice: 790, // 2 months free
      description: 'Perfect for growing agencies',
      features: [
        'Unlimited portals',
        'Team collaboration (5 seats)',
        'White-label options',
        'Advanced integrations',
        'Unlimited visits',
        'Dedicated support',
        'Custom development',
        'Priority features',
        'API access',
        'Advanced analytics dashboard',
        'Client success manager'
      ],
      cta: 'Start 14-Day Trial',
      popular: false,
      accent: 'from-purple-600 to-pink-600',
      mostPopularFor: 'Agencies & teams'
    }
  ]

  const currentPlan = planLimits?.plan_id || 'free'

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (planId === 'free') {
      router.push('/dashboard')
      return
    }

    if (planId === currentPlan) {
      toast.success('You\'re already on this plan!')
      return
    }

    setIsUpgrading(planId)
    try {
      await upgrade(planId)
    } catch (error) {
      toast.error('Failed to start upgrade process')
      setIsUpgrading(null)
    }
  }

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
    return price
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0
    const yearlyEquivalent = plan.monthlyPrice * 12
    return yearlyEquivalent - plan.yearlyPrice
  }

  const isCurrentPlan = (planId: string) => currentPlan === planId

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.push('/')} 
              className="text-2xl font-bold text-slate-900 hover:opacity-80 transition-opacity"
            >
              Port<span className="text-indigo-600">lio</span>
            </button>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => router.push('/')}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Home
              </button>
              {user ? (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/25"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/25"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-indigo-200">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            14-day free trial • No credit card required
          </div>

          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Simple, transparent
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your business. Start free, upgrade when you need more.
            All plans include our core features and 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
              Save 17%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const price = getPrice(plan)
            const savings = getSavings(plan)
            const isPlanCurrent = isCurrentPlan(plan.id)
            const isUpgradingThis = isUpgrading === plan.id

            return (
              <div 
                key={plan.name} 
                className={`relative bg-white rounded-3xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-indigo-200 shadow-indigo-900/10 scale-105 lg:scale-110' 
                    : 'border-slate-200/60 shadow-slate-900/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {isPlanCurrent && (
                  <div className="absolute -top-4 right-4 z-10">
                    <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <div className="p-8 lg:p-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-slate-900">${price}</span>
                      <span className="text-slate-600 ml-2 font-medium">
                        {plan.monthlyPrice === 0 ? 'forever' : `/${billingCycle === 'yearly' ? 'year' : 'month'}`}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && savings > 0 && (
                      <div className="text-emerald-600 font-medium text-sm mb-2">
                        Save ${savings}/year
                      </div>
                    )}
                    <p className="text-slate-600 leading-relaxed">{plan.description}</p>
                    {plan.mostPopularFor && (
                      <div className="mt-3 text-sm text-indigo-600 font-medium">
                        Best for: {plan.mostPopularFor}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <span className="text-slate-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations (for free plan) */}
                  {plan.limitations && (
                    <ul className="space-y-2 mb-8 pb-6 border-b border-slate-200">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <span className="text-slate-500 leading-relaxed text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA Button */}
                  <button 
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isPlanCurrent || isUpgradingThis}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
                      isPlanCurrent
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : plan.popular 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-600/25' 
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isUpgradingThis ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : isPlanCurrent ? (
                      'Current Plan'
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Need something custom?
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Enterprise plans available with custom integrations, dedicated support, and SLA guarantees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.open('mailto:sales@portlio.com?subject=Enterprise Inquiry')}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
              >
                Contact Sales
              </button>
              <button 
                onClick={() => window.open('https://cal.com/portlio/enterprise', '_blank')}
                className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Book a Demo
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about Portlio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Is there a setup fee?</h4>
              <p className="text-slate-600">No setup fees ever. You only pay the monthly or yearly subscription fee for your chosen plan.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">What happens after the trial?</h4>
              <p className="text-slate-600">After 14 days, you'll be automatically moved to the free plan unless you choose to upgrade. No credit card required for trial.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
              <p className="text-slate-600">Yes, we offer a 30-day money-back guarantee if you're not completely satisfied with your paid plan.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-slate-600">Absolutely. Cancel anytime with one click. Your account will remain active until the end of your billing cycle.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Do you offer team accounts?</h4>
              <p className="text-slate-600">Yes! The Agency plan includes 5 team seats. Need more? Contact us for custom enterprise pricing.</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div className="flex justify-center items-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">2,500+</div>
                <div className="text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">50,000+</div>
                <div className="text-slate-600">Portals Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">98%</div>
                <div className="text-slate-600">Customer Satisfaction</div>
              </div>
            </div>
            <p className="text-slate-600 italic">
              "Portlio has transformed how we onboard clients. What used to take days now happens in hours."
            </p>
            <p className="text-slate-500 text-sm mt-2">
              — Sarah Chen, Freelance Designer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}