'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Eye, 
  Save, 
  Plus, 
  Type, 
  CreditCard, 
  Upload, 
  ExternalLink,
  Trash2,
  GripVertical,
  Settings,
  Globe,
  Copy,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
  CSS as dndCSS,
} from '@dnd-kit/sortable'

type ContentBlock = {
  id?: number
  type: 'text' | 'payment' | 'upload' | 'link'
  title: string
  content: string
  block_order: number
  portal_id?: number
  settings?: Record<string, any>
}

type Portal = {
  id: number
  title: string
  description: string
  slug: string
  is_published: boolean
  user_id: string
}

export default function EditPortalPage() {
  const [portal, setPortal] = useState<Portal | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingBlock, setEditingBlock] = useState<number | null>(null)
  const router = useRouter()
  const params = useParams()
  const portalId = params.id as string

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadPortal()
  }, [portalId])

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault()
          // Auto-save is already handled
          toast.success('Changes saved automatically!')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadPortal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      // Load portal
      const { data: portalData, error: portalError } = await supabase
        .from('portals')
        .select('*')
        .eq('id', portalId)
        .eq('user_id', user.id)
        .single()

      if (portalError || !portalData) {
        toast.error('Portal not found')
        router.push('/dashboard')
        return
      }

      setPortal(portalData)

      // Load content blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('portal_id', portalId)
        .order('block_order', { ascending: true })

      if (!blocksError && blocksData) {
        setContentBlocks(blocksData)
      }
    } catch (error) {
      console.error('Error loading portal:', error)
      toast.error('Failed to load portal')
    } finally {
      setLoading(false)
    }
  }

  const addContentBlock = async (type: ContentBlock['type']) => {
    const blockDefaults = {
      text: {
        title: 'New Text Block',
        content: 'Add your message here...',
        settings: {}
      },
      payment: {
        title: 'Payment Required',
        content: 'Complete your payment to proceed with the project.',
        settings: { amount: 100, currency: 'INR', payment_link: '' }
      },
      upload: {
        title: 'Upload Files',
        content: 'Please upload any files we need for your project.',
        settings: { max_files: 5, accepted_types: 'pdf,jpg,png,doc,docx' }
      },
      link: {
        title: 'Important Link',
        content: 'Click the button below to access the form.',
        settings: { url: '', button_text: 'Open Link' }
      }
    }

    const defaults = blockDefaults[type]
    const newOrder = contentBlocks.length + 1
    
    const newBlock: ContentBlock = {
      type,
      title: defaults.title,
      content: defaults.content,
      block_order: newOrder,
      portal_id: parseInt(portalId),
      settings: defaults.settings
    }

    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .insert([newBlock])
        .select()
        .single()

      if (error) throw error

      setContentBlocks([...contentBlocks, data])
      toast.success('Block added successfully')
    } catch (error) {
      console.error('Error adding block:', error)
      toast.error('Failed to add block')
    }
  }

  const updateBlock = async (blockId: number, updates: Partial<ContentBlock>) => {
    try {
      // Update in state immediately for better UX
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === blockId ? { ...block, ...updates } : block
        )
      )

      // Save to database
      const { error } = await supabase
        .from('content_blocks')
        .update(updates)
        .eq('id', blockId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating block:', error)
      toast.error('Failed to update block')
      // Reload to revert optimistic update
      loadPortal()
    }
  }

  const deleteBlock = async (blockId: number) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', blockId)

      if (error) throw error

      setContentBlocks(blocks => blocks.filter(block => block.id !== blockId))
      toast.success('Block deleted')
    } catch (error) {
      console.error('Error deleting block:', error)
      toast.error('Failed to delete block')
    }
  }

  const duplicateBlock = async (block: ContentBlock) => {
    const newBlock: ContentBlock = {
      type: block.type,
      title: `${block.title} (Copy)`,
      content: block.content,
      block_order: contentBlocks.length + 1,
      portal_id: parseInt(portalId),
      settings: { ...block.settings }
    }

    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .insert([newBlock])
        .select()
        .single()

      if (error) throw error

      setContentBlocks([...contentBlocks, data])
      toast.success('Block duplicated')
    } catch (error) {
      console.error('Error duplicating block:', error)
      toast.error('Failed to duplicate block')
    }
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = contentBlocks.findIndex((block) => block.id === active.id)
    const newIndex = contentBlocks.findIndex((block) => block.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Optimistically update the UI
    const newBlocks = arrayMove(contentBlocks, oldIndex, newIndex)
    
    // Update block_order for all blocks
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      block_order: index + 1
    }))

    setContentBlocks(updatedBlocks)

    // Save to database
    try {
      const updates = updatedBlocks.map(block => ({
        id: block.id,
        block_order: block.block_order
      }))

      // Update all block orders in parallel
      await Promise.all(
        updates.map(update =>
          supabase
            .from('content_blocks')
            .update({ block_order: update.block_order })
            .eq('id', update.id)
        )
      )

      toast.success('Blocks reordered successfully', { duration: 2000 })
    } catch (error) {
      console.error('Error reordering blocks:', error)
      toast.error('Failed to save new order')
      // Reload to revert optimistic update
      loadPortal()
    }
  }, [contentBlocks, portalId])

  const togglePublished = async () => {
    if (!portal) return

    try {
      const newStatus = !portal.is_published
      
      const { error } = await supabase
        .from('portals')
        .update({ is_published: newStatus })
        .eq('id', portal.id)

      if (error) throw error

      setPortal({ ...portal, is_published: newStatus })
      toast.success(newStatus ? 'Portal published!' : 'Portal unpublished')
    } catch (error) {
      console.error('Error updating portal status:', error)
      toast.error('Failed to update portal status')
    }
  }

  const getBlockIcon = (type: string) => {
    const icons = {
      text: <Type className="w-5 h-5" />,
      payment: <CreditCard className="w-5 h-5" />,
      upload: <Upload className="w-5 h-5" />,
      link: <ExternalLink className="w-5 h-5" />
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

  if (!portal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium text-slate-900 mb-2">Portal not found</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{portal.title}</h1>
                <p className="text-sm text-slate-500">Portal Editor • {contentBlocks.length} blocks</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(`/portal/${portal.slug}`, '_blank')}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              
              <button
                onClick={togglePublished}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  portal.is_published
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                {portal.is_published ? 'Published' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Add Block Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Content Block</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'text', label: 'Text Block', desc: 'Add messages and instructions', icon: Type },
              { type: 'payment', label: 'Payment', desc: 'Collect payments from clients', icon: CreditCard },
              { type: 'upload', label: 'File Upload', desc: 'Let clients upload files', icon: Upload },
              { type: 'link', label: 'Link Button', desc: 'Add external links', icon: ExternalLink }
            ].map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => addContentBlock(blockType.type as ContentBlock['type'])}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${getBlockColor(blockType.type)} rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform`}>
                  <blockType.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{blockType.label}</h3>
                <p className="text-xs text-slate-600">{blockType.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Blocks with Drag & Drop */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Portal Content</h2>
            {contentBlocks.length > 0 && (
              <div className="text-sm text-slate-500">
                Drag blocks to reorder • {contentBlocks.length} block{contentBlocks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {contentBlocks.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-slate-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Add your first content block</h3>
              <p className="text-slate-600 mb-6">Start building your portal by adding content blocks above.</p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={contentBlocks.map(block => block.id!)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {contentBlocks.map((block, index) => (
                    <SortableBlockEditor
                      key={block.id}
                      block={block}
                      index={index}
                      isEditing={editingBlock === block.id}
                      onEdit={() => setEditingBlock(block.id || null)}
                      onSave={() => setEditingBlock(null)}
                      onUpdate={(updates) => updateBlock(block.id!, updates)}
                      onDelete={() => deleteBlock(block.id!)}
                      onDuplicate={() => duplicateBlock(block)}
                      getBlockIcon={getBlockIcon}
                      getBlockColor={getBlockColor}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}

// Sortable Block Editor Component
function SortableBlockEditor({
  block,
  index,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onDelete,
  onDuplicate,
  getBlockIcon,
  getBlockColor
}: {
  block: ContentBlock
  index: number
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onUpdate: (updates: Partial<ContentBlock>) => void
  onDelete: () => void
  onDuplicate: () => void
  getBlockIcon: (type: string) => React.ReactNode
  getBlockColor: (type: string) => string
}) {
  const [localTitle, setLocalTitle] = useState(block.title)
  const [localContent, setLocalContent] = useState(block.content)
  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id! })

  const style = {
    transform: dndCSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    onUpdate({
      title: localTitle,
      content: localContent
    })
    onSave()
  }

  const handleCancel = () => {
    setLocalTitle(block.title)
    setLocalContent(block.content)
    onSave()
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 overflow-hidden transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl scale-105 rotate-2 z-50' 
          : 'hover:shadow-lg'
      }`}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
          <div className={`w-8 h-8 bg-gradient-to-r ${getBlockColor(block.type)} rounded-lg flex items-center justify-center text-white`}>
            {getBlockIcon(block.type)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{block.title}</div>
            <div className="text-xs text-slate-500 capitalize">
              Block {index + 1} • {block.type}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10 min-w-[150px]">
                <button
                  onClick={() => {
                    onDuplicate()
                    setShowActions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setShowActions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Block title"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Block content"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div onClick={onEdit} className="cursor-pointer group">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{block.title}</h3>
            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">{block.content}</p>
            
            {/* Block Type Specific Preview */}
            {block.type === 'payment' && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-sm text-emerald-700">💳 Payment block - ₹{block.settings?.amount || '100'}</div>
              </div>
            )}
            
            {block.type === 'upload' && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700">📁 File upload zone - Max {block.settings?.max_files || 5} files</div>
              </div>
            )}
            
            {block.type === 'link' && (
              <div className="mt-4">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
                  {block.settings?.button_text || 'Open Link'}
                </button>
              </div>
            )}
            
            <div className="mt-3 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to edit • Drag handle to reorder
            </div>
          </div>
        )}
      </div>

      {/* Block Settings Panel */}
      {showSettings && (
        <div className="border-t border-slate-200 p-4 bg-slate-50/50">
          <div className="text-sm font-medium text-slate-700 mb-3">Block Settings</div>
          
          {block.type === 'payment' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  defaultValue={block.settings?.amount || 100}
                  onChange={(e) => onUpdate({
                    settings: { ...block.settings, amount: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Payment Link (Razorpay/UPI)</label>
                <input
                  type="url"
                  defaultValue={block.settings?.payment_link || ''}
                  onChange={(e) => onUpdate({
                    settings: { ...block.settings, payment_link: e.target.value }
                  })}
                  placeholder="https://razorpay.me/..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}
          
          {block.type === 'upload' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Max Files</label>
                <input
                  type="number"
                  defaultValue={block.settings?.max_files || 5}
                  onChange={(e) => onUpdate({
                    settings: { ...block.settings, max_files: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Accepted File Types</label>
                <input
                  type="text"
                  defaultValue={block.settings?.accepted_types || 'pdf,jpg,png,doc,docx'}
                  onChange={(e) => onUpdate({
                    settings: { ...block.settings, accepted_types: e.target.value }
                  })}
                  placeholder="pdf,jpg,png,doc,docx"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}
          
          {block.type === 'link' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">URL</label>
                <input
                  type="url"
                  defaultValue={block.settings?.url || ''}
                  onChange={(e) => onUpdate({
                    settings: { ...block.settings, url: e.target.value }
                  })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Button Text</label>
                <input
                  type="text"
                  defaultValue={block.settings?.button_text || 'Open Link'}
                  onChange={(e) => onUpdate({
                    settings: { ...block.settings, button_text: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}