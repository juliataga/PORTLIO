'use client'

import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: 'forever',
      description: 'Perfect for trying out Portlio',
      features: [
        '2 active portals',
        'Basic templates',
        'Portlio branding',
        '50 client visits/month',
        'Email support'
      ],
      cta: 'Get Started Free',
      popular: false,
      accent: 'from-slate-500 to-slate-600'
    },
    {
      name: 'Professional',
      price: '29',
      period: 'per month',
      description: 'Great for freelancers and consultants',
      features: [
        '10 active portals',
        'Custom branding',
        'Password protection',
        'Advanced analytics',
        '500 visits/month',
        'Priority support',
        'Custom domains'
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
      accent: 'from-indigo-600 to-purple-600'
    },
    {
      name: 'Agency',
      price: '79',
      period: 'per month',
      description: 'Perfect for growing agencies',
      features: [
        'Unlimited portals',
        'Team collaboration',
        'White-label options',
        'Advanced integrations',
        'Unlimited visits',
        'Dedicated support',
        'Custom development',
        'Priority features'
      ],
      cta: 'Start 14-Day Trial',
      popular: false,
      accent: 'from-purple-600 to-pink-600'
    }
  ]

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
              <button 
                onClick={() => router.push('/auth/login')}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/25"
              >
                Sign In
              </button>
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
          
          <p className="text-xl text-slate-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your business. Start free, upgrade when you need more.
            All plans include our core features and 14-day free trial.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
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
              
              <div className="p-8 lg:p-10">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-600 ml-2 font-medium">{plan.period}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{plan.description}</p>
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

                {/* CTA Button */}
                <button 
                  onClick={() => router.push('/auth/login')}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-600/25' 
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Need something custom?
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Enterprise plans available with custom integrations, dedicated support, and SLA guarantees.
            </p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
            >
              Contact Sales
            </button>
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
              <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Is there a setup fee?</h4>
              <p className="text-slate-600">No setup fees ever. You only pay the monthly subscription fee for your chosen plan.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">What happens after the trial?</h4>
              <p className="text-slate-600">After 14 days, you'll be automatically moved to the free plan unless you choose to upgrade.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
              <p className="text-slate-600">Yes, we offer a 30-day money-back guarantee if you're not completely satisfied.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}