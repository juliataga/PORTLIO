'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleEmailSubmit = () => {
    if (email) {
      setShowSuccess(true)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-slate-900">
              Port<span className="text-indigo-600">lio</span>
            </div>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/25"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-indigo-200">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Trusted by 1000+ agencies worldwide
          </div>

          <h1 className="text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Client onboarding
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              that converts
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create stunning onboarding experiences that wow your clients and streamline your workflow. 
            From contracts to payments, everything in one seamless portal.
          </p>
          
          {/* Email Capture */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="flex bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/60 p-2">
              <input 
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-transparent focus:outline-none text-slate-900 placeholder-slate-500"
              />
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-indigo-600/25 whitespace-nowrap"
              >
                Start Free Trial
              </button>
            </div>
          </div>

          {showSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl max-w-md mx-auto mb-8">
              <div className="flex items-center">
                <span className="w-5 h-5 bg-emerald-500 rounded-full mr-3 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                Thanks! We'll send you early access soon.
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              14-day free trial
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              No setup fees
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> succeed</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional tools designed to elevate your client relationships and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-900/5 border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Lightning Fast Setup</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create professional portals in under 5 minutes using our intuitive drag-and-drop builder and premium templates.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-900/5 border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Brand Perfect</h3>
                <p className="text-slate-600 leading-relaxed">
                  Fully customize colors, logos, and fonts to match your brand identity. White-label options available.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-900/5 border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Smart Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track client progress, engagement, and conversion rates with detailed insights and automated reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-400 mb-8">Trusted by agencies and freelancers worldwide</p>
          <div className="flex items-center justify-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-white">Agency+</div>
            <div className="text-2xl font-bold text-white">FreelanceHQ</div>
            <div className="text-2xl font-bold text-white">DesignCo</div>
            <div className="text-2xl font-bold text-white">WebStudio</div>
          </div>
        </div>
      </div>
    </div>
  )
}