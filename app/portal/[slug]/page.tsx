'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import FileUpload from '../../components/FileUpload'

type ContentBlock = {
  id: number
  type: 'text' | 'payment' | 'upload' | 'link'
  title: string
  content: string
  block_order: number
}

type Portal = {
  id: number
  title: string
  description: string
  slug: string
  is_published: boolean
  user_id: string
  created_at: string
}

type AnalyticsData = {
  totalViews: number
  completedTasks: number
  filesUploaded: number
  lastVisit: Date | null
}

export default function PublicPortalPage() {
  const [portal, setPortal] = useState<Portal | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set())
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    loadPortal()
    trackPageView()
  }, [slug])

  const loadPortal = async () => {
    try {
      // Load portal
      const { data: portalData, error: portalError } = await supabase
        .from('portals')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (portalError || !portalData) {
        setError('Portal not found or not published')
        setLoading(false)
        return
      }

      setPortal(portalData)

      // Load content blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('portal_id', portalData.id)
        .order('block_order', { ascending: true })

      if (!blocksError && blocksData) {
        setContentBlocks(blocksData)
      }

      // Load analytics data
      await loadAnalytics(portalData.id)
      
    } catch (error) {
      console.error('Error loading portal:', error)
      setError('Failed to load portal')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async (portalId: number) => {
    try {
      // Get total views
      const { count: viewCount } = await supabase
        .from('portal_analytics')
        .select('*', { count: 'exact' })
        .eq('portal_id', portalId)
        .eq('event_type', 'view')

      // Get uploaded files count
      const { count: fileCount } = await supabase
        .from('uploaded_files')
        .select('*', { count: 'exact' })
        .eq('portal_slug', slug)

      // Get last visit
      const { data: lastVisitData } = await supabase
        .from('portal_analytics')
        .select('created_at')
        .eq('portal_id', portalId)
        .eq('event_type', 'view')
        .order('created_at', { ascending: false })
        .limit(1)

      setAnalytics({
        totalViews: viewCount || 0,
        completedTasks: Math.floor(Math.random() * contentBlocks.length), // Mock for now
        filesUploaded: fileCount || 0,
        lastVisit: lastVisitData?.[0] ? new Date(lastVisitData[0].created_at) : null
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const trackPageView = async () => {
    if (!portal) return

    try {
      await supabase
        .from('portal_analytics')
        .insert({
          portal_id: portal.id,
          event_type: 'view',
          event_data: { 
            page: 'portal_view',
            timestamp: new Date().toISOString()
          },
          visitor_ip: null, // Could be populated server-side
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        })
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  const trackEvent = async (eventType: string, eventData: object) => {
    if (!portal) return

    try {
      await supabase
        .from('portal_analytics')
        .insert({
          portal_id: portal.id,
          event_type: eventType,
          event_data: eventData,
          visitor_ip: null,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  const handleFileUploaded = async (blockId: number, fileName: string, url: string) => {
    // Track file upload event
    await trackEvent('file_upload', {
      block_id: blockId,
      filename: fileName,
      file_url: url
    })

    // Mark block as completed
    setCompletedBlocks(prev => new Set(prev.add(blockId)))

    // Update analytics
    if (analytics) {
      setAnalytics({
        ...analytics,
        filesUploaded: analytics.filesUploaded + 1,
        completedTasks: Math.max(analytics.completedTasks, completedBlocks.size + 1)
      })
    }
  }

  const handlePaymentClick = async (blockId: number) => {
    await trackEvent('payment_click', {
      block_id: blockId,
      timestamp: new Date().toISOString()
    })

    // In production, redirect to Stripe checkout
    alert('Payment processing will be integrated with Stripe')
  }

  const handleLinkClick = async (blockId: number, url: string) => {
    await trackEvent('link_click', {
      block_id: blockId,
      url: url,
      timestamp: new Date().toISOString()
    })

    if (url && url !== '#') {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
    }
  }

  const renderContentBlock = (block: ContentBlock) => {
    const isCompleted = completedBlocks.has(block.id)

    switch (block.type) {
      case 'text':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{block.title}</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {block.content}
                </div>
              </div>
              {isCompleted && (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'payment':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{block.title}</h3>
                <p className="text-slate-700 mb-6 leading-relaxed">{block.content}</p>
                <button 
                  onClick={() => handlePaymentClick(block.id)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Complete Payment
                </button>
              </div>
              {isCompleted && (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'upload':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{block.title}</h3>
                <p className="text-slate-700 mb-6 leading-relaxed">{block.content}</p>
              </div>
              {isCompleted && (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <FileUpload 
              portalSlug={slug} 
              blockId={block.id}
              maxFiles={10}
              maxFileSize={10}
              onFileUploaded={(file) => handleFileUploaded(block.id, file.name, file.url)}
              onError={(error) => {
                console.error('Upload error:', error)
                // Show error notification
              }}
            />
          </div>
        )
      
      case 'link':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{block.title}</h3>
                <p className="text-slate-700 mb-6 leading-relaxed">{block.content}</p>
                <button 
                  onClick={() => handleLinkClick(block.id, block.content)}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg shadow-orange-600/25 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Link
                </button>
              </div>
              {isCompleted && (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-medium text-slate-900">Loading portal...</div>
        </div>
      </div>
    )
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Not Found</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  const progressPercentage = contentBlocks.length > 0 ? (completedBlocks.size / contentBlocks.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              {portal.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {portal.description}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/40">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-slate-600 font-medium">Your Progress</span>
            <span className="text-indigo-600 font-bold">{completedBlocks.size} of {contentBlocks.length} completed</span>
          </div>
          <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {analytics && (
            <div className="flex items-center gap-6 text-xs text-slate-500 mt-3">
              <span>👀 {analytics.totalViews} views</span>
              <span>📁 {analytics.filesUploaded} files uploaded</span>
              {analytics.lastVisit && (
                <span>🕐 Last visit: {analytics.lastVisit.toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {contentBlocks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-400 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Portal is being set up</h3>
              <p className="text-lg text-slate-600">Content will be available soon!</p>
            </div>
          ) : (
            contentBlocks.map((block, index) => (
              <div key={block.id} className="group">
                {renderContentBlock(block)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-400 mb-4">
            Powered by <span className="text-white font-semibold">Portlio</span>
          </p>
          <p className="text-xs text-slate-500">
            Create your own professional client portals at portlio.com
          </p>
        </div>
      </div>
    </div>
  )
}