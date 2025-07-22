'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Portal = {
  id: number
  title: string
  description: string
  slug: string
  is_published: boolean
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      await loadPortals(user.id)
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadPortals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('portals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading portals:', error)
      } else {
        setPortals(data || [])
      }
    } catch (error) {
      console.error('Error loading portals:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-slate-600">Loading your workspace...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Simple Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Port<span className="text-indigo-600">lio</span> Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Welcome, {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Portals</h2>
          <p className="text-slate-600">Manage your client onboarding portals</p>
        </div>

        {/* Create Portal Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Create New Portal
          </button>
        </div>

        {/* Portals List */}
        <div className="grid gap-6">
          {portals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No portals yet</h3>
              <p className="text-slate-600 mb-4">Create your first client onboarding portal to get started</p>
              <button
                onClick={() => router.push('/dashboard/create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Your First Portal
              </button>
            </div>
          ) : (
            portals.map((portal) => (
              <div key={portal.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{portal.title}</h3>
                    <p className="text-slate-600 mb-4">{portal.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>/{portal.slug}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        portal.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {portal.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/edit/${portal.id}`)}
                      className="text-indigo-600 hover:text-indigo-700 px-3 py-1 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {portal.is_published && (
                      <button
                        onClick={() => window.open(`/portal/${portal.slug}`, '_blank')}
                        className="text-slate-600 hover:text-slate-700 px-3 py-1 text-sm font-medium"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}