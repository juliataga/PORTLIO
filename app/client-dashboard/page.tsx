'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!clientProfile) {
        router.push('/dashboard')
        return
      }

      setProfile(clientProfile)

    } catch (error) {
      console.error('Error loading user:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-purple-600 font-medium">Loading your workspace...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Completely Different Header - Chat App Style */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile?.contact_person || user?.email?.split('@')[0] || 'Welcome'}
                </h1>
                <p className="text-purple-100 text-sm">Client Workspace</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat-Like Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Today's Tasks Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Tasks</h2>
              <p className="text-gray-500">What needs your attention</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">No active projects</h3>
                <p className="text-amber-600 text-sm">You'll see tasks here when freelancers invite you to projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - Chat Style */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-500">Your project conversations</p>
            </div>
          </div>

          {/* Chat-like empty state */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-sm">Your project updates and messages will appear here</p>
          </div>
        </div>

        {/* Getting Started - Completely Different Style */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h3 className="text-xl font-bold">Getting Started</h3>
            </div>
            <div className="space-y-3 text-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Freelancer creates your project</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Check email for invitation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Start collaborating!</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h3 className="text-xl font-bold">What You Can Do</h3>
            </div>
            <div className="space-y-3 text-green-100">
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span>Upload files securely</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💳</span>
                <span>Make payments easily</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>Chat with freelancers</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>Track project progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
            <div>
              <h3 className="font-bold text-purple-900">Account Setup Complete!</h3>
              <p className="text-purple-700">You're ready to receive project invitations from freelancers</p>
              <div className="mt-2 text-sm text-purple-600">
                Account type: <strong>Client</strong> • Email: <strong>{user?.email}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}