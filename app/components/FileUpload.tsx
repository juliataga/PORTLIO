'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UploadedFile {
  id: string
  name: string
  size: number
  url: string
  uploadedAt: Date
}

interface FileUploadProps {
  portalSlug: string
  blockId: number
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  onFileUploaded?: (file: UploadedFile) => void
  onError?: (error: string) => void
}

export default function FileUpload({ 
  portalSlug, 
  blockId,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedTypes = ['*'],
  onFileUploaded,
  onError
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)

  // Load existing files function
  const loadExistingFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('portal-uploads')
        .list(`${portalSlug}/block-${blockId}`)

      if (error) {
        console.error('Error loading files:', error)
        return
      }

      if (data && data.length > 0) {
        const files = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = supabase.storage
              .from('portal-uploads')
              .getPublicUrl(`${portalSlug}/block-${blockId}/${file.name}`)

            return {
              id: file.id || file.name,
              name: file.name,
              size: file.metadata?.size || 0,
              url: urlData.publicUrl,
              uploadedAt: new Date(file.created_at || Date.now())
            }
          })
        )
        setUploadedFiles(files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  // Load existing files on mount
  useEffect(() => {
    loadExistingFiles()
  }, [portalSlug, blockId])

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type if restrictions exist
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*')) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const isValidType = acceptedTypes.some(type => 
        type === fileExtension || 
        file.type.startsWith(type.replace('*', ''))
      )
      
      if (!isValidType) {
        return `File type not allowed. Accepted: ${acceptedTypes.join(', ')}`
      }
    }

    // Check max files limit
    if (uploadedFiles.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${portalSlug}/block-${blockId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('portal-uploads')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portal-uploads')
      .getPublicUrl(filePath)

    // Try to save file record to database (optional)
    try {
      await supabase
        .from('uploaded_files')
        .insert({
          portal_slug: portalSlug,
          block_id: blockId,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          public_url: urlData.publicUrl
        })
    } catch (dbError) {
      console.warn('Failed to save file record to database:', dbError)
    }

    return {
      id: fileName,
      name: file.name,
      size: file.size,
      url: urlData.publicUrl,
      uploadedAt: new Date()
    }
  }

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // Validate each file
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        onError?.(error)
        showNotification(error, 'error')
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        setUploadProgress(((i + 1) / fileArray.length) * 100)
        
        const uploadedFile = await uploadFile(file)
        setUploadedFiles(prev => [...prev, uploadedFile])
        onFileUploaded?.(uploadedFile)
      }
      
      showNotification('Files uploaded successfully!', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onError?.(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const deleteFile = async (fileId: string) => {
    try {
      // Remove from local state
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
      showNotification('File removed', 'success')
    } catch (error) {
      showNotification('Failed to remove file', 'error')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Simple notification system
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 ${
      type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
    }`
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragOver
            ? 'border-purple-500 bg-purple-50/80 scale-105'
            : uploading
            ? 'border-purple-300 bg-purple-50/50'
            : 'border-purple-300 bg-purple-50/30 hover:bg-purple-50/50 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && document.getElementById(`file-input-${blockId}`)?.click()}
      >
        <input
          id={`file-input-${blockId}`}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
          accept={acceptedTypes.includes('*') ? undefined : acceptedTypes.join(',')}
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          {uploading ? (
            <div className="w-full max-w-xs">
              <p className="text-slate-600 mb-3">Uploading files...</p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500 mt-2">{Math.round(uploadProgress)}%</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 mb-2 text-lg">
                {dragOver ? 'Drop files here!' : 'Drag and drop files here or click to browse'}
              </p>
              <p className="text-sm text-slate-500">
                Maximum {maxFiles} files, up to {maxFileSize}MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="group flex items-center justify-between bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => deleteFile(file.id)}
                    className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}