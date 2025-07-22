'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [portals, setPortals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        loadPortals(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  const loadPortals = async (userId: string) => {
    const { data, error } = await supabase
      .from('portals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPortals(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deletePortal = async (portalId: string) => {
    if (confirm('Are you sure you want to delete this portal?')) {
      const { error } = await supabase
        .from('portals')
        .delete()
        .eq('id', portalId)

      if (!error) {
        setPortals(portals.filter(p => p.id !== portalId))
      }
    }
  }

  const togglePublish = async (portalId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('portals')
      .update({ is_published: !currentStatus })
      .eq('id', portalId)

    if (!error) {
      setPortals(portals.map(p => 
        p.id === portalId ? { ...p, is_published: !currentStatus } : p
      ))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-medium text-slate-900">Loading your dashboard...</div>
        </div>
      </div>
    )
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
            <div className="flex items-center gap-6">
              <div className="text-slate-600">
                Welcome back, <span className="font-semibold text-slate-900">{user?.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Your Client <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Portals</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Create and manage professional onboarding experiences for your clients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Total Portals</div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{portals.length}</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Published</div>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{portals.filter(p => p.is_published).length}</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Drafts</div>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{portals.filter(p => !p.is_published).length}</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">This Month</div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{portals.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length}</div>
          </div>
        </div>

        {/* Create Portal Button */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/dashboard/create')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl shadow-indigo-600/25 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Portal
          </button>
        </div>

        {/* Portals Grid */}
        {portals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No portals yet</h3>
            <p className="text-lg text-slate-600 mb-8">Create your first client portal to get started</p>
            <button 
              onClick={() => router.push('/dashboard/create')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-600/25"
            >
              Create Your First Portal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {portals.map((portal) => (
              <div key={portal.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {portal.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {portal.description || 'No description provided'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    portal.is_published 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {portal.is_published ? 'Live' : 'Draft'}
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-6 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(portal.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push(`/dashboard/edit/${portal.id}`)}
                    className="flex-1 bg-slate-100 text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Edit
                  </button>
                  {portal.is_published && (
                    <button 
                      onClick={() => window.open(`/portal/${portal.slug}`, '_blank')}
                      className="flex-1 bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl hover:bg-emerald-200 transition-colors font-medium text-sm"
                    >
                      View Live
                    </button>
                  )}
                  <button 
                    onClick={() => togglePublish(portal.id, portal.is_published)}
                    className={`px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                      portal.is_published 
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {portal.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button 
                    onClick={() => deletePortal(portal.id)}
                    className="bg-red-100 text-red-700 px-3 py-2.5 rounded-xl hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}