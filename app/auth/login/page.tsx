'use client'

import { useState } from 'react'
import { useAuth, UserType } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [accountType, setAccountType] = useState<UserType>('freelancer')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { signInWithEmail, signUpWithEmail, redirectToDashboard } = useAuth()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    try {
 // Find this part in your handleAuth function:
      if (isLogin) {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
        // Don't manually redirect here - let useAuth handle it
      } else {
        // ... signup logic
        const { error } = await signUpWithEmail(email, password, accountType)
        if (error) throw error
        setMessage('Check your email for verification link!')
      }
    } catch (error: any) {
      setMessage(error.message)
    }
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="text-3xl font-bold text-slate-900 hover:opacity-80 transition-opacity mb-6"
          >
            Port<span className="text-indigo-600">lio</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-slate-600 leading-relaxed">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Join thousands of professionals using Portlio'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 p-8">
          <div className="space-y-6">
            {/* Account Type Selection (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('freelancer')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      accountType === 'freelancer'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Freelancer</div>
                    <div className="text-xs mt-1">Create client portals</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('client')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      accountType === 'client'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Client</div>
                    <div className="text-xs mt-1">Access my projects</div>
                  </button>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAuth}
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/25"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : `Create ${accountType === 'client' ? 'Client' : 'Freelancer'} Account`
              )}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl border ${
              message.includes('Check your email') 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {message.includes('Check your email') ? (
                  <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <span className="text-sm leading-relaxed">{message}</span>
              </div>
            </div>
          )}

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center">
            <span className="text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setMessage('')
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Features for Sign Up */}
        {!isLogin && accountType === 'client' && (
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/40">
            <h3 className="font-semibold text-slate-900 mb-3">As a client, you can:</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                Track all your projects in one place
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                Easily upload files and make payments
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                Communicate directly with freelancers
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}