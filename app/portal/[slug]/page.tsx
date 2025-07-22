'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { 
  CheckCircle2, 
  Upload, 
  ExternalLink, 
  CreditCard, 
  FileText,
  Eye,
  Building
} from 'lucide-react'
import toast from 'react-hot-toast'

type ContentBlock = {
  id: number
  type: 'text' | 'payment' | 'upload' | 'link'
  title: string
  content: string
  block_order: number
  settings?: Record<string, any>
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

type UploadedFile = {
  id: number
  file_name: string
  file_size: number
  file_type: string
  created_at: string
  block_id?: number
}

export default function PublicPortalPage() {
  const [portal, setPortal] = useState<Portal | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    loadPortal()
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

      // Load uploaded files for this portal (simplified)
      try {
        const { data: filesData } = await supabase
          .from('uploaded_files')
          .select('*')
          .eq('portal_slug', slug)
          .order('created_at', { ascending: false })

        if (filesData) {
          setUploadedFiles(filesData)
        }
      } catch (err) {
        console.log('Could not load files:', err)
      }

    } catch (error) {
      console.error('Error loading portal:', error)
      setError('Failed to load portal')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, blockId: number) => {
    try {
      toast.loading('Uploading file...', { id: 'upload' })

      // Create file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `${slug}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portal-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload file to storage')
      }

      // Save file record to database with block_id
      try {
        const { data, error } = await supabase
          .from('uploaded_files')
          .insert({
            portal_slug: slug,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: filePath,
            block_id: blockId  // Associate with specific block
          })
          .select()
          .single()

        if (!error && data) {
          setUploadedFiles(prev => [data, ...prev])
        }
      } catch (dbError) {
        console.log('Database save failed, but file uploaded successfully')
      }

      setCompletedBlocks(prev => new Set([...prev, blockId]))
      toast.success('File uploaded successfully!', { id: 'upload' })

    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast.error(error.message || 'Failed to upload file', { id: 'upload' })
    }
  }

  const handlePaymentClick = async (blockId: number, paymentLink: string) => {
    setCompletedBlocks(prev => new Set([...prev, blockId]))
    
    if (paymentLink) {
      window.open(paymentLink, '_blank')
      toast.success('Redirecting to payment...')
    } else {
      toast.error('Payment link not configured')
    }
  }

  const handleLinkClick = async (blockId: number, url: string) => {
    setCompletedBlocks(prev => new Set([...prev, blockId]))
    
    if (url) {
      window.open(url, '_blank')
      toast.success('Opening link...')
    } else {
      toast.error('Link not configured')
    }
  }

  const getCompletionPercentage = () => {
    if (contentBlocks.length === 0) return 0
    const actionableBlocks = contentBlocks.filter(block => 
      ['payment', 'upload', 'link'].includes(block.type)
    )
    if (actionableBlocks.length === 0) return 100
    return Math.round((completedBlocks.size / actionableBlocks.length) * 100)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-medium text-slate-900">Loading your portal...</div>
        </div>
      </div>
    )
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Not Found</h1>
          <p className="text-slate-600 mb-6">
            This portal may not exist, has been unpublished, or the link is incorrect.
          </p>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{portal.title}</h1>
              <p className="text-slate-600 mt-1">{portal.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">{completionPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Content Blocks */}
        <div className="space-y-6">
          {contentBlocks.map((block, index) => (
            <div key={block.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
              {/* Block Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      completedBlocks.has(block.id)
                        ? 'bg-green-100 text-green-600'
                        : block.type === 'text'
                        ? 'bg-blue-100 text-blue-600'
                        : block.type === 'payment'
                        ? 'bg-emerald-100 text-emerald-600'
                        : block.type === 'upload'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {completedBlocks.has(block.id) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : block.type === 'text' ? (
                        <FileText className="w-5 h-5" />
                      ) : block.type === 'payment' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : block.type === 'upload' ? (
                        <Upload className="w-5 h-5" />
                      ) : (
                        <ExternalLink className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{block.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{block.content}</p>
                  </div>
                  {completedBlocks.has(block.id) && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Block Action Area */}
              <div className="px-6 pb-6">
                {block.type === 'payment' && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-emerald-900 mb-1">
                          Payment Required
                        </div>
                        <div className="text-xs text-emerald-700">
                          Amount: ${block.settings?.amount || '100'}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePaymentClick(block.id, block.settings?.payment_link)}
                        disabled={completedBlocks.has(block.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          completedBlocks.has(block.id)
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        {completedBlocks.has(block.id) ? 'Payment Clicked' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                )}

                {block.type === 'upload' && (
                  <div className="space-y-4">
                    {!completedBlocks.has(block.id) && (
                      <FileUploadZone
                        onFileUpload={(file) => handleFileUpload(file, block.id)}
                        maxFiles={block.settings?.max_files || 5}
                        acceptedTypes={block.settings?.accepted_types || 'pdf,jpg,png,doc,docx'}
                      />
                    )}
                    
                    {/* Show only files for this specific block */}
                    {(() => {
                      const blockFiles = uploadedFiles.filter(file => file.block_id === block.id)
                      return blockFiles.length > 0 && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                          <div className="text-sm font-medium text-purple-900 mb-3">
                            Uploaded Files ({blockFiles.length})
                          </div>
                          <div className="space-y-2">
                            {blockFiles.slice(0, 3).map((file) => (
                              <div key={file.id} className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-purple-600" />
                                </div>
                                <div className="flex-1 truncate">
                                  <div className="font-medium text-purple-900">{file.file_name}</div>
                                </div>
                                <div className="text-purple-600 text-xs">
                                  {formatFileSize(file.file_size)}
                                </div>
                              </div>
                            ))}
                            {blockFiles.length > 3 && (
                              <div className="text-xs text-purple-700 pt-2">
                                +{blockFiles.length - 3} more files
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {block.type === 'link' && (
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-orange-900 mb-1">
                          External Link
                        </div>
                        <div className="text-xs text-orange-700">
                          Click to open in new tab
                        </div>
                      </div>
                      <button
                        onClick={() => handleLinkClick(block.id, block.settings?.url)}
                        disabled={completedBlocks.has(block.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          completedBlocks.has(block.id)
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg'
                        }`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {completedBlocks.has(block.id) ? 'Visited' : (block.settings?.button_text || 'Open Link')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">All Done! 🎉</h3>
            <p className="text-green-100">
              You've completed all the required tasks. We'll be in touch soon!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building className="w-4 h-4" />
            Powered by Portlio
          </div>
          <p>Professional client onboarding made simple</p>
        </footer>
      </div>
    </div>
  )
}

// File Upload Component
function FileUploadZone({ 
  onFileUpload, 
  maxFiles, 
  acceptedTypes 
}: { 
  onFileUpload: (file: File) => void
  maxFiles: number
  acceptedTypes: string
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }

    const allowedTypes = acceptedTypes.split(',').map(type => type.trim().toLowerCase())
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return `File type not allowed. Accepted: ${acceptedTypes.toUpperCase()}`
    }

    return null
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const error = validateFile(file)
      
      if (error) {
        toast.error(error)
        return
      }

      setUploading(true)
      await onFileUpload(file)
      setUploading(false)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const error = validateFile(file)
      
      if (error) {
        toast.error(error)
        return
      }

      setUploading(true)
      await onFileUpload(file)
      setUploading(false)
    }
    e.target.value = ''
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
        uploading
          ? 'border-purple-400 bg-purple-50 cursor-wait'
          : dragActive 
          ? 'border-purple-400 bg-purple-50' 
          : 'border-purple-300 bg-purple-50 hover:border-purple-400 cursor-pointer'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={acceptedTypes.split(',').map(type => `.${type.trim()}`).join(',')}
        onChange={handleChange}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
      />
      
      <div className="space-y-3">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-purple-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-purple-900 mb-1">
            {uploading ? 'Uploading...' : 'Drop your file here or click to browse'}
          </p>
          <p className="text-sm text-purple-700">
            Accepted: {acceptedTypes.toUpperCase()} • Max {maxFiles} files • 10MB limit
          </p>
        </div>
      </div>
    </div>
  )
}