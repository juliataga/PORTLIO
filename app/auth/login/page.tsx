// app/auth/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push(redirectTo)
      }
    }
    checkUser()
  }, [redirectTo, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        })

        if (error) throw error

        if (data.user && !data.session) {
          toast.success('Check your email for the confirmation link!')
          return
        }

        // Create user profile
        if (data.user) {
          await supabase.from('user_profiles').insert({
            user_id: data.user.id,
            full_name: name,
            email: email,
            plan_id: 'free',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
          })

          // Track signup event
          await supabase.from('user_events').insert({
            user_id: data.user.id,
            event_type: 'signup',
            event_data: { 
              source: 'direct',
              trial_started: true 
            }
          })

          toast.success('Welcome to Portlio! Your 14-day trial has started.')
          router.push('/onboarding')
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Track login event
        if (data.user) {
          await supabase.from('user_events').insert({
            user_id: data.user.id,
            event_type: 'login',
            event_data: { timestamp: new Date().toISOString() }
          })
        }

        toast.success('Welcome back!')
        router.push(redirectTo)
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
        }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="text-3xl font-bold text-slate-900 hover:opacity-80 transition-opacity mb-6"
          >
            Port<span className="text-indigo-600">lio</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-600">
            {isSignUp 
              ? 'Start your 14-day free trial today' 
              : 'Sign in to your Portlio account'
            }
          </p>
        </div>

        {/* Social Login */}
        <button
          onClick={handleGoogleAuth}
          className="w-full bg-white border border-slate-300 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors mb-6 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 text-slate-500">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
            />
            {isSignUp && (
              <p className="text-xs text-slate-500 mt-1">
                Must be at least 6 characters long
              </p>
            )}
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push('/auth/reset-password')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </div>
            ) : (
              isSignUp ? 'Start Free Trial' : 'Sign In'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-6">
          <p className="text-slate-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Features Preview for Sign Up */}
        {isSignUp && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">What you get with your free trial:</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                2 professional client portals
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                All premium features for 14 days
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Custom branding and analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                No credit card required
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

