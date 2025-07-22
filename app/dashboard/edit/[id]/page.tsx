'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

type ContentBlock = {
  id?: number
  type: 'text' | 'payment' | 'upload' | 'link'
  title: string
  content: string
  block_order: number
  portal_id?: number
}

export default function EditPortalPage() {
  const [portal, setPortal] = useState<any>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const portalId = params.id as string

  useEffect(() => {
    loadPortal()
  }, [portalId])

  const loadPortal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Load portal
    const { data: portalData, error: portalError } = await supabase
      .from('portals')
      .select('*')
      .eq('id', portalId)
      .eq('user_id', user.id)
      .single()

    if (portalError || !portalData) {
      router.push('/dashboard')
      return
    }

    setPortal(portalData)

    // Load existing content blocks
    const { data: blocksData, error: blocksError } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('portal_id', portalId)
      .order('block_order', { ascending: true })

    if (!blocksError && blocksData && blocksData.length > 0) {
      setContentBlocks(blocksData)
    } else {
      // Create default blocks if none exist
      const defaultBlocks = [
        {
          type: 'text' as const,
          title: 'Welcome Message',
          content: 'Welcome to your project! Here\'s what we need to get started.',
          block_order: 1,
          portal_id: parseInt(portalId)
        },
        {
          type: 'payment' as const,
          title: 'Project Payment',
          content: 'Complete your project payment to move forward',
          block_order: 2,
          portal_id: parseInt(portalId)
        },
        {
          type: 'upload' as const,
          title: 'Upload Your Files',
          content: 'Please upload your brand assets, logos, and any materials.',
          block_order: 3,
          portal_id: parseInt(portalId)
        }
      ]
      
      // Save default blocks to database
      const { data: newBlocks, error: insertError } = await supabase
        .from('content_blocks')
        .insert(defaultBlocks)
        .select()

      if (!insertError && newBlocks) {
        setContentBlocks(newBlocks)
      }
    }
    
    setLoading(false)
  }

  const addContentBlock = async (type: ContentBlock['type']) => {
    const blockTitles = {
      text: 'New Text Block',
      payment: 'New Payment Block',
      upload: 'New Upload Block',
      link: 'New Link Block'
    }

    const newBlock: ContentBlock = {
      type,
      title: blockTitles[type],
      content: '',
      block_order: contentBlocks.length + 1,
      portal_id: parseInt(portalId)
    }

    // Save to database
    const { data, error } = await supabase
      .from('content_blocks')
      .insert([newBlock])
      .select()
      .single()

    if (!error && data) {
      setContentBlocks([...contentBlocks, data])
    }
  }

  const updateBlock = async (blockId: number, field: keyof ContentBlock, value: string | number) => {
    // Update in state immediately
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? { ...block, [field]: value } : block
      )
    )

    // Save to database
    await supabase
      .from('content_blocks')
      .update({ [field]: value })
      .eq('id', blockId)
  }

  const deleteBlock = async (blockId: number) => {
    // Delete from database
    const { error } = await supabase
      .from('content_blocks')
      .delete()
      .eq('id', blockId)

    if (!error) {
      setContentBlocks(blocks => blocks.filter(block => block.id !== blockId))
    }
  }

  const savePortal = async () => {
    setSaving(true)
    
    // All changes are already saved in real-time, so just show success
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
    
    // Show success message
    const successDiv = document.createElement('div')
    successDiv.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50'
    successDiv.textContent = 'Portal saved successfully!'
    document.body.appendChild(successDiv)
    setTimeout(() => {
      document.body.removeChild(successDiv)
    }, 3000)
  }

  const getBlockIcon = (type: string) => {
    const icons = {
      text: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      payment: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      upload: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      link: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    }
    return icons[type as keyof typeof icons] || icons.text
  }

  const getBlockColor = (type: string) => {
    const colors = {
      text: 'from-blue-500 to-blue-600',
      payment: 'from-emerald-500 to-emerald-600',
      upload: 'from-purple-500 to-purple-600',
      link: 'from-orange-500 to-orange-600'
    }
    return colors[type as keyof typeof colors] || colors.text
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-medium text-slate-900">Loading portal editor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {portal?.title}
                </h1>
                <p className="text-sm text-slate-600">Portal Builder</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.open(`/portal/${portal.slug}`, '_blank')}
                className="bg-slate-100 text-slate-900 px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button 
                onClick={savePortal}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/25 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save Portal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Add Content Blocks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Content Blocks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'text', label: 'Text Block', desc: 'Add welcome messages, instructions' },
              { type: 'payment', label: 'Payment Link', desc: 'Collect payments from clients' },
              { type: 'upload', label: 'File Upload', desc: 'Let clients upload files' },
              { type: 'link', label: 'Link Button', desc: 'Add external links or forms' }
            ].map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => addContentBlock(blockType.type as ContentBlock['type'])}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${getBlockColor(blockType.type)} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                  {getBlockIcon(blockType.type)}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{blockType.label}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{blockType.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Portal Content</h2>
          
          {contentBlocks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No content blocks yet</h3>
              <p className="text-slate-600">Add your first content block to start building your portal</p>
            </div>
          ) : (
            contentBlocks.map((block) => (
              <div key={block.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getBlockColor(block.type)} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                        {getBlockIcon(block.type)}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={block.title}
                          onChange={(e) => updateBlock(block.id!, 'title', e.target.value)}
                          className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 text-slate-900 placeholder-slate-500 w-full"
                          placeholder="Block title"
                        />
                        <div className="text-sm text-slate-500 capitalize mt-1">{block.type} Block</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteBlock(block.id!)}
                      className="opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <textarea
                    value={block.content || ''}
                    onChange={(e) => updateBlock(block.id!, 'content', e.target.value)}
                    placeholder={`Enter ${block.type} content...`}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500 resize-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}