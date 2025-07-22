import Link from 'next/link'
import { ArrowRight, CheckCircle2, Star, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-slate-900">
              Port<span className="text-indigo-600">lio</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 font-medium">
              Sign In
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-red-400 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">Trusted by 1,000+ freelancers</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Client onboarding
            <br />
            <span className="text-indigo-600">made simple</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create beautiful client portals in minutes. Collect payments, files, and approvals all in one place. 
            No more scattered emails or confusing processes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="text-slate-600 hover:text-slate-900 px-8 py-4 font-semibold">
              View Demo Portal
            </button>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">1,000+</div>
              <div className="text-sm text-slate-600">Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">25,000+</div>
              <div className="text-sm text-slate-600">Portals Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">$2M+</div>
              <div className="text-sm text-slate-600">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">4.9★</div>
              <div className="text-sm text-slate-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything you need to onboard clients professionally
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Stop losing clients to confusing processes. Create portals that actually convert.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Collect Everything</h3>
            <p className="text-slate-600 leading-relaxed">
              Payments, files, approvals, and forms all in one beautiful portal. No more scattered emails or missed requirements.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Client Experience</h3>
            <p className="text-slate-600 leading-relaxed">
              Your clients get a clean, professional experience that builds trust and makes you look like the expert you are.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <ArrowRight className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Launch in Minutes</h3>
            <p className="text-slate-600 leading-relaxed">
              Choose a template, customize your branding, and send the link. Your first portal can be live in under 5 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-xl text-slate-600">
            Start free, upgrade when you're ready to scale
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-slate-900 mb-1">Free</div>
              <p className="text-slate-600 mb-6">Perfect for trying out</p>
              
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">2 active portals</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">Basic templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">50 client visits/month</span>
                </li>
              </ul>

              <Link 
                href="/auth/login" 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 px-6 rounded-xl font-semibold transition-colors block text-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-indigo-600 rounded-2xl p-8 text-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-1">$29</div>
              <p className="text-indigo-200 mb-6">per month</p>
              
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Unlimited portals</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Custom branding</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>

              <Link 
                href="/auth/login" 
                className="w-full bg-white hover:bg-gray-100 text-indigo-600 py-3 px-6 rounded-xl font-semibold transition-colors block text-center"
              >
                Start 14-Day Trial
              </Link>
            </div>
          </div>

          {/* Agency Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Agency</h3>
              <div className="text-4xl font-bold text-slate-900 mb-1">$99</div>
              <p className="text-slate-600 mb-6">per month</p>
              
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">White-label options</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">Custom integrations</span>
                </li>
              </ul>

              <Link 
                href="/auth/login" 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 px-6 rounded-xl font-semibold transition-colors block text-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your client onboarding?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers and agencies who've already streamlined their process with Portlio.
          </p>
          <Link 
            href="/auth/login"
            className="bg-white hover:bg-gray-100 text-indigo-600 px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 transition-all hover:scale-105"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold mb-4 md:mb-0">
              Port<span className="text-indigo-400">lio</span>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-slate-400 hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white">
                Terms
              </Link>
              <Link href="/support" className="text-slate-400 hover:text-white">
                Support
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Portlio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}