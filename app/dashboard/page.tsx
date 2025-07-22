// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import toast from 'react-hot-toast'

type Portal = {
  id: number
  title: string
  description: string
  slug: string
  is_published: boolean
  created_at: string
  view_count: number
}

export default function Dashboard() {
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const { 
    subscription, 
    planLimits, 
    usage, 
    loading: subLoading,
    canCreatePortal,
    getUsagePercentage,
    upgrade 
  } = useSubscription()

  useEffect(() => {
    if (user && planLimits) {
      loadPortals()
    }
  }, [user, planLimits])

  const loadPortals = async () => {
    try {
      const { data, error } = await supabase
        .from('portals')
        .select(`
          id,
          title,
          description,
          slug,
          is_published,
          created_at,
          portal_analytics(count)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const portalsWithStats = data?.map(portal => ({
        ...portal,
        view_count: portal.portal_analytics?.length || 0
      })) || []

      setPortals(portalsWithStats)
    } catch (error) {
      console.error('Error loading portals:', error)
      toast.error('Failed to load portals')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePortal = () => {
    if (!canCreatePortal()) {
      toast.error(`You've reached your portal limit (${planLimits?.max_portals}). Upgrade to create more!`)
      return
    }
    router.push('/dashboard/create')
  }

  const handleUpgrade = async (planId: string) => {
    try {
      await upgrade(planId)
    } catch (error) {
      toast.error('Failed to start upgrade process')
    }
  }

  const copyPortalLink = (slug: string) => {
    const link = `${window.location.origin}/portal/${slug}`
    navigator.clipboard.writeText(link)
    toast.success('Portal link copied!')
  }

  const togglePortalStatus = async (portalId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portals')
        .update({ is_published: !currentStatus })
        .eq('id', portalId)

      if (error) throw error

      setPortals(prev => prev.map(p => 
        p.id === portalId ? { ...p, is_published: !currentStatus } : p
      ))

      toast.success(`Portal ${!currentStatus ? 'published' : 'unpublished'}`)
    } catch (error) {
      toast.error('Failed to update portal status')
    }
  }

  if (loading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-medium text-slate-900">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  const portalUsagePercent = getUsagePercentage('portals')
  const viewsUsagePercent = getUsagePercentage('views')
  const isNearPortalLimit = portalUsagePercent > 80
  const isNearViewLimit = viewsUsagePercent > 80

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-slate-900">
              Port<span className="text-indigo-600">lio</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/pricing')}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

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

        {/* Upgrade CTA - Show if on free plan */}
        {planLimits?.plan_id === 'free' && (
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Unlock Professional Features</h3>
                <p className="text-indigo-100 mb-4">Get custom branding, advanced analytics, and 10x more portals</p>
                <ul className="text-sm text-indigo-100 space-y-1">
                  <li>✨ Remove Portlio branding</li>
                  <li>📊 Advanced analytics dashboard</li>
                  <li>🎨 Custom colors and logos</li>
                  <li>🚀 10 portals + 500 monthly views</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">$29<span className="text-lg">/mo</span></div>
                <button 
                  onClick={() => handleUpgrade('professional')}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Warning */}
        {(isNearPortalLimit || isNearViewLimit) && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-lg">⚠️</span>
              </div>
              <h3 className="font-bold text-orange-900">Usage Limit Warning</h3>
            </div>
            <p className="text-orange-800 mb-4">
              {isNearPortalLimit && `You're using ${usage?.portals_created}/${planLimits?.max_portals} portals. `}
              {isNearViewLimit && `You've used ${usage?.monthly_views}/${planLimits?.max_monthly_views} monthly views. `}
              Consider upgrading to avoid service interruption.
            </p>
            <button 
              onClick={() => router.push('/pricing')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700"
            >
              View Upgrade Options
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Active Portals</div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{usage?.portals_created || 0}</div>
            <div className="text-sm text-slate-500">
              of {planLimits?.max_portals === 999999 ? '∞' : planLimits?.max_portals} limit
            </div>
            {planLimits?.max_portals !== 999999 && (
              <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(portalUsagePercent, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Monthly Views</div>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{usage?.monthly_views || 0}</div>
            <div className="text-sm text-slate-500">
              of {planLimits?.max_monthly_views === 999999 ? '∞' : planLimits?.max_monthly_views} limit
            </div>
            {planLimits?.max_monthly_views !== 999999 && (
              <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(viewsUsagePercent, 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Current Plan</div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 capitalize mb-1">
              {planLimits?.plan_id || 'Free'}
            </div>
            <button 
              onClick={() => router.push('/pricing')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {planLimits?.plan_id === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Files Uploaded</div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{usage?.files_uploaded || 0}</div>
            <div className="text-sm text-slate-500">Total this month</div>
          </div>
        </div>

        {/* Create Portal Button */}
        <div className="mb-8">
          <button
            onClick={handleCreatePortal}
            disabled={!canCreatePortal()}
            className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              canCreatePortal()
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-1'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {canCreatePortal() ? 'Create New Portal' : `Portal Limit Reached (${usage?.portals_created}/${planLimits?.max_portals})`}
          </button>
        </div>

        {/* Portals Grid */}
        {portals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Create Your First Portal</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Get started by creating a beautiful onboarding portal for your clients
            </p>
            <button
              onClick={handleCreatePortal}
              disabled={!canCreatePortal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Portal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <div
                key={portal.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {portal.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {portal.description}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    portal.is_published 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {portal.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{portal.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 12h8a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(portal.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/edit/${portal.id}`)}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => copyPortalLink(portal.slug)}
                    className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => togglePortalStatus(portal.id, portal.is_published)}
                    className={`px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                      portal.is_published
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {portal.is_published ? 'Unpublish' : 'Publish'}
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